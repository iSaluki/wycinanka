import { Hono } from 'hono';
import { getLesson, lessonCardIds } from '../../content/course';
import { applyLesson, applyReviews, emptyState, emptyTouched, ProgressError, toRow } from '../../shared/engine';
import { isPlausibleToday } from '../../shared/progress';
import { importSchema, lessonResultSchema, reviewBatchSchema, settingsSchema } from '../../shared/schemas';
import type { AppEnv } from '../env';
import { bodyLimit, HttpError, readJson } from '../http';
import { requireUser } from '../session';
import { loadState, parseSettings, saveStatements, snapshot } from '../store';

export const progress = new Hono<AppEnv>();
progress.use('*', requireUser);

const WEEK = 7 * 86_400_000;
/** How far back guest progress kept on a device may go. */
const GUEST_MAX_AGE = 365 * 86_400_000;

/** Results saved while offline may arrive up to a week late. */
const LATE = WEEK;

function checkDay(day: string, now: number) {
  if (!isPlausibleToday(day, now)) throw new HttpError(400, "The date sent doesn't match today. Check your device's clock.");
}

/** When something happened, if the device says so: never in the future, never more than a week ago. */
function checkWhen(at: number | undefined, now: number): number {
  if (at === undefined) return now;
  if (at < now - LATE || at > now + 5 * 60_000) throw new HttpError(400, 'That result is too old to save.');
  return at;
}

progress.get('/', async (c) => c.json(await snapshot(c.env.DB, c.get('user'))));

progress.put('/settings', async (c) => {
  const user = c.get('user');
  const patch = await readJson(c, settingsSchema);
  const merged = { ...parseSettings(user.settings), ...patch };
  await c.env.DB.prepare('UPDATE users SET settings = ?1 WHERE id = ?2').bind(JSON.stringify(merged), user.id).run();
  return c.json({ settings: merged });
});

progress.post('/lesson', async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const result = await readJson(c, lessonResultSchema);
  const at = checkWhen(result.at, now);
  checkDay(result.day, at);
  const lesson = getLesson(result.lessonId);
  if (!lesson) throw new HttpError(404, 'That lesson does not exist.');

  const db = c.env.DB;
  const state = await loadState(db, user.id, { cardIds: lessonCardIds(lesson), lessonIds: [lesson.id], days: [result.day] });
  // Sent again after a lost connection: it has already been counted, so report the state as it is.
  const seen = result.key
    ? await db.prepare('SELECT 1 FROM sync_keys WHERE user_id = ?1 AND key = ?2').bind(user.id, result.key).first()
    : null;
  if (seen) {
    const l = state.lessons.get(lesson.id);
    return c.json({
      score: l?.best ?? 0,
      xp: 0,
      added: 0,
      duplicate: true,
      lesson: l,
      cards: lessonCardIds(lesson).filter((id) => state.cards.has(id)).map((id) => toRow(id, state.cards.get(id)!)),
      day: { day: result.day, ...(state.activity.get(result.day) ?? { xp: 0, lessons: 0, reviews: 0 }) },
    });
  }
  const touched = emptyTouched();
  let outcome;
  try {
    outcome = applyLesson(state, touched, result, at);
  } catch (e) {
    if (e instanceof ProgressError) throw new HttpError(400, e.message);
    throw e;
  }
  const stmts = saveStatements(db, user.id, state, touched);
  // In the same transaction, so a result is either counted and remembered or neither.
  if (result.key) stmts.push(db.prepare('INSERT INTO sync_keys (user_id, key, created_at) VALUES (?1, ?2, ?3)').bind(user.id, result.key, now));
  await db.batch(stmts);
  return c.json({
    ...outcome,
    lesson: state.lessons.get(lesson.id),
    cards: [...touched.cards].map((id) => toRow(id, state.cards.get(id)!)),
    day: { day: result.day, ...state.activity.get(result.day)! },
  });
});

progress.post('/reviews', async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const { day, reviews } = await readJson(c, reviewBatchSchema);
  for (const r of reviews) {
    if (r.at < now - LATE || r.at > now + 5 * 60_000) throw new HttpError(400, 'A review has an impossible time.');
  }
  // Reviews saved while offline arrive later: their day must match when they were done, not now.
  checkDay(day, Math.max(...reviews.map((r) => r.at)));
  const db = c.env.DB;
  const ids = [...new Set(reviews.map((r) => r.cardId))];
  const state = await loadState(db, user.id, { cardIds: ids, lessonIds: [], days: [day] });
  const touched = emptyTouched();
  let outcome;
  try {
    outcome = applyReviews(state, touched, reviews.map((r) => ({ ...r, day })));
  } catch (e) {
    if (e instanceof ProgressError) throw new HttpError(400, e.message);
    throw e;
  }
  const stmts = saveStatements(db, user.id, state, touched);
  if (stmts.length) await db.batch(stmts);
  return c.json({
    ...outcome,
    cards: [...touched.cards].map((id) => toRow(id, state.cards.get(id)!)),
    day: state.activity.has(day) ? { day, ...state.activity.get(day)! } : null,
  });
});

/** One-time import of a guest session into a brand-new account. */
progress.post('/import', bodyLimit(512 * 1024), async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const input = await readJson(c, importSchema);
  const db = c.env.DB;

  const existing = await db
    .prepare('SELECT (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ?1) + (SELECT COUNT(*) FROM cards WHERE user_id = ?1) AS n')
    .bind(user.id)
    .first<{ n: number }>();
  if ((existing?.n ?? 0) > 0) throw new HttpError(409, 'This account already has progress, so nothing was imported.');

  // Guest progress is kept on the learner's device, so it can be months old, but each entry's day must match
  // the moment it was done (so a streak can't be back-filled with made-up days) and nothing can be in the future.
  const entries = [...input.lessons, ...input.reviews];
  for (const e of entries) {
    if (e.at < now - GUEST_MAX_AGE || e.at > now + 5 * 60_000) throw new HttpError(400, 'Imported progress has an impossible time.');
    if (!isPlausibleToday(e.day, e.at)) throw new HttpError(400, "Imported progress has a date that doesn't match its time.");
  }

  const state = emptyState();
  const touched = emptyTouched();
  try {
    // Replay in the order it happened, lessons and reviews interleaved.
    const events = [
      ...input.lessons.map((l) => ({ at: l.at, run: () => applyLesson(state, touched, l, l.at) })),
      ...input.reviews.map((r) => ({ at: r.at, run: () => applyReviews(state, touched, [r]) })),
    ].sort((a, b) => a.at - b.at);
    for (const e of events) e.run();
  } catch (e) {
    if (e instanceof ProgressError) throw new HttpError(400, e.message);
    throw e;
  }
  const stmts = saveStatements(db, user.id, state, touched);
  const settings = JSON.stringify({ ...parseSettings(user.settings), ...input.settings });
  if (input.settings) stmts.push(db.prepare('UPDATE users SET settings = ?1 WHERE id = ?2').bind(settings, user.id));
  if (stmts.length) await db.batch(stmts);
  return c.json(await snapshot(db, { ...user, settings }));
});

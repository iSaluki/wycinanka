import { Hono } from 'hono';
import { getLesson, lessonCardIds } from '../../content/course';
import { applyLesson, applyReviews, emptyState, emptyTouched, ProgressError, toRow } from '../../shared/engine';
import { addDays, isoDay, isPlausibleToday } from '../../shared/progress';
import { importSchema, lessonResultSchema, reviewBatchSchema, settingsSchema } from '../../shared/schemas';
import type { AppEnv } from '../env';
import { bodyLimit, HttpError, readJson } from '../http';
import { requireUser } from '../session';
import { loadState, parseSettings, saveStatements, snapshot } from '../store';

export const progress = new Hono<AppEnv>();
progress.use('*', requireUser);

const WEEK = 7 * 86_400_000;

function checkDay(day: string, now: number) {
  if (!isPlausibleToday(day, now)) throw new HttpError(400, "The date sent doesn't match today. Check your device's clock.");
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
  checkDay(result.day, now);
  const lesson = getLesson(result.lessonId);
  if (!lesson) throw new HttpError(404, 'That lesson does not exist.');

  const db = c.env.DB;
  const state = await loadState(db, user.id, { cardIds: lessonCardIds(lesson), lessonIds: [lesson.id], days: [result.day] });
  const touched = emptyTouched();
  let outcome;
  try {
    outcome = applyLesson(state, touched, result, now);
  } catch (e) {
    if (e instanceof ProgressError) throw new HttpError(400, e.message);
    throw e;
  }
  await db.batch(saveStatements(db, user.id, state, touched));
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
  checkDay(day, now);
  for (const r of reviews) {
    if (r.at < now - WEEK || r.at > now + 5 * 60_000) throw new HttpError(400, 'A review has an impossible time.');
  }
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
progress.post('/import', bodyLimit(128 * 1024), async (c) => {
  const user = c.get('user');
  const now = Date.now();
  const input = await readJson(c, importSchema);
  const db = c.env.DB;

  const existing = await db
    .prepare('SELECT (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ?1) + (SELECT COUNT(*) FROM cards WHERE user_id = ?1) AS n')
    .bind(user.id)
    .first<{ n: number }>();
  if ((existing?.n ?? 0) > 0) throw new HttpError(409, 'This account already has progress, so nothing was imported.');

  // Guest progress only lives for one browser session, so anything older than two days is not genuine.
  const oldest = addDays(isoDay(new Date(now)), -2);
  const latest = isoDay(new Date(now + 14 * 3_600_000));
  for (const d of [...input.lessons.map((l) => l.day), ...input.reviews.map((r) => r.day)]) {
    if (d < oldest || d > latest) throw new HttpError(400, 'Imported progress must be from the last two days.');
  }
  const times = [...input.lessons.map((l) => l.at), ...input.reviews.map((r) => r.at)];
  for (const t of times) if (t < now - 3 * 86_400_000 || t > now + 5 * 60_000) throw new HttpError(400, 'Imported progress has an impossible time.');

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

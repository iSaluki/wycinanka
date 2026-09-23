import { emptyState, fromRow, toRow, type ProgressState, type Touched } from '../shared/engine';
import type { CardRow, Settings, Snapshot } from '../shared/schemas';

/**
 * D1 persistence for progress. Lists are passed as a single JSON parameter and expanded with
 * json_each(), so one statement handles any number of rows (D1 allows at most 100 bound parameters).
 */

interface DbCard {
  card_id: string;
  due: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2;
  last_review: number;
}

const cardFromDb = (r: DbCard): CardRow => ({
  cardId: r.card_id,
  due: r.due,
  stability: r.stability,
  difficulty: r.difficulty,
  reps: r.reps,
  lapses: r.lapses,
  state: r.state,
  last: r.last_review,
});

export async function loadState(
  db: D1Database,
  userId: string,
  want: { cardIds: string[]; lessonIds: string[]; days: string[] },
): Promise<ProgressState> {
  const state = emptyState();
  const [cards, lessons, days] = await db.batch([
    db
      .prepare('SELECT * FROM cards WHERE user_id = ?1 AND card_id IN (SELECT value FROM json_each(?2))')
      .bind(userId, JSON.stringify(want.cardIds)),
    db
      .prepare(
        'SELECT lesson_id, best_score, completions, completed_at FROM lesson_progress WHERE user_id = ?1 AND lesson_id IN (SELECT value FROM json_each(?2))',
      )
      .bind(userId, JSON.stringify(want.lessonIds)),
    db
      .prepare('SELECT day, xp, lessons, reviews FROM activity WHERE user_id = ?1 AND day IN (SELECT value FROM json_each(?2))')
      .bind(userId, JSON.stringify(want.days)),
  ]);
  for (const r of cards.results as unknown as DbCard[]) state.cards.set(r.card_id, fromRow(cardFromDb(r)));
  for (const r of lessons.results as Array<{ lesson_id: string; best_score: number; completions: number; completed_at: number }>) {
    state.lessons.set(r.lesson_id, { best: r.best_score, completions: r.completions, at: r.completed_at });
  }
  for (const r of days.results as Array<{ day: string; xp: number; lessons: number; reviews: number }>) {
    state.activity.set(r.day, { xp: r.xp, lessons: r.lessons, reviews: r.reviews });
  }
  return state;
}

export function saveStatements(db: D1Database, userId: string, state: ProgressState, touched: Touched): D1PreparedStatement[] {
  const out: D1PreparedStatement[] = [];
  if (touched.cards.size) {
    const rows = [...touched.cards].map((id) => toRow(id, state.cards.get(id)!));
    out.push(
      db
        .prepare(
          `INSERT INTO cards (user_id, card_id, due, stability, difficulty, reps, lapses, state, last_review)
           SELECT ?1, j.value ->> 'cardId', j.value ->> 'due', j.value ->> 'stability', j.value ->> 'difficulty',
                  j.value ->> 'reps', j.value ->> 'lapses', j.value ->> 'state', j.value ->> 'last'
             FROM json_each(?2) AS j WHERE true
           ON CONFLICT (user_id, card_id) DO UPDATE SET
             due = excluded.due, stability = excluded.stability, difficulty = excluded.difficulty, reps = excluded.reps,
             lapses = excluded.lapses, state = excluded.state, last_review = excluded.last_review`,
        )
        .bind(userId, JSON.stringify(rows)),
    );
  }
  if (touched.lessons.size) {
    const rows = [...touched.lessons].map((id) => ({ id, ...state.lessons.get(id)! }));
    out.push(
      db
        .prepare(
          `INSERT INTO lesson_progress (user_id, lesson_id, best_score, completions, completed_at)
           SELECT ?1, j.value ->> 'id', j.value ->> 'best', j.value ->> 'completions', j.value ->> 'at'
             FROM json_each(?2) AS j WHERE true
           ON CONFLICT (user_id, lesson_id) DO UPDATE SET
             best_score = excluded.best_score, completions = excluded.completions, completed_at = excluded.completed_at`,
        )
        .bind(userId, JSON.stringify(rows)),
    );
  }
  if (touched.days.size) {
    const rows = [...touched.days].map((day) => ({ day, ...state.activity.get(day)! }));
    out.push(
      db
        .prepare(
          `INSERT INTO activity (user_id, day, xp, lessons, reviews)
           SELECT ?1, j.value ->> 'day', j.value ->> 'xp', j.value ->> 'lessons', j.value ->> 'reviews'
             FROM json_each(?2) AS j WHERE true
           ON CONFLICT (user_id, day) DO UPDATE SET xp = excluded.xp, lessons = excluded.lessons, reviews = excluded.reviews`,
        )
        .bind(userId, JSON.stringify(rows)),
    );
  }
  return out;
}

export function parseSettings(raw: string): Settings {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as Settings) : {};
  } catch {
    return {};
  }
}

export async function snapshot(db: D1Database, user: { id: string; username: string; createdAt: number; settings: string }): Promise<Snapshot> {
  const [lessons, cards, activity] = await db.batch([
    db.prepare('SELECT lesson_id, best_score, completions, completed_at FROM lesson_progress WHERE user_id = ?1').bind(user.id),
    db.prepare('SELECT * FROM cards WHERE user_id = ?1').bind(user.id),
    db.prepare('SELECT day, xp, lessons, reviews FROM activity WHERE user_id = ?1 ORDER BY day DESC LIMIT 400').bind(user.id),
  ]);
  const lessonMap: Snapshot['lessons'] = {};
  for (const r of lessons.results as Array<{ lesson_id: string; best_score: number; completions: number; completed_at: number }>) {
    lessonMap[r.lesson_id] = { best: r.best_score, completions: r.completions, at: r.completed_at };
  }
  return {
    user: { username: user.username, createdAt: user.createdAt },
    settings: parseSettings(user.settings),
    lessons: lessonMap,
    cards: (cards.results as unknown as DbCard[]).map(cardFromDb),
    activity: activity.results as Snapshot['activity'],
  };
}

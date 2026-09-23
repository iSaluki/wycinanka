import { getLesson, isCardId, lessonCardIds } from '../content/course';
import { newCard, review, type Card, type Rating } from './fsrs';
import { lessonScore, lessonXp, REVIEW_XP } from './progress';
import type { CardRow, LessonResult, ReviewInput } from './schemas';

/**
 * Pure progress rules, used by the Worker (authoritative, for accounts) and the browser (guests).
 * Callers load whatever subset of state they need into a ProgressState and write back `touched` rows.
 */

export interface LessonRecord {
  best: number;
  completions: number;
  at: number;
}

export interface DayRecord {
  xp: number;
  lessons: number;
  reviews: number;
}

export interface ProgressState {
  lessons: Map<string, LessonRecord>;
  cards: Map<string, Card>;
  activity: Map<string, DayRecord>;
}

export interface Touched {
  lessons: Set<string>;
  cards: Set<string>;
  days: Set<string>;
}

export const emptyState = (): ProgressState => ({ lessons: new Map(), cards: new Map(), activity: new Map() });
export const emptyTouched = (): Touched => ({ lessons: new Set(), cards: new Set(), days: new Set() });

function bumpDay(state: ProgressState, touched: Touched, day: string, delta: Partial<DayRecord>) {
  const cur = state.activity.get(day) ?? { xp: 0, lessons: 0, reviews: 0 };
  state.activity.set(day, {
    xp: cur.xp + (delta.xp ?? 0),
    lessons: cur.lessons + (delta.lessons ?? 0),
    reviews: cur.reviews + (delta.reviews ?? 0),
  });
  touched.days.add(day);
}

export class ProgressError extends Error {}

/**
 * Record a finished lesson. New words and sentences enter the review deck, rated "Good",
 * or "Hard" if the learner missed them during the lesson. Cards already in the deck keep their schedule.
 */
export function applyLesson(state: ProgressState, touched: Touched, r: LessonResult, now: number) {
  const lesson = getLesson(r.lessonId);
  if (!lesson) throw new ProgressError('Unknown lesson');
  const ids = lessonCardIds(lesson);
  const idSet = new Set(ids);
  const missed = new Set(r.missed);
  for (const m of missed) if (!idSet.has(m)) throw new ProgressError('Missed item is not part of this lesson');

  const score = lessonScore(r.correct, r.total);
  const xp = lessonXp(score);
  const prev = state.lessons.get(r.lessonId);
  state.lessons.set(r.lessonId, {
    best: Math.max(prev?.best ?? 0, score),
    completions: (prev?.completions ?? 0) + 1,
    at: now,
  });
  touched.lessons.add(r.lessonId);

  let added = 0;
  for (const id of ids) {
    if (state.cards.has(id)) continue;
    state.cards.set(id, review(newCard(now), missed.has(id) ? 2 : 3, now));
    touched.cards.add(id);
    added++;
  }
  bumpDay(state, touched, r.day, { xp, lessons: 1 });
  return { score, xp, added };
}

/**
 * Apply review ratings in time order. A rating older than the card's last review is ignored,
 * which makes re-sent batches harmless.
 */
export function applyReviews(state: ProgressState, touched: Touched, reviews: Array<ReviewInput & { day: string }>) {
  let applied = 0;
  const byDay = new Map<string, number>();
  for (const rv of [...reviews].sort((a, b) => a.at - b.at)) {
    if (!isCardId(rv.cardId)) throw new ProgressError('Unknown card');
    const card = state.cards.get(rv.cardId) ?? newCard(rv.at);
    if (card.last && rv.at <= card.last) continue;
    state.cards.set(rv.cardId, review(card, rv.rating as Rating, rv.at));
    touched.cards.add(rv.cardId);
    byDay.set(rv.day, (byDay.get(rv.day) ?? 0) + 1);
    applied++;
  }
  for (const [day, n] of byDay) bumpDay(state, touched, day, { xp: n * REVIEW_XP, reviews: n });
  return { applied, xp: applied * REVIEW_XP };
}

export const toRow = (cardId: string, c: Card): CardRow => ({
  cardId,
  due: c.due,
  stability: c.stability,
  difficulty: c.difficulty,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  last: c.last,
});

export const fromRow = (r: CardRow): Card => ({
  due: r.due,
  stability: r.stability,
  difficulty: r.difficulty,
  reps: r.reps,
  lapses: r.lapses,
  state: r.state,
  last: r.last,
});

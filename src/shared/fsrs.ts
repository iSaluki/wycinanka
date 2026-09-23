/**
 * FSRS-5 spaced-repetition scheduler.
 *
 * Memory is modelled by stability S (days until recall probability falls to 90%)
 * and difficulty D (1–10). See https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
 * Shared by the Worker (authoritative) and the browser (guest mode).
 */

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export const CardState = { New: 0, Review: 1, Relearning: 2 } as const;
export type CardState = (typeof CardState)[keyof typeof CardState];

export interface Card {
  /** Due time, ms since epoch. */
  due: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: CardState;
  /** Last review, ms since epoch (0 if never). */
  last: number;
}

const W = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11,
  0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
] as const;

const DECAY = -0.5;
const FACTOR = 19 / 81;
export const DESIRED_RETENTION = 0.9;
const MAX_INTERVAL_DAYS = 3650;
const RELEARN_MINUTES = 10;
const DAY = 86_400_000;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

export function intervalDays(stability: number, retention = DESIRED_RETENTION): number {
  const raw = (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
  return clamp(Math.round(raw), 1, MAX_INTERVAL_DAYS);
}

const initialStability = (g: Rating) => W[g - 1];
const initialDifficulty = (g: Rating) => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);

function nextDifficulty(d: number, g: Rating): number {
  const delta = -W[6] * (g - 3);
  const damped = d + (delta * (10 - d)) / 9;
  const reverted = W[7] * initialDifficulty(4) + (1 - W[7]) * damped;
  return clamp(reverted, 1, 10);
}

function stabilityAfterSuccess(d: number, s: number, r: number, g: Rating): number {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  const alpha = 1 + (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy * Math.exp(W[8]);
  return s * alpha;
}

function stabilityAfterFailure(d: number, s: number, r: number): number {
  const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
  return Math.min(sf, s);
}

function stabilitySameDay(s: number, g: Rating): number {
  return s * Math.exp(W[17] * (g - 3 + W[18]));
}

export function newCard(now: number): Card {
  return { due: now, stability: 0, difficulty: 0, reps: 0, lapses: 0, state: CardState.New, last: 0 };
}

/** Apply one review with rating `g` at time `now` and return the updated card. Pure. */
export function review(card: Card, g: Rating, now: number): Card {
  let { stability: s, difficulty: d } = card;
  const lapses = card.lapses + (g === 1 && card.state !== CardState.New ? 1 : 0);

  if (card.state === CardState.New || s <= 0) {
    s = initialStability(g);
    d = initialDifficulty(g);
  } else {
    const elapsed = Math.max(0, (now - card.last) / DAY);
    if (elapsed < 1) {
      s = stabilitySameDay(s, g);
    } else {
      const r = retrievability(elapsed, s);
      s = g === 1 ? stabilityAfterFailure(d, s, r) : stabilityAfterSuccess(d, s, r, g);
    }
    d = nextDifficulty(d, g);
  }
  s = clamp(s, 0.01, 36500);

  const state = g === 1 ? CardState.Relearning : CardState.Review;
  const due = g === 1 ? now + RELEARN_MINUTES * 60_000 : now + intervalDays(s) * DAY;

  return { due, stability: s, difficulty: d, reps: card.reps + 1, lapses, state, last: now };
}

/**
 * Turn an answer outcome into a rating. The learner never has to self-grade;
 * "Easy" is only given when they choose it on the review screen.
 */
export function ratingFromOutcome(outcome: 'correct' | 'close' | 'wrong'): Rating {
  if (outcome === 'wrong') return 1;
  if (outcome === 'close') return 2;
  return 3;
}

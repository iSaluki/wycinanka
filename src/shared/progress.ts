/** XP, streak and date rules shared by the Worker and the browser. */

export const LESSON_BASE_XP = 10;
export const REVIEW_XP = 1;

export function lessonScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(correct, total) / total) * 100);
}

/**
 * Below this, a lesson has been got through rather than learnt: getting on for a third of it was missed or
 * needed help. The lesson still counts as done — nothing is ever locked — but it is marked as worth another go,
 * and the finish screen offers a second pass over what was missed while it is still fresh.
 */
export const MASTERY = 70;

/** 10 XP for finishing, up to 10 more for accuracy. */
export function lessonXp(score: number): number {
  return LESSON_BASE_XP + Math.round(Math.max(0, Math.min(100, score)) / 10);
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The learner's local calendar day, as YYYY-MM-DD. */
export function localDay(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDay(d);
}

/**
 * Accept a client-supplied local day only if it is plausible for "now" somewhere on Earth
 * (UTC−12 … UTC+14), so a streak cannot be back-filled.
 */
export function isPlausibleToday(day: string, now: number): boolean {
  const earliest = isoDay(new Date(now - 12 * 3_600_000));
  const latest = isoDay(new Date(now + 14 * 3_600_000));
  return day >= earliest && day <= latest;
}

/** Consecutive days with activity, ending today (or yesterday, so a streak survives until midnight). */
export function streak(activeDays: Iterable<string>, today: string): number {
  const set = new Set(activeDays);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

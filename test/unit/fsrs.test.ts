import { describe, expect, it } from 'vitest';
import { CardState, intervalDays, newCard, retrievability, review, type Card } from '../../src/shared/fsrs';

const DAY = 86_400_000;
const t0 = Date.UTC(2026, 0, 1);

describe('FSRS', () => {
  it('retrievability is 90% after exactly one stability period', () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5);
    expect(retrievability(0, 5)).toBe(1);
  });

  it('interval equals stability at 90% desired retention', () => {
    expect(intervalDays(10)).toBe(10);
    expect(intervalDays(0.2)).toBe(1);
  });

  it('first ratings give increasing stability: Again < Hard < Good < Easy', () => {
    const s = ([1, 2, 3, 4] as const).map((g) => review(newCard(t0), g, t0).stability);
    expect(s[0]).toBeLessThan(s[1]);
    expect(s[1]).toBeLessThan(s[2]);
    expect(s[2]).toBeLessThan(s[3]);
  });

  it('a failed first review is due again in ten minutes', () => {
    const c = review(newCard(t0), 1, t0);
    expect(c.state).toBe(CardState.Relearning);
    expect(c.due - t0).toBe(10 * 60_000);
  });

  it('successful reviews on time push intervals out', () => {
    let c: Card = review(newCard(t0), 3, t0);
    let prevInterval = 0;
    let now = t0;
    for (let i = 0; i < 5; i++) {
      now = c.due;
      c = review(c, 3, now);
      const interval = (c.due - now) / DAY;
      expect(interval).toBeGreaterThan(prevInterval);
      prevInterval = interval;
    }
    expect(c.reps).toBe(6);
    expect(c.lapses).toBe(0);
  });

  it('forgetting a mature card cuts stability and counts a lapse', () => {
    let c = review(newCard(t0), 3, t0);
    c = review(c, 3, c.due);
    c = review(c, 3, c.due);
    const before = c.stability;
    const lapsed = review(c, 1, c.due);
    expect(lapsed.stability).toBeLessThan(before);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.difficulty).toBeGreaterThan(c.difficulty);
  });

  it('difficulty stays within 1..10', () => {
    let c = review(newCard(t0), 1, t0);
    for (let i = 0; i < 20; i++) c = review(c, 1, c.due + DAY);
    expect(c.difficulty).toBeLessThanOrEqual(10);
    let e = review(newCard(t0), 4, t0);
    for (let i = 0; i < 20; i++) e = review(e, 4, e.due);
    expect(e.difficulty).toBeGreaterThanOrEqual(1);
  });
});

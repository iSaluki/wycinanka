import { describe, expect, it } from 'vitest';
import { AWAY_MS, answeredSlowly, budgetMs } from '../../src/shared/pace';

describe('telling recall from a struggle', () => {
  const tap = { how: 'pick' as const, length: 12, options: 4 };
  const typed = { how: 'type' as const, length: 11 };

  it('gives a tapped answer a few seconds and a typed one longer', () => {
    expect(budgetMs(typed)).toBeGreaterThan(budgetMs(tap));
    expect(answeredSlowly(tap, 2_000)).toBe(false);
    expect(answeredSlowly(typed, 4_000)).toBe(false);
  });

  it('allows more time for a longer answer and for more options to read', () => {
    expect(budgetMs({ how: 'type', length: 40 })).toBeGreaterThan(budgetMs({ how: 'type', length: 5 }));
    expect(budgetMs({ how: 'pick', length: 12, options: 4 })).toBeGreaterThan(budgetMs({ how: 'pick', length: 12, options: 2 }));
    expect(budgetMs({ how: 'build', length: 20, options: 6 })).toBeGreaterThan(budgetMs({ how: 'build', length: 8, options: 2 }));
  });

  it('allows extra time when something has to be listened to first', () => {
    expect(budgetMs({ ...typed, audio: true })).toBeGreaterThan(budgetMs(typed));
    expect(budgetMs({ ...tap, audio: true })).toBeGreaterThan(budgetMs(tap));
  });

  it('counts a clear struggle as one', () => {
    expect(answeredSlowly(tap, budgetMs(tap) + 1_000)).toBe(true);
    expect(answeredSlowly(typed, budgetMs(typed) + 1_000)).toBe(true);
  });

  it('treats being away from the screen as an interruption, not as hesitation', () => {
    // Nobody spends two minutes recalling one word: the tab was in the background, or the phone rang.
    expect(answeredSlowly(tap, AWAY_MS)).toBe(false);
    expect(answeredSlowly(tap, 10 * 60_000)).toBe(false);
  });

  it('is generous enough that an unhurried reader is never called slow', () => {
    // Reading a four-option question and thinking it over for five seconds is normal, not a struggle.
    expect(answeredSlowly({ how: 'pick', length: 30, options: 4 }, 5_000)).toBe(false);
    // Typing a Polish sentence on a phone, reaching for the accent bar as you go.
    expect(answeredSlowly({ how: 'type', length: 28 }, 15_000)).toBe(false);
  });
});

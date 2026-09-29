import { describe, expect, it } from 'vitest';
import { cardIdsForWord, LESSONS } from '../../src/content/course';
import { FREQUENCY } from '../../src/content/frequency';
import { BADGES, badgeStates, badgeStats, bestStreak, earnedBadges } from '../../src/shared/badges';
import { applyLesson, applyReviews, emptyState, emptyTouched } from '../../src/shared/engine';
import { settingsSchema } from '../../src/shared/schemas';

describe('badges', () => {
  it('have unique ids that settings can store, and reachable targets', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    for (const b of BADGES) {
      expect(b.target, b.id).toBeGreaterThan(0);
      expect(settingsSchema.safeParse({ badges: { [b.id]: 1 } }).success, b.id).toBe(true);
    }
    // The level badges together cover every lesson.
    const levels = BADGES.filter((b) => ['alphabet', 'level-a1', 'level-a2', 'level-b1'].includes(b.id));
    expect(levels.reduce((n, b) => n + b.target, 0)).toBe(LESSONS.length);
    expect(BADGES.find((b) => b.id === 'all-lessons')!.target).toBe(LESSONS.length);
  });

  it('finds the longest run of practice days, wherever it is', () => {
    expect(bestStreak([])).toBe(0);
    expect(bestStreak(['2026-09-01'])).toBe(1);
    expect(bestStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-10', '2026-09-11'])).toBe(3);
    // Across a month end.
    expect(bestStreak(['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02'])).toBe(4);
  });

  it('earns nothing on a fresh start, and "first step" with the first lesson', () => {
    const p = emptyState();
    expect(earnedBadges(p)).toEqual([]);
    applyLesson(p, emptyTouched(), { lessonId: LESSONS[0].id, correct: 5, total: 5, missed: [], day: '2026-09-01' }, 1);
    expect(earnedBadges(p)).toEqual(expect.arrayContaining(['first-lesson', 'perfect']));
    expect(earnedBadges(p)).not.toContain('lessons-10');
    const ten = badgeStates(p).find((s) => s.badge.id === 'lessons-10')!;
    expect(ten).toMatchObject({ value: 1, earned: false });
  });

  it('counts streaks, reviews and the most frequent words from progress', () => {
    const p = emptyState();
    for (let d = 1; d <= 7; d++) {
      const day = `2026-09-0${d}`;
      applyLesson(p, emptyTouched(), { lessonId: LESSONS[d].id, correct: 4, total: 5, missed: [], day }, d * 86_400_000);
    }
    applyReviews(
      p,
      emptyTouched(),
      FREQUENCY.slice(0, 3).map((w, i) => ({ cardId: w.id, rating: 3 as const, at: 9 * 86_400_000 + i, day: '2026-09-09' })),
    );
    const s = badgeStats(p);
    expect(s.bestStreak).toBe(7);
    // A word of the 500 that a lesson also teaches counts as learnt from that lesson: the frequency deck never
    // teaches it a second time, so the badge has to see it under either card or "all 500 words" is unreachable.
    const fromLessons = FREQUENCY.filter((w) => !p.cards.has(w.id) && cardIdsForWord(w).some((id) => p.cards.has(id)));
    expect(fromLessons.length, 'the first units teach words that are also in the 500').toBeGreaterThan(0);
    expect(s.words).toBe(3 + fromLessons.length);
    expect(s.reviews).toBe(3);
    expect(s.perfect).toBe(0);
    expect(earnedBadges(p)).toEqual(expect.arrayContaining(['streak-3', 'streak-7']));
  });
});

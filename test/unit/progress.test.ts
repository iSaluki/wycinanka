import { describe, expect, it } from 'vitest';
import { addDays, isPlausibleToday, lessonScore, lessonXp, streak } from '../../src/shared/progress';
import { passwordProblem } from '../../src/shared/password';
import { applyLesson, applyReviews, emptyState, emptyTouched } from '../../src/shared/engine';
import { LESSONS, lessonCardIds } from '../../src/content/course';
import { BANDS, bandFailed, isRight, placementResult, PLACEMENT } from '../../src/content/placement';
import { unitByKey } from '../../src/content/course';

describe('xp and streaks', () => {
  it('scores and rewards lessons', () => {
    expect(lessonScore(9, 10)).toBe(90);
    expect(lessonXp(100)).toBe(20);
    expect(lessonXp(0)).toBe(10);
  });

  it('counts a streak ending today or yesterday', () => {
    const days = ['2026-03-01', '2026-03-02', '2026-03-03'];
    expect(streak(days, '2026-03-03')).toBe(3);
    expect(streak(days, '2026-03-04')).toBe(3);
    expect(streak(days, '2026-03-05')).toBe(0);
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('only accepts plausible local days', () => {
    const now = Date.UTC(2026, 5, 15, 12);
    expect(isPlausibleToday('2026-06-15', now)).toBe(true);
    expect(isPlausibleToday('2026-06-16', now)).toBe(true);
    expect(isPlausibleToday('2026-06-13', now)).toBe(false);
  });
});

describe('password policy', () => {
  it('enforces length, common passwords and username', () => {
    expect(passwordProblem('short', 'ann')).toBe('too-short');
    expect(passwordProblem('qwertyuiop', 'ann')).toBe('common');
    expect(passwordProblem('my-name-is-annabel', 'annabel')).toBe('contains-username');
    expect(passwordProblem('correct horse battery', 'ann')).toBeNull();
  });
});

describe('progress engine', () => {
  const now = Date.UTC(2026, 5, 15, 12);
  const lesson = LESSONS[0];

  it('adds a lesson\'s items to the deck, rating missed ones Hard', () => {
    const state = emptyState();
    const touched = emptyTouched();
    const ids = lessonCardIds(lesson);
    const out = applyLesson(state, touched, { lessonId: lesson.id, correct: 8, total: 10, missed: [ids[0]], day: '2026-06-15' }, now);
    expect(out.added).toBe(ids.length);
    expect(state.cards.get(ids[0])!.stability).toBeLessThan(state.cards.get(ids[1])!.stability);
    expect(state.activity.get('2026-06-15')).toEqual({ xp: out.xp, lessons: 1, reviews: 0 });
  });

  it('does not reset cards when a lesson is repeated', () => {
    const state = emptyState();
    applyLesson(state, emptyTouched(), { lessonId: lesson.id, correct: 10, total: 10, missed: [], day: '2026-06-15' }, now);
    const before = state.cards.get(lessonCardIds(lesson)[0]);
    const t2 = emptyTouched();
    const again = applyLesson(state, t2, { lessonId: lesson.id, correct: 5, total: 10, missed: [], day: '2026-06-15' }, now + 1000);
    expect(again.added).toBe(0);
    expect(state.cards.get(lessonCardIds(lesson)[0])).toBe(before);
    expect(state.lessons.get(lesson.id)).toMatchObject({ best: 100, completions: 2 });
  });

  it('rejects missed ids that are not in the lesson', () => {
    expect(() =>
      applyLesson(emptyState(), emptyTouched(), { lessonId: lesson.id, correct: 1, total: 1, missed: ['u18-l1:dwie'], day: '2026-06-15' }, now),
    ).toThrow();
  });

  it('ignores replayed or out-of-order reviews', () => {
    const state = emptyState();
    const id = lessonCardIds(lesson)[0];
    const touched = emptyTouched();
    const first = applyReviews(state, touched, [{ cardId: id, rating: 3, at: now, day: '2026-06-15' }]);
    const replay = applyReviews(state, touched, [{ cardId: id, rating: 3, at: now, day: '2026-06-15' }]);
    expect(first.applied).toBe(1);
    expect(replay.applied).toBe(0);
    expect(() => applyReviews(state, touched, [{ cardId: 'nope', rating: 3, at: now + 1, day: '2026-06-15' }])).toThrow();
  });
});

describe('placement', () => {
  const perfect = Object.fromEntries(PLACEMENT.map((q) => [q.id, q.answer]));
  it('places a learner who answers everything at the last band', () => {
    expect(placementResult(perfect).startUnit).toBe(17);
  });
  it('places a learner who knows nothing at the alphabet unit', () => {
    expect(placementResult({})).toEqual({ band: 0, startUnit: 0 });
  });
  it('needs four in five right to pass a band', () => {
    const band2 = PLACEMENT.filter((q) => q.band === 2).map((q) => q.id);
    expect(placementResult({ ...perfect, [band2[0]]: 'x' }).band).toBeGreaterThan(2);
    expect(placementResult({ ...perfect, [band2[0]]: 'x', [band2[1]]: 'x' })).toEqual({ band: 2, startUnit: 4 });
    expect(bandFailed(2, { [band2[0]]: 'x', [band2[1]]: 'x' })).toBe(true);
    expect(bandFailed(2, { [band2[0]]: 'x' })).toBe(false);
  });
  it('has five questions a band, two typed, in band order', () => {
    const bands = [...new Set(PLACEMENT.map((q) => q.band))];
    expect(bands).toEqual([...bands].sort((a, b) => a - b));
    for (const b of bands) {
      const qs = PLACEMENT.filter((q) => q.band === b);
      expect(qs, `band ${b}`).toHaveLength(5);
      expect(qs.filter((q) => !q.options), `band ${b}`).toHaveLength(2);
      for (const q of qs) if (q.options) expect(q.options).toContain(q.answer);
    }
    expect(new Set(PLACEMENT.map((q) => q.id)).size).toBe(PLACEMENT.length);
  });
  it('takes typed answers without Polish letters or capitals, but not a wrong form', () => {
    const q = PLACEMENT.find((x) => x.answer === 'będę')!;
    expect(isRight(q, 'bede')).toBe(true);
    expect(isRight(q, ' Będę. ')).toBe(true);
    expect(isRight(q, 'będzie')).toBe(false);
    expect(isRight(q, '')).toBe(false);
  });
  it('starts each band at a unit that exists, in course order', () => {
    const positions = BANDS.map((b) => unitByKey(b.startUnit)!.n);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

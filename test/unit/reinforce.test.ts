import { describe, expect, it } from 'vitest';
import { getLesson, lessonCardIds } from '../../src/content/course';
import { emptyState } from '../../src/shared/engine';
import { newCard, review } from '../../src/shared/fsrs';
import { revisionCards, sprinkle } from '../../src/app/lib/reinforce';

const DAY = 86_400_000;
const now = Date.UTC(2026, 8, 1);

/** A deck with every card from three lessons, all reviewed well — except one that keeps being forgotten. */
function deck(forgotten: string) {
  const p = emptyState();
  for (const id of ['u01-l1', 'u01-l2', 'u02-l1'].flatMap((l) => lessonCardIds(getLesson(l)!))) {
    let c = review(newCard(now - 20 * DAY), 3, now - 20 * DAY);
    c = review(c, 3, now - 10 * DAY);
    p.cards.set(id, c);
  }
  let bad = review(newCard(now - 20 * DAY), 1, now - 20 * DAY);
  for (let d = 18; d > 2; d -= 4) bad = review(bad, 1, now - d * DAY);
  p.cards.set(forgotten, bad);
  return p;
}

describe('personalised revision', () => {
  const forgotten = lessonCardIds(getLesson('u01-l2')!)[0];

  it('skews heavily towards what the learner gets wrong', () => {
    const p = deck(forgotten);
    let hits = 0;
    const runs = 400;
    for (let i = 0; i < runs; i++) if (revisionCards(p, 'u03-l1', 1, [], now).some((c) => c.id === forgotten)) hits++;
    const fair = runs / p.cards.size;
    expect(hits).toBeGreaterThan(fair * 5);
    // …but not only ever the same card.
    expect(hits).toBeLessThan(runs);
  });

  it('leaves out the current lesson and anything already in the warm-up', () => {
    const p = deck(forgotten);
    const own = new Set(lessonCardIds(getLesson('u01-l2')!));
    for (let i = 0; i < 50; i++) {
      const picked = revisionCards(p, 'u01-l2', 4, [lessonCardIds(getLesson('u01-l1')!)[0]], now);
      expect(picked).toHaveLength(4);
      for (const c of picked) {
        expect(own.has(c.id)).toBe(false);
        expect(c.id).not.toBe(lessonCardIds(getLesson('u01-l1')!)[0]);
      }
      expect(new Set(picked.map((c) => c.id)).size).toBe(4);
    }
  });

  it('spreads revision through the body of the lesson', () => {
    const main = ['meet', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'dialogue'];
    const out = sprinkle(main, ['R1', 'R2'], 2, 9);
    expect(out).toHaveLength(12);
    expect(out.slice(0, 2)).toEqual(['meet', 'a']);
    expect(out[out.length - 1]).toBe('dialogue');
    const r1 = out.indexOf('R1');
    const r2 = out.indexOf('R2');
    expect(r1).toBeGreaterThan(2);
    expect(r2 - r1).toBeGreaterThan(2);
    expect(r2).toBeLessThan(out.length - 2);
    expect(sprinkle(main, [], 2)).toEqual(main);
  });
});

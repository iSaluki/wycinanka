import { describe, expect, it } from 'vitest';
import { comparableKey, confusionScore, confusionWithAny, couldConfuse, hardDistractors, overlap } from '../../src/shared/confusable';

/** A fixed, repeatable "random" so a pick can be asserted. */
function seeded(seed = 1): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

describe('how confusable two Polish words are', () => {
  it('scores a word against itself as nothing to tell apart', () => {
    expect(confusionScore('kot', 'kot')).toBe(0);
    expect(confusionScore('Kot!', 'kot')).toBe(0);
    expect(confusionScore('kawę', 'kawę')).toBe(0);
    expect(confusionScore('', 'kot')).toBe(0);
  });

  it('rates a word that differs only in its ending far above an unrelated one', () => {
    expect(confusionScore('kawa', 'kawę')).toBeGreaterThan(confusionScore('kawa', 'szkoła'));
    expect(confusionScore('mam', 'masz')).toBeGreaterThan(confusionScore('mam', 'rzeka'));
    expect(confusionScore('byłem', 'byłam')).toBeGreaterThan(0.6);
    expect(confusionScore('studenci', 'student')).toBeGreaterThan(0.6);
  });

  it('hears words that are spelt differently but said the same', () => {
    // kot and kod are both said "kot": a final d loses its voice.
    expect(confusionScore('kot', 'kod')).toBeGreaterThan(0.6);
    // rz and ż are the same sound, so morze and może only differ in writing.
    expect(confusionScore('morze', 'może')).toBeGreaterThan(0.6);
  });

  it('never rates two words as confusable when nothing about them is alike', () => {
    expect(confusionScore('dziękuję', 'kot')).toBe(0);
    expect(confusionScore('herbata', 'nie')).toBe(0);
  });

  it('rules out words of a very different length or a different start and ending, cheaply', () => {
    expect(couldConfuse('kot', 'kod')).toBe(true);
    expect(couldConfuse('kawa', 'kawe')).toBe(true);
    // Not the same start, but the same last two letters: the same ending on a different stem.
    expect(couldConfuse('robimy', 'mamy')).toBe(true);
    expect(couldConfuse('kot', 'dziekuje')).toBe(false);
    expect(couldConfuse('nie', 'herbata')).toBe(false);
    // A shared final letter alone is no likeness: nearly every feminine noun ends in -a.
    expect(couldConfuse('pracy', 'kawy')).toBe(false);
  });

  it('measures a candidate against the closest of several words, for spare tiles in a sentence', () => {
    expect(confusionWithAny('kawę', ['To', 'jest', 'kawa'])).toBeGreaterThan(0.5);
    expect(confusionWithAny('rzeka', ['To', 'jest', 'kawa'])).toBe(0);
  });
});

describe('choosing wrong answers', () => {
  const pool = ['kawa', 'kawę', 'kawą', 'szkoła', 'rzeka', 'herbata', 'dziękuję', 'jajko'];

  it('picks the wrong answers that are hardest to tell from the right one', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const picked = hardDistractors('kawa', pool, 2, { key: (x) => x, rand: seeded(seed) });
      expect(picked).toHaveLength(2);
      for (const p of picked) expect(['kawę', 'kawą'], `seed ${seed}`).toContain(p);
    }
  });

  it('never offers the right answer back, however it is written', () => {
    const picked = hardDistractors('Kawa!', ['kawa', 'kawę', 'kawą'], 2, { key: (x) => x, rand: seeded(3) });
    expect(picked).not.toContain('kawa');
  });

  it('offers each wrong answer once, even when the pool repeats itself', () => {
    const picked = hardDistractors('kawa', ['kawę', 'kawę', 'Kawę', 'kawą'], 2, { key: (x) => x, rand: seeded(5) });
    expect(new Set(picked.map(comparableKey)).size).toBe(picked.length);
  });

  it('leaves out candidates the caller rules out, such as ones that would also be right', () => {
    const picked = hardDistractors('kawa', pool, 3, { key: (x) => x, exclude: (x) => x === 'kawę', rand: seeded(7) });
    expect(picked).not.toContain('kawę');
    expect(picked).toHaveLength(3);
  });

  it('falls back to whatever there is rather than repeating itself when the pool is small', () => {
    expect(hardDistractors('kawa', ['kawę'], 3, { key: (x) => x })).toEqual(['kawę']);
    expect(hardDistractors('kawa', [], 3, { key: (x) => x })).toEqual([]);
    expect(hardDistractors('kawa', pool, 0, { key: (x) => x })).toEqual([]);
  });

  it('raises a candidate the learner has fallen for before, even one nothing like the answer', () => {
    const picked = hardDistractors('kawa', pool, 2, {
      key: (x) => x,
      bonus: (x) => (x === 'dziękuję' ? 1 : 0),
      bonusWidens: true,
      rand: seeded(11),
    });
    expect(picked).toContain('dziękuję');
  });

  it('varies what it asks: the same question twice running is not the same question', () => {
    const many = ['kawa', 'kawę', 'kawą', 'kawy', 'kawie', 'kawom'];
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) seen.add(hardDistractors('kawka', many, 2, { key: (x) => x, rand: seeded(seed) }).join(','));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('gives the same answers from a pool large enough to be indexed as from a small one', () => {
    // Over the indexing threshold, candidates come from an index rather than a scan: the result must not change.
    const filler = Array.from({ length: 80 }, (_, i) => `zupełnieinne${i}`);
    const big = [...pool, ...filler];
    for (let seed = 1; seed <= 10; seed++) {
      const picked = hardDistractors('kawa', big, 2, { key: (x) => x, rand: seeded(seed) });
      for (const p of picked) expect(['kawę', 'kawą'], `seed ${seed}`).toContain(p);
    }
  });

  it('keeps working when an indexed pool holds nothing alike at all', () => {
    const filler = Array.from({ length: 80 }, (_, i) => `zupełnieinne${i}`);
    const picked = hardDistractors('kawa', filler, 3, { key: (x) => x, rand: seeded(2) });
    expect(picked.length).toBeLessThanOrEqual(3);
    expect(new Set(picked).size).toBe(picked.length);
  });
});

describe('how much two lines of a conversation share', () => {
  it('counts the words they have in common, ignoring case and punctuation', () => {
    expect(overlap('Dzień dobry! Co podać?', 'Dzień dobry. Co panu dolega?')).toBeGreaterThan(0.5);
    expect(overlap('Dzień dobry! Co podać?', 'Nie ma sprawy.')).toBe(0);
    expect(overlap('', 'Nie ma sprawy.')).toBe(0);
  });
});

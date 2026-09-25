import { describe, expect, it } from 'vitest';
import { LESSONS, UNITS } from '../../src/content/course';
import { FREQUENCY } from '../../src/content/frequency';
import { DECLENSIONS } from '../../src/content/grammar';
import { MINIMAL_PAIRS } from '../../src/content/sounds';
import { normalise } from '../../src/shared/grade';
import { tokenise } from '../../src/app/lib/exercises';
import { skillOfLesson } from '../../src/content/skills';
import { ALPHABET } from '../../src/content/alphabet';
import { PHRASEBOOK } from '../../src/content/phrasebook';

const everyString = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => everyString(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => everyString(x, out));
  return out;
};

describe('course content', () => {
  it('has a phonics unit and 30 units of 3 lessons across A1, A2 and B1', () => {
    expect(UNITS).toHaveLength(31);
    expect(UNITS[0].lessons.every((l) => l.phonics)).toBe(true);
    for (const u of UNITS.slice(1)) expect(u.lessons, u.id).toHaveLength(3);
    expect(LESSONS).toHaveLength(96);
    expect(new Set(UNITS.map((u) => u.level))).toEqual(new Set(['A1', 'A2', 'B1']));
  });

  it('uses unique ids everywhere', () => {
    const ids = [
      ...LESSONS.map((l) => l.id),
      ...LESSONS.flatMap((l) => [...l.items, ...l.sentences, ...l.drills].map((x) => x.id)),
      ...FREQUENCY.map((w) => w.id),
    ];
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9:-]{1,64}$/);
  });

  it('does not teach the same word twice as a lesson item', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const l of LESSONS.filter((x) => !x.phonics))
      for (const i of l.items) {
        const k = normalise(i.pl);
        if (seen.has(k)) dupes.push(`${i.pl} (${seen.get(k)} and ${l.id})`);
        seen.set(k, l.id);
      }
    expect(dupes).toEqual([]);
  });

  it('gives every lesson enough practice material', () => {
    for (const l of LESSONS) {
      if (l.phonics) {
        expect(l.items.length, l.id).toBeGreaterThanOrEqual(5);
        for (const i of l.items) expect(i.ex?.length, i.id).toBeGreaterThanOrEqual(2);
        continue;
      }
      expect(l.items.length, l.id).toBeGreaterThanOrEqual(6);
      expect(l.sentences.length, l.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('stores text in Unicode NFC with no stray whitespace', () => {
    for (const s of everyString([UNITS, FREQUENCY, DECLENSIONS, MINIMAL_PAIRS, ALPHABET, PHRASEBOOK])) {
      expect(s, s).toBe(s.normalize('NFC'));
      expect(s, JSON.stringify(s)).toBe(s.trim());
    }
  });

  it('has well-formed gap drills', () => {
    for (const l of LESSONS)
      for (const d of l.drills) {
        expect(d.text, d.id).toContain('___');
        expect(d.options, d.id).toContain(d.answer);
        expect(new Set(d.options).size, d.id).toBe(d.options.length);
      }
  });

  it('never offers a correct word as a distractor tile', () => {
    for (const l of LESSONS)
      for (const s of l.sentences) {
        const correct = new Set([s.pl, ...(s.altPl ?? [])].flatMap(tokenise).map(normalise));
        for (const e of s.extra ?? []) expect(correct.has(normalise(e)), `${s.id}: ${e}`).toBe(false);
      }
  });

  it('never gives two different words the same English', () => {
    // Warm-ups and reviews can ask about any earlier word, and matching pairs mix a lesson with its
    // neighbours: two words with one meaning would make a question with two right answers.
    const items = LESSONS.filter((l) => !l.phonics).flatMap((l) => l.items);
    for (const item of items) {
      const accepted = [item.pl, ...(item.altPl ?? [])].map(normalise);
      const clash = items.filter((o) => o.id !== item.id && normalise(o.en) === normalise(item.en) && !accepted.includes(normalise(o.pl)));
      expect(clash.map((o) => o.id), `${item.id} "${item.en}"`).toEqual([]);
    }
  });

  it('has all 32 letters of the alphabet', () => {
    expect(ALPHABET).toHaveLength(32);
  });

  it('has 500 frequency words with glosses', () => {
    expect(FREQUENCY).toHaveLength(500);
    for (const w of FREQUENCY) {
      expect(w.en.length, w.pl).toBeGreaterThan(0);
      expect(w.pos, w.pl).toMatch(/^(particle|pronoun|preposition|conjunction|verb|noun|adjective|adverb|numeral|interjection)$/);
    }
  });

  it('maps every lesson to a skill', () => {
    for (const l of LESSONS) expect(skillOfLesson(l.id), l.id).toBeTruthy();
  });

  it('has complete declension tables', () => {
    for (const d of DECLENSIONS) {
      expect(d.singular).toHaveLength(7);
      expect(d.plural).toHaveLength(7);
    }
  });
});

import { respell } from '../../src/shared/phonetics';

describe('respellings in hints', () => {
  it('match the automatic respelling shown next to the word', () => {
    const differ: string[] = [];
    for (const l of LESSONS) {
      if (l.phonics) continue;
      for (const i of l.items) {
        for (const m of i.hint?.matchAll(/"([A-Za-z-]*[A-Z]{2,}[A-Za-z-]*)"/g) ?? []) {
          if (m[1].includes('-') && m[1] !== respell(i.pl)) differ.push(`${i.pl}: hint "${m[1]}", shown "${respell(i.pl)}"`);
        }
      }
    }
    expect(differ).toEqual([]);
  });
});

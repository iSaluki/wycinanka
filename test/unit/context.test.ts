import { describe, expect, it } from 'vitest';
import { cardIdsForWord, LESSONS, lessonCardForWord } from '../../src/content/course';
import { FREQUENCY } from '../../src/content/frequency';
import { READING } from '../../src/content/reading';
import { normalise } from '../../src/shared/grade';
import known from './uncontextualised.json';

/**
 * A word met only on its own card is a word learnt only as a translation. Every word the course teaches should
 * turn up in at least one sentence, conversation line, drill or spotlight example, where it comes with the forms
 * and the neighbours it is really used with.
 *
 * `uncontextualised.json` lists the words that don't yet, so that the ones already there don't block a build
 * while new content is held to the rule. Working through that list means writing a sentence for each — which
 * also needs a recording (`npm run voice`), so it is content work rather than a code change.
 */

/**
 * Every Polish word form the course uses in a sentence, a conversation, a drill, an example, or a reading text.
 * A reading text counts: it is the fullest context the course has, and a word met in one has been met in use.
 */
function inContext(): Set<string> {
  const out = new Set<string>();
  const texts = [
    ...LESSONS.flatMap((l) => [
      ...l.sentences.flatMap((s) => [s.pl, ...(s.altPl ?? [])]),
      ...(l.dialogue ?? []).map((d) => d.pl),
      ...l.drills.map((d) => d.text.replace('___', d.answer)),
      ...(l.spotlight?.examples ?? []).map(([pl]) => pl),
    ]),
    ...READING.flatMap((t) => t.lines.map((l) => l.pl)),
  ];
  for (const text of texts) for (const w of normalise(text).split(' ')) if (w) out.add(w);
  return out;
}

/** Words share a stem when one is a form of the other: {kot} in {kota}, {piszę} in {pisze}. */
const stemOf = (w: string) => w.slice(0, Math.max(3, w.length - 2));

describe('words are met in use, not only as translations', () => {
  const context = inContext();
  const forms = [...context];
  const used = (pl: string) => {
    const n = normalise(pl);
    return context.has(n) || forms.some((w) => w.startsWith(stemOf(n)));
  };

  const taught = LESSONS.filter((l) => !l.phonics).flatMap((l) => l.items.filter((i) => !/\s/.test(i.pl)));

  it('uses the great majority of the words it teaches in a sentence of some kind', () => {
    const missing = taught.filter((i) => !used(i.pl));
    expect(taught.length).toBeGreaterThan(400);
    expect(missing.length / taught.length, 'share of words never used in context').toBeLessThan(0.15);
  });

  it('adds no new word that is never used, beyond the ones already recorded', () => {
    const missing = taught.filter((i) => !used(i.pl)).map((i) => i.id);
    const fresh = missing.filter((id) => !(id in known));
    expect(
      fresh,
      'These words are taught but never used in a sentence, conversation, drill or example. Write one, or add the id to test/unit/uncontextualised.json.',
    ).toEqual([]);
  });

  it('keeps the recorded list honest: nothing on it that is now used, or no longer taught', () => {
    const byId = new Map(taught.map((i) => [i.id, i]));
    const fixed = Object.keys(known).filter((id) => {
      const item = byId.get(id);
      return item ? used(item.pl) : false;
    });
    expect(fixed, 'Now used in context: take these off test/unit/uncontextualised.json').toEqual([]);
    const gone = Object.keys(known).filter((id) => !byId.has(id));
    expect(gone, 'No longer taught: take these off test/unit/uncontextualised.json').toEqual([]);
  });
});

describe('a word of the 500 that a lesson also teaches', () => {
  it('is known under either card, so it is never taught twice on two schedules', () => {
    const both = FREQUENCY.filter((w) => lessonCardForWord(w.pl));
    expect(both.length, 'a good part of the 500 is also taught in the course').toBeGreaterThan(100);
    for (const w of both) {
      const ids = cardIdsForWord(w);
      expect(ids[0]).toBe(w.id);
      expect(ids).toHaveLength(2);
      expect(ids[1]).toBe(lessonCardForWord(w.pl));
    }
  });

  it('is its own card alone when no lesson teaches it', () => {
    const only = FREQUENCY.find((w) => !lessonCardForWord(w.pl))!;
    expect(cardIdsForWord(only)).toEqual([only.id]);
  });

  it('never points at a spelling from the sounds unit, whose items are letters rather than words', () => {
    for (const l of LESSONS.filter((x) => x.phonics)) for (const i of l.items) expect(lessonCardForWord(i.pl)).not.toBe(i.id);
  });
});

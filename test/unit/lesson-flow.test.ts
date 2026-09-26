import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/content/course';
import { CHUNK_DECKS } from '../../src/content/chunks';
import {
  chunkLearnSession,
  hintLimit,
  introGroups,
  isGraded,
  lessonPlan,
  maskAnswer,
  ruledOut,
  sentenceStart,
  type Exercise,
} from '../../src/app/lib/exercises';

const cardOf = (e: Exercise) => ('cardId' in e ? e.cardId : undefined);

describe('introGroups', () => {
  it('splits into even groups of at most three', () => {
    const sizes = (n: number) => introGroups(Array.from({ length: n }, (_, i) => i)).map((g) => g.length);
    expect(sizes(8)).toEqual([3, 3, 2]);
    expect(sizes(7)).toEqual([3, 2, 2]);
    expect(sizes(5)).toEqual([3, 2]);
    expect(sizes(10)).toEqual([3, 3, 2, 2]);
    expect(sizes(3)).toEqual([3]);
    expect(introGroups([])).toEqual([]);
  });
});

describe('lessons teach a few words at a time', () => {
  it('never asks about a word before it has been met, and asks about each one straight after meeting it', () => {
    for (const l of LESSONS) {
      const { exercises, introEnd } = lessonPlan(l);
      const met = new Set<string>();
      const own = new Set(l.items.map((i) => i.id));
      exercises.forEach((e, k) => {
        if (e.kind === 'meet') {
          expect(e.items.length, l.id).toBeLessThanOrEqual(3);
          // The questions right after a group are about that group.
          const next = exercises.slice(k + 1, k + 1 + e.items.length);
          expect(new Set(next.map(cardOf)), l.id).toEqual(new Set(e.items.map((i) => i.id)));
          for (const i of e.items) met.add(i.id);
        }
        const id = cardOf(e);
        if (id && own.has(id)) expect(met.has(id), `${l.id}: ${id} asked before it was met`).toBe(true);
        if (e.kind === 'match') for (const p of e.pairs) expect(met.has(p.cardId), l.id).toBe(true);
      });
      expect(met.size, l.id).toBe(l.items.length);
      // The introduction ends with a graded question, and nothing after it introduces new words.
      expect(exercises.slice(introEnd).some((e) => e.kind === 'meet'), l.id).toBe(false);
      expect(isGraded(exercises[introEnd - 1]), l.id).toBe(true);
    }
  });

  it('explains grammar after the words are met, before sentences use it', () => {
    for (const l of LESSONS.filter((x) => x.spotlight)) {
      const { exercises, introEnd } = lessonPlan(l);
      expect(exercises[introEnd].kind, l.id).toBe('spotlight');
    }
  });

  it('introduces phrases a few at a time too', () => {
    const s = chunkLearnSession(CHUNK_DECKS[0].chunks);
    const meets = s.filter((e) => e.kind === 'meet');
    expect(meets.length).toBeGreaterThan(1);
    for (const m of meets) expect(m.kind === 'meet' && m.items.length).toBeLessThanOrEqual(3);
  });
});

describe('hints', () => {
  it('rule out wrong options, one per hint, never the answer, down to two', () => {
    const opts = ['kot', 'pies', 'dom', 'ser'];
    expect(ruledOut(opts, 'dom', 1)).toEqual(['kot']);
    expect(ruledOut(opts, 'dom', 2)).toEqual(['kot', 'pies']);
    expect(hintLimit({ kind: 'choose', cardId: 'x', prompt: 'p', promptLang: 'pl', options: opts, answer: 'dom' })).toBe(2);
    expect(hintLimit({ kind: 'gap', cardId: 'x', text: '___', en: '', options: ['a', 'b'], answer: 'a' })).toBe(0);
  });

  it('reveal the start of a typed answer, keeping spaces and punctuation', () => {
    expect(maskAnswer('Dzień dobry', 1)).toBe('D···· d····');
    expect(maskAnswer('Dzień dobry', 2)).toBe('Dzi·· dob··');
    expect(maskAnswer('Tak, to kot.', 1)).toBe('T··, t· k··.');
  });

  it('reveal the first words of a sentence to build, never all of it', () => {
    expect(sentenceStart('Tak, to woda.', 2)).toBe('Tak to');
    expect(hintLimit({ kind: 'build', cardId: 'x', prompt: '', tiles: [], accepted: ['Tak.'], lang: 'pl' })).toBe(0);
    expect(hintLimit({ kind: 'build', cardId: 'x', prompt: '', tiles: [], accepted: ['To jest kot.'], lang: 'pl' })).toBe(2);
  });
});

describe('more than one right answer', () => {
  it('accepts every course word that means the prompt, and never offers one as a wrong option', async () => {
    const { sameMeaning, reviewExercise } = await import('../../src/app/lib/exercises');
    const { getCard } = await import('../../src/content/course');
    const { grade } = await import('../../src/shared/grade');
    expect(sameMeaning('hello', 'dzień dobry')).toContain('cześć');
    const hello = LESSONS.flatMap((l) => l.items).find((i) => i.pl === 'dzień dobry')!;
    const typed = reviewExercise(getCard(hello.id)!, 2, hello.id);
    expect(typed.kind).toBe('type');
    if (typed.kind !== 'type') return;
    expect(typed.accepted[0]).toBe('dzień dobry');
    expect(typed.also).toContain('cześć');
    expect(grade('cześć', typed.accepted, 'pl').verdict).toBe('correct');
    // A grammatical form with a different meaning is not a synonym: "mum" is mama, not mamie ("to Mum").
    expect(sameMeaning('mum', 'mama')).not.toContain('mamie');

    for (const l of LESSONS.filter((x) => !x.phonics))
      for (let run = 0; run < 3; run++)
        for (const e of lessonPlan(l).exercises) {
          if (e.kind !== 'choose') continue;
          const wrong = e.options.filter((o) => o !== e.answer);
          if (e.promptLang === 'en') {
            const right = new Set([e.answer, ...sameMeaning(e.prompt, e.answer)]);
            for (const o of wrong) expect(right.has(o), `${l.id}: "${e.prompt}" offers ${o} as wrong`).toBe(false);
          }
        }
  });
});

import { conversation } from '../../src/app/lib/exercises';

describe('every lesson ends with a conversation', () => {
  it('has a dialogue of at least three lines between two people in every lesson after the alphabet', () => {
    for (const l of LESSONS.filter((x) => !x.phonics)) {
      expect(l.dialogue?.length ?? 0, l.id).toBeGreaterThanOrEqual(3);
      expect(new Set(l.dialogue!.map((d) => d.who)).size, l.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('listens first, asks about what was heard, reads along, then has the learner reply', () => {
    for (const l of LESSONS.filter((x) => !x.phonics)) {
      const ex = conversation(l);
      expect(ex[0].kind, l.id).toBe('listen');
      const read = ex.findIndex((e) => e.kind === 'dialogue');
      expect(read, l.id).toBeGreaterThan(0);
      for (const q of ex.slice(1, read)) {
        expect(q.kind === 'choose' && q.audio, l.id).toBe(true);
        if (q.kind === 'choose') {
          expect(q.options, l.id).toContain(q.answer);
          expect(new Set(q.options).size, l.id).toBe(q.options.length);
        }
      }
      for (const r of ex.slice(read + 1)) {
        expect(r.kind, l.id).toBe('choose');
        if (r.kind !== 'choose') continue;
        // The right reply is the line that really follows the one heard.
        const at = l.dialogue!.findIndex((d) => d.pl === r.prompt);
        expect(l.dialogue![at + 1].pl, l.id).toBe(r.answer);
        expect(new Set(r.options).size, l.id).toBe(r.options.length);
      }
    }
  });

  it('keeps retries and revision out of the closing conversation', () => {
    const l = LESSONS.find((x) => x.id === 'u06-l3')!;
    const { exercises, outroStart } = lessonPlan(l);
    expect(exercises[outroStart].kind).toBe('listen');
    expect(exercises.slice(0, outroStart).some((e) => e.kind === 'listen' || e.kind === 'dialogue')).toBe(false);
  });
});

describe('sentence building', () => {
  it('only accepts, and only shows, answers the tiles can make', async () => {
    const { buildable, lessonPlan: plan } = await import('../../src/app/lib/exercises');
    expect(buildable('My jesteśmy tutaj.', ['tutaj', 'My', 'jesteśmy', 'są'])).toBe(true);
    expect(buildable('My jesteśmy tu.', ['tutaj', 'My', 'jesteśmy', 'są'])).toBe(false);
    expect(buildable('Nie ma sprawy.', ['nie ma sprawy', 'tak'])).toBe(true);
    for (const l of LESSONS) {
      for (const e of plan(l).exercises) {
        if (e.kind !== 'build') continue;
        expect(e.accepted.length, e.cardId).toBeGreaterThan(0);
        for (const a of e.accepted) expect(buildable(a, e.tiles), `${e.cardId}: ${a}`).toBe(true);
      }
    }
  });
});

describe('sentence reviews get harder as the card matures', () => {
  it('moves from tiles to understanding to writing the whole sentence', async () => {
    const { reviewExercise } = await import('../../src/app/lib/exercises');
    const { getCard } = await import('../../src/content/course');
    const s = LESSONS.find((l) => l.sentences.length)!.sentences[0];
    const at = (reps: number) => reviewExercise(getCard(s.id)!, reps, s.id);
    expect(at(0).kind).toBe('build');
    expect(at(1).kind).toBe('build');
    expect(at(2)).toMatchObject({ kind: 'type', lang: 'en' });
    expect(at(3)).toMatchObject({ kind: 'type', lang: 'pl', prompt: s.en });
    expect(at(4)).toMatchObject({ kind: 'type', lang: 'en' });
  });
});

describe('dictation', () => {
  it('asks for a couple of words from the ear in each lesson, never ones already typed from the English', () => {
    for (const l of LESSONS.filter((x) => !x.phonics)) {
      const ex = lessonPlan(l, { speaking: false }).exercises;
      const heard = ex.filter((e) => e.kind === 'type' && e.audio);
      const typed = new Set(ex.filter((e) => e.kind === 'type' && !e.audio && e.lang === 'pl').map(cardOf));
      expect(heard.length, l.id).toBeLessThanOrEqual(2);
      for (const e of heard) {
        if (e.kind !== 'type') continue;
        expect(e.accepted).toEqual([e.audio]);
        expect(typed.has(e.cardId), `${l.id}: ${e.audio}`).toBe(false);
      }
    }
    expect(LESSONS.filter((l) => !l.phonics && lessonPlan(l).exercises.some((e) => e.kind === 'type' && e.audio)).length).toBeGreaterThan(60);
  });
});

describe('frequency words', () => {
  it('are reviewed in their example sentences as well as on their own', async () => {
    const { reviewExercise } = await import('../../src/app/lib/exercises');
    const { getCard } = await import('../../src/content/course');
    const { FREQUENCY } = await import('../../src/content/frequency');
    const w = FREQUENCY.find((x) => x.pl === 'być')!;
    const at = (reps: number) => reviewExercise(getCard(w.id)!, reps, w.id);
    expect(at(0)).toMatchObject({ kind: 'choose', answer: w.en });
    expect(at(1)).toMatchObject({ kind: 'build', accepted: [w.ex![0]], prompt: w.ex![1] });
    expect(at(2)).toMatchObject({ kind: 'type', prompt: w.en });
    expect(at(3)).toMatchObject({ kind: 'build', audio: w.ex![0] });
    // About nine in ten examples have more than one word to put in order; the rest are asked on their own.
    expect(FREQUENCY.filter((x) => reviewExercise(getCard(x.id)!, 1, x.id).kind === 'build').length).toBeGreaterThan(440);
  });
});

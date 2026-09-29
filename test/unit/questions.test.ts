import { describe, expect, it } from 'vitest';
import { getCard, LESSONS } from '../../src/content/course';
import { FREQUENCY } from '../../src/content/frequency';
import { skillOfLesson } from '../../src/content/skills';
import type { Drill } from '../../src/content/types';
import { confusionScore, overlap } from '../../src/shared/confusable';
import { normalise } from '../../src/shared/grade';
import { clearConfusions, noteConfusion } from '../../src/app/lib/confusions';
import { conversation, lessonPlan, reviewExercise, ruleText, sameMeaning, whyExercise, wordInSentence, type Exercise } from '../../src/app/lib/exercises';

/**
 * A multiple-choice question is only worth asking if its wrong answers are worth ruling out. These tests hold
 * the line on that: every question in the course, several times over, must offer distinct options, exactly one
 * right one, and — where the course has enough words to manage it — wrong ones that really could be mistaken
 * for the answer rather than three words picked out of the air.
 */

const RUNS = 3;
const chooses = (xs: Exercise[]) => xs.filter((e): e is Extract<Exercise, { kind: 'choose' }> => e.kind === 'choose');

function everyChoice(): Array<{ ex: Extract<Exercise, { kind: 'choose' }>; where: string }> {
  const out: Array<{ ex: Extract<Exercise, { kind: 'choose' }>; where: string }> = [];
  for (const l of LESSONS)
    for (let run = 0; run < RUNS; run++) {
      for (const ex of chooses(lessonPlan(l, { speaking: false }).exercises)) out.push({ ex, where: `${l.id} lesson` });
      for (const ex of chooses(conversation(l))) out.push({ ex, where: `${l.id} conversation` });
    }
  return out;
}

describe('every question the course can ask', () => {
  const all = everyChoice();

  it('builds thousands of them, so these checks mean something', () => {
    expect(all.length).toBeGreaterThan(3_000);
  });

  it('offers the right answer exactly once, among options that all differ', () => {
    for (const { ex, where } of all) {
      expect(ex.options, `${where}: "${ex.prompt}"`).toContain(ex.answer);
      expect(new Set(ex.options.map(normalise)).size, `${where}: "${ex.prompt}" repeats an option`).toBe(ex.options.length);
      expect(ex.options.filter((o) => o === ex.answer).length).toBe(1);
      // Three or more everywhere but the sounds unit, where a spelling may have only one near-twin to hear it against.
      const least = where.startsWith('u00') ? 2 : 3;
      expect(ex.options.length, `${where}: "${ex.prompt}"`).toBeGreaterThanOrEqual(least);
    }
  });

  it('never offers a second right answer as a wrong one', () => {
    const byEnglish = new Map<string, Set<string>>();
    for (const l of LESSONS)
      if (!l.phonics)
        for (const i of l.items) {
          const key = normalise(i.pl);
          const meanings = byEnglish.get(key) ?? new Set<string>();
          for (const en of [i.en, ...(i.altEn ?? [])]) meanings.add(normalise(en));
          byEnglish.set(key, meanings);
        }
    for (const { ex, where } of all) {
      const wrong = ex.options.filter((o) => o !== ex.answer);
      if (ex.promptLang === 'en') {
        // Choosing the Polish: no wrong option may also mean the prompt.
        const right = new Set([ex.answer, ...sameMeaning(ex.prompt, ex.answer)].map(normalise));
        for (const o of wrong) expect(right.has(normalise(o)), `${where}: "${ex.prompt}" offers ${o}`).toBe(false);
      } else if (!ex.instruction) {
        // Choosing the meaning of a word: no wrong option may be another of that word's meanings.
        const meanings = byEnglish.get(normalise(ex.prompt));
        if (meanings) for (const o of wrong) expect(meanings.has(normalise(o)), `${where}: "${ex.prompt}" offers ${o}`).toBe(false);
      }
    }
  });

  it('keeps the sounds unit out of vocabulary questions, whose "meanings" are rules and not meanings', () => {
    // "final consonants lose their voice" as a wrong answer to "kot" is no test of anything.
    const phonicsGlosses = new Set(LESSONS.filter((l) => l.phonics).flatMap((l) => l.items.map((i) => normalise(i.en))));
    // Single letters are left out: the English option "I" is not the phonics item {i}.
    const phonicsSpellings = new Set(
      LESSONS.filter((l) => l.phonics).flatMap((l) => l.items.map((i) => normalise(i.pl)).filter((pl) => pl.length > 1)),
    );
    for (const { ex, where } of all) {
      if (where.startsWith('u00')) continue;
      const lesson = LESSONS.find((l) => where.startsWith(l.id))!;
      if (lesson.phonics) continue;
      for (const o of ex.options) {
        expect(phonicsGlosses.has(normalise(o)), `${where}: "${ex.prompt}" offers the sound "${o}"`).toBe(false);
        expect(phonicsSpellings.has(normalise(o)), `${where}: "${ex.prompt}" offers the spelling "${o}"`).toBe(false);
      }
    }
  });
});

describe('wrong answers are ones a learner could believe', () => {
  /** The words a question about this word is drawn from, as the generator draws them. */
  const poolFor = (at: number) =>
    LESSONS.slice(0, at + 3)
      .filter((l) => !l.phonics)
      .flatMap((l) => l.items);

  it('chooses wrong Polish that is harder to tell from the answer than a word picked at random', () => {
    // Measured over the whole course rather than one word, since the earliest lessons have too few words to
    // choose between and must fall back to picking at random.
    let chosen = 0;
    let random = 0;
    let n = 0;
    LESSONS.forEach((lesson, at) => {
      if (lesson.phonics) return;
      const pool = poolFor(at);
      for (let run = 0; run < RUNS; run++)
        for (const ex of chooses(lessonPlan(lesson, { speaking: false }).exercises)) {
          if (ex.promptLang !== 'en' || ex.image) continue;
          const wrong = ex.options.filter((o) => o !== ex.answer);
          chosen += wrong.reduce((s, o) => s + confusionScore(ex.answer, o), 0) / wrong.length;
          random += pool.reduce((s, w) => s + confusionScore(ex.answer, w.pl), 0) / pool.length;
          n++;
        }
    });
    expect(n).toBeGreaterThan(100);
    // Several times harder on average: the whole point of choosing them rather than shuffling.
    expect(chosen / n).toBeGreaterThan((random / n) * 3);
  });

  it('tells apart the endings that a case or a person changes', () => {
    const wrongFor = (pl: string) => {
      const item = LESSONS.flatMap((l) => l.items).find((i) => i.pl === pl);
      if (!item) return [];
      const seen = new Set<string>();
      // Several runs, because the wrong answers are sampled rather than fixed.
      for (let run = 0; run < 12; run++) {
        const ex = reviewExercise(getCard(item.id)!, 0, item.id);
        if (ex.kind === 'choose') for (const o of ex.options) if (o !== ex.answer) seen.add(o);
      }
      return [...seen];
    };
    // "I should" against the other people of the same verb.
    const should = wrongFor('powinienem');
    expect(should.some((o) => /should/.test(o)), should.join(' | ')).toBe(true);
    // "the best" against other adjectives in their comparative or superlative.
    const best = wrongFor('najlepszy');
    expect(best.some((o) => /^the |er$/.test(o)), best.join(' | ')).toBe(true);
  });

  it('asks about a line of a conversation against lines built from the same words', () => {
    // A wrong meaning belonging to a line that shares nothing with the one heard can be ruled out from a single
    // recognised word. The wrong answers are therefore picked by how much Polish they share with it.
    const plOf = new Map<string, string>();
    for (const l of LESSONS) for (const d of l.dialogue ?? []) if (!plOf.has(d.en)) plOf.set(d.en, d.pl);
    const allLines = LESSONS.flatMap((l) => l.dialogue ?? []);
    let chosen = 0;
    let random = 0;
    let asked = 0;
    for (const l of LESSONS.filter((x) => !x.phonics))
      for (let run = 0; run < RUNS; run++)
        for (const ex of chooses(conversation(l))) {
          if (!ex.audio) continue;
          const wrong = ex.options.filter((o) => o !== ex.answer).flatMap((o) => plOf.get(o) ?? []);
          if (!wrong.length) continue;
          chosen += wrong.reduce((sum, pl) => sum + overlap(ex.prompt, pl), 0) / wrong.length;
          random += allLines.reduce((sum, x) => sum + overlap(ex.prompt, x.pl), 0) / allLines.length;
          asked++;
        }
    expect(asked).toBeGreaterThan(100);
    expect(chosen / asked).toBeGreaterThan((random / asked) * 3);
  });

  it('offers back a wrong answer this learner has chosen before, until it stops working', () => {
    clearConfusions();
    const item = LESSONS.flatMap((l) => l.items).find((i) => i.pl === 'kawa')!;
    const before = new Set<string>();
    for (let run = 0; run < 20; run++) {
      const ex = reviewExercise(getCard(item.id)!, 0, item.id);
      if (ex.kind === 'choose') for (const o of ex.options) before.add(o);
    }
    // A meaning nothing like the answer, which the usual measure would never offer.
    const odd = 'thank you';
    expect(before.has(odd), 'the wrong answer must be one it would not otherwise offer').toBe(false);
    noteConfusion(item.id, odd);
    const after = new Set<string>();
    for (let run = 0; run < 20; run++) {
      const ex = reviewExercise(getCard(item.id)!, 0, item.id);
      if (ex.kind === 'choose') for (const o of ex.options) after.add(o);
    }
    expect(after.has(odd), 'a mistake once made should come back to be ruled out').toBe(true);
    clearConfusions();
  });

  it('gives a word of the 500 wrong meanings from its own part of speech', () => {
    const posOf = new Map(FREQUENCY.map((w) => [normalise(w.en), w.pos]));
    let sharedPos = 0;
    let asked = 0;
    for (const w of FREQUENCY.slice(0, 120)) {
      const ex = reviewExercise(getCard(w.id)!, 0, w.id);
      if (ex.kind !== 'choose') continue;
      for (const o of ex.options) {
        if (o === ex.answer) continue;
        asked++;
        if (posOf.get(normalise(o)) === w.pos) sharedPos++;
      }
    }
    expect(asked).toBeGreaterThan(200);
    expect(sharedPos / asked).toBeGreaterThan(0.2);
  });
});

describe('why is it this form?', () => {
  const withRule = LESSONS.flatMap((l) => l.drills.filter((d) => d.why).map((d) => ({ d, lesson: l })));

  it('can be asked of every grammar drill that carries a rule', () => {
    expect(withRule.length).toBeGreaterThan(100);
    for (const { d } of withRule) expect(whyExercise(d), d.id).not.toBeNull();
  });

  it('shows the sentence with its ending in place, and that drill\u2019s own rule as the answer', () => {
    for (const { d } of withRule) {
      const ex = whyExercise(d)!;
      if (ex.kind !== 'choose') throw new Error('not a choice');
      expect(ex.prompt, d.id).toBe(d.text.replace('___', d.answer));
      expect(ex.prompt).not.toContain('___');
      expect(ex.answer, d.id).toBe(ruleText(d.why!));
      expect(new Set(ex.options).size, d.id).toBe(ex.options.length);
      expect(ex.options, d.id).toContain(ex.answer);
      expect(ex.cardId, 'keeps the drill’s own card, so no review history is lost').toBe(d.id);
    }
  });

  it('offers rules of about the same length, so the answer cannot be picked out by its shape', () => {
    // One short rule against two long ones can be spotted without reading any of them.
    let lopsided = 0;
    for (const { d } of withRule) {
      const ex = whyExercise(d)!;
      if (ex.kind !== 'choose') continue;
      const lengths = ex.options.map((o) => o.length);
      if (Math.max(...lengths) > 3 * Math.min(...lengths)) lopsided++;
    }
    expect(lopsided / withRule.length, 'share of questions whose options differ wildly in length').toBeLessThan(0.1);
  });

  it('never offers another rule about the same grammar, which could also be true of the sentence', () => {
    // Two rules about the accusative can both explain one ending. A wrong answer that is actually right is
    // worse than an easy question.
    const skillOfDrill = new Map<string, string>();
    for (const l of LESSONS) for (const d of l.drills) skillOfDrill.set(d.id, skillOfLesson(l.id) ?? `lesson:${l.id}`);
    const ruleOwners = new Map<string, Set<string>>();
    for (const { d } of withRule) {
      const first = ruleText(d.why!);
      const owners = ruleOwners.get(first) ?? new Set<string>();
      owners.add(skillOfDrill.get(d.id)!);
      ruleOwners.set(first, owners);
    }
    for (const { d } of withRule) {
      const ex = whyExercise(d)!;
      if (ex.kind !== 'choose') continue;
      const mine = skillOfDrill.get(d.id)!;
      for (const o of ex.options) {
        if (o === ex.answer) continue;
        expect([...(ruleOwners.get(o) ?? [])], `${d.id} offers a rule from its own grammar: "${o}"`).not.toContain(mine);
      }
    }
  });

  it('comes only once a drill is known, and never instead of the drill itself', () => {
    const d: Drill = withRule[0].d;
    const kinds = [0, 1, 2, 3, 4, 5].map((reps) => reviewExercise(getCard(d.id)!, reps, d.id));
    expect(kinds.map((e) => e.kind)).toEqual(['gap', 'gap', 'choose', 'gap', 'choose', 'gap']);
    // Whichever way it is asked, it stays the same card, so no review history is split or lost.
    for (const e of kinds) expect('cardId' in e ? e.cardId : null).toBe(d.id);
  });

  it('falls back to the gap when a drill has no rule to ask for', () => {
    const bare = LESSONS.flatMap((l) => l.drills).find((d) => !d.why)!;
    expect(whyExercise(bare)).toBeNull();
    expect(reviewExercise(getCard(bare.id)!, 2, bare.id).kind).toBe('gap');
  });
});

describe('spare tiles in a sentence', () => {
  it('are words that could be mistaken for one the sentence needs', () => {
    // Every lesson sentence has spare tiles written by hand, which are kept as they are; the generated ones are
    // for the example sentences of the 500 words, which are built from tiles on every other review.
    let closer = 0;
    let asked = 0;
    for (const w of FREQUENCY) {
      const ex = wordInSentence(w);
      if (ex?.kind !== 'build') continue;
      const needed = ex.accepted[0].split(/\s+/);
      for (const t of ex.tiles) {
        if (needed.some((x) => normalise(x) === normalise(t))) continue;
        asked++;
        if (needed.some((x) => confusionScore(x, t) > 0.3)) closer++;
      }
    }
    expect(asked).toBeGreaterThan(200);
    expect(closer / asked, 'most spare tiles are near-misses of a word the sentence needs').toBeGreaterThan(0.4);
  });
});

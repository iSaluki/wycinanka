import { describe, expect, it } from 'vitest';
import { READING, getText, wordCount } from '../../src/content/reading';
import { LESSONS, unitByKey } from '../../src/content/course';
import { CHUNKS } from '../../src/content/chunks';
import { FREQUENCY } from '../../src/content/frequency';
import { PHRASEBOOK } from '../../src/content/phrasebook';
import { normalise } from '../../src/shared/grade';
import { inWomansVoice } from '../../src/app/lib/voices';

/**
 * The reading texts are the course's only connected Polish, and they only work if a learner can very nearly
 * read them: comprehensible input is nearly all known with a little beyond, and a text of unknown words is just
 * a wall. These tests hold that line, and hold the texts to the same standards as the rest of the content.
 */

/** Every Polish word form the course teaches anywhere, so a text can be checked against what a learner has met. */
function taughtForms(): Set<string> {
  const out = new Set<string>();
  const add = (s?: string) => {
    if (s) for (const w of normalise(s).split(' ')) if (w) out.add(w);
  };
  for (const l of LESSONS) {
    for (const i of l.items) {
      add(i.pl);
      (i.altPl ?? []).forEach(add);
      (i.ex ?? []).forEach(add);
    }
    for (const s of l.sentences) {
      add(s.pl);
      (s.altPl ?? []).forEach(add);
      (s.extra ?? []).forEach(add);
    }
    for (const d of l.drills) {
      add(d.text.replace('___', d.answer));
      d.options.forEach(add);
    }
    for (const x of l.dialogue ?? []) add(x.pl);
    for (const [pl] of l.spotlight?.examples ?? []) add(pl);
  }
  for (const w of FREQUENCY) {
    add(w.pl);
    add(w.ex?.[0]);
  }
  for (const c of CHUNKS) {
    add(c.pl);
    add(c.ex?.[0]);
  }
  for (const g of PHRASEBOOK) for (const [pl] of g.phrases) add(pl);
  return out;
}

const stemOf = (w: string) => w.slice(0, Math.max(3, w.length - 2));

describe('the reading texts', () => {
  it('give the course its first connected Polish, and a useful amount of it', () => {
    expect(READING.length).toBeGreaterThanOrEqual(6);
    const words = READING.reduce((n, t) => n + wordCount(t), 0);
    expect(words, 'running words of connected Polish').toBeGreaterThan(500);
    // The point of a text rather than a sentence: several sentences held together.
    for (const t of READING) expect(t.lines.length, t.id).toBeGreaterThanOrEqual(8);
  });

  it('carry the clause connectors the rest of the course almost never uses', () => {
    // Barely one lesson utterance in thirteen has one; a learner cannot reach B1 on single clauses.
    const lines = READING.flatMap((t) => t.lines);
    const joined = lines.filter((l) => /\b(że|który|która|które|bo|ponieważ|jeśli|gdy|kiedy|żeby|zanim|niż|ale|więc)\b/i.test(l.pl));
    expect(joined.length / lines.length).toBeGreaterThan(0.25);
  });

  it('have unique ids, a title in both languages and a blurb', () => {
    expect(new Set(READING.map((t) => t.id)).size).toBe(READING.length);
    for (const t of READING) {
      expect(t.id, t.title).toMatch(/^[a-z0-9-]+$/);
      expect(getText(t.id)).toBe(t);
      expect(t.title.length, t.id).toBeGreaterThan(2);
      expect(t.titlePl.length, t.id).toBeGreaterThan(2);
      expect(t.blurb.length, t.id).toBeGreaterThan(20);
    }
  });

  it('are built almost entirely from words the course teaches, and gloss the rest', () => {
    const taught = taughtForms();
    const forms = [...taught];
    for (const t of READING) {
      const glossed = new Set(t.words.flatMap(([pl]) => normalise(pl).split(' ')));
      const glossStems = [...glossed].map(stemOf);
      const words = t.lines.flatMap((l) => normalise(l.pl).split(' ')).filter(Boolean);
      const strange = words.filter(
        (w) =>
          !taught.has(w) &&
          !glossed.has(w) &&
          !glossStems.some((g) => w.startsWith(g)) &&
          !forms.some((f) => f.startsWith(stemOf(w)) || w.startsWith(stemOf(f))),
      );
      expect(strange, `${t.id} uses words that are neither taught nor glossed`).toEqual([]);
    }
  });

  it('are never labelled easier than the unit they need', () => {
    // A text may be labelled harder than its unit — more words, longer sentences — but never easier: claiming A2
    // for a text that leans on B1 grammar sends a learner at something they cannot yet read.
    const rank = { A1: 0, A2: 1, B1: 2 };
    for (const t of READING) {
      const unit = unitByKey(t.after);
      expect(unit, `${t.id} points at unit ${t.after}`).toBeDefined();
      expect(rank[t.level], `${t.id} is ${t.level} but needs unit ${t.after}, which is ${unit!.level}`).toBeGreaterThanOrEqual(rank[unit!.level]);
    }
  });

  it('ask about what the text says, with one right answer among distinct options', () => {
    for (const t of READING) {
      expect(t.questions.filter((q) => q.stage === 'gist').length, `${t.id} needs questions for the listening`).toBeGreaterThanOrEqual(2);
      expect(t.questions.filter((q) => q.stage === 'detail').length, `${t.id} needs questions for the reading`).toBeGreaterThanOrEqual(2);
      for (const q of t.questions) {
        expect(q.options, `${t.id}: "${q.q}"`).toContain(q.answer);
        expect(new Set(q.options).size, `${t.id}: "${q.q}" repeats an option`).toBe(q.options.length);
        expect(q.options.length, `${t.id}: "${q.q}"`).toBeGreaterThanOrEqual(3);
        expect(q.q.endsWith('?'), `${t.id}: "${q.q}" should be a question`).toBe(true);
        // Asked in English: the Polish is what is being understood, not what is being read. A Polish place name
        // is fine — it is capitalised, so only an all-lowercase Polish word gives the question away as Polish.
        const polishWord = q.q.split(/\s+/).find((w) => w === w.toLowerCase() && /[ąćęłńóśźż]/.test(w));
        expect(polishWord, `${t.id}: "${q.q}" asks in Polish`).toBeUndefined();
      }
    }
  });

  it('gloss each new word once, in the form the text uses, and lean on few of them', () => {
    for (const t of READING) {
      expect(new Set(t.words.map(([pl]) => pl)).size, `${t.id} glosses a word twice`).toBe(t.words.length);
      for (const [pl, en] of t.words) {
        expect(en.length, `${t.id}: ${pl} needs a meaning`).toBeGreaterThan(1);
        // A glossed word must actually turn up, in some form, in the text it belongs to.
        const body = t.lines.map((l) => normalise(l.pl)).join(' ');
        const head = normalise(pl).split(' ')[0];
        expect(body.includes(stemOf(head)), `${t.id} glosses ${pl}, which is not in the text`).toBe(true);
      }
      expect(t.words.length, `${t.id} leans on too many new words to be comprehensible`).toBeLessThanOrEqual(12);
    }
  });

  it('never give a woman a man’s lines to read', () => {
    // A recorded voice reads a text right through, so a text with "pojechałem" in it cannot be read by the
    // female voice — and one given that voice must contain nothing a man would say of himself.
    for (const t of READING.filter((x) => x.voice === 'f'))
      for (const l of t.lines) expect(/(łem|łbym|łem się)\b/.test(l.pl), `${t.id}: "${l.pl}"`).toBe(false);
    // And the other way: a text in a woman's forms must not be left to the main voice.
    for (const t of READING.filter((x) => x.voice !== 'f'))
      for (const l of t.lines) expect(inWomansVoice(l.pl), `${t.id}: "${l.pl}" needs the second voice`).toBe(false);
  });

  it('write every line as one sentence, so each can be heard on its own', () => {
    for (const t of READING)
      for (const l of t.lines) {
        expect(l.pl.trim(), t.id).toBe(l.pl);
        expect(l.en.length, `${t.id}: "${l.pl}" needs an English line`).toBeGreaterThan(2);
        expect(l.pl.normalize('NFC'), `${t.id}: "${l.pl}" is not NFC`).toBe(l.pl);
        // Long enough to be a sentence, short enough to hold in the ear at natural speed.
        const words = l.pl.split(/\s+/).length;
        expect(words, `${t.id}: "${l.pl}"`).toBeGreaterThanOrEqual(3);
        expect(words, `${t.id}: "${l.pl}" is too long to follow by ear`).toBeLessThanOrEqual(18);
      }
  });
});

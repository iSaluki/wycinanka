import { ALPHABET, DIGRAPHS } from '../../content/alphabet';
import { CHUNKS, chunkCore } from '../../content/chunks';
import { LESSONS } from '../../content/course';
import { CULTURE } from '../../content/culture';
import { FREQUENCY } from '../../content/frequency';
import { CASES } from '../../content/grammar';
import { PHRASEBOOK } from '../../content/phrasebook';
import { READING } from '../../content/reading';
import { PICTURES } from '../../content/pictures';
import { MINIMAL_PAIRS, SOUND_GROUPS, TONGUE_TWISTERS } from '../../content/sounds';
import { audioKey } from './speech';
import { buildWithChunk, mergeChunks, tokenise } from './exercises';
import { heardInSecondVoice, inWomansVoice, isWoman } from './voices';

/**
 * Every fixed Polish text the app reads aloud: the script list for the pre-recorded voice (scripts/voice).
 * Text made up on the spot (the pronouncer, numbers, prices and times) is left to the browser's own voice.
 * Keys are what speak() would say, so the lookup at play time matches exactly.
 */
export function spokenTexts(): string[] {
  const out: string[] = ['wycinanka', 'Dzień dobry, jak się masz?'];
  const add = (...xs: Array<string | undefined>) => {
    for (const x of xs) if (x) out.push(x);
  };

  for (const l of LESSONS) {
    for (const i of l.items) {
      add(i.pl, ...(i.altPl ?? []), ...(i.ex ?? []));
      // Phonics items are spellings: their examples are read together instead.
      if (i.ex?.length) add(i.ex.join(', '));
    }
    for (const s of l.sentences) {
      add(s.pl, ...(s.altPl ?? []));
      // Sentence-building tiles say themselves when tapped: every word and phrase tile, and the spare words
      // (a sentence's own extras, or words from nearby sentences).
      for (const form of [s.pl, ...(s.altPl ?? [])]) add(...mergeChunks(tokenise(form)), ...tokenise(form));
      add(...(s.extra ?? []));
    }
    for (const d of l.drills) add(d.text.replace('___', d.answer));
    for (const line of l.dialogue ?? []) add(line.pl);
    for (const [pl] of l.spotlight?.examples ?? []) add(pl);
  }
  for (const c of CHUNKS) {
    add(c.pl, chunkCore(c), c.ex?.[0]);
    const build = buildWithChunk(c);
    if (build?.kind === 'build') add(...build.tiles);
    if (c.ex) add(...tokenise(c.ex[0]));
  }
  for (const w of FREQUENCY) {
    add(w.pl, w.ex?.[0]);
    // Example sentences are built from tiles too, and every tile says itself.
    if (w.ex) add(...mergeChunks(tokenise(w.ex[0])), ...tokenise(w.ex[0]));
  }
  for (const p of PICTURES) add(p.pl);
  for (const c of CULTURE) {
    add(...c.words.map(([pl]) => pl));
    // Polish words in the articles say themselves when tapped.
    for (const text of [...c.body, c.video?.caption ?? '', c.image?.caption ?? '']) add(...[...text.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]));
  }
  // Reading texts: every sentence on its own, so each can be tapped, and the new words glossed under them.
  for (const t of READING) {
    for (const l of t.lines) add(l.pl);
    for (const [pl] of t.words) add(pl);
  }
  for (const g of PHRASEBOOK) for (const [pl] of g.phrases) add(pl);
  for (const c of CASES) add(c.example[0]);
  for (const l of ALPHABET) add(l.example[0], `${l.name}. ${l.example[0]}`);
  for (const d of DIGRAPHS) add(d.example[0]);
  for (const g of SOUND_GROUPS) for (const s of g.sounds) add(...s.examples.map((e) => e[0]), s.examples.map((e) => e[0]).join(', '));
  for (const p of MINIMAL_PAIRS) add(p.a[0], p.b[0]);
  for (const [pl] of TONGUE_TWISTERS) add(pl);

  return [...new Set(out.map(audioKey).filter(Boolean))];
}

/**
 * The texts the second (female) voice records (see voices.ts): women's lines in conversations, anything in a
 * woman's first-person forms, and the half of the listening material it reads (words, sentences and example
 * sentences heard in listening questions, "build what you hear" and dictation).
 */
export function femaleTexts(): string[] {
  const out: string[] = [];
  const listening: string[] = [];
  for (const l of LESSONS) {
    for (const d of l.dialogue ?? []) if (isWoman(d.who)) out.push(d.pl);
    for (const i of l.items) listening.push(i.pl, ...(i.altPl ?? []), ...(i.ex ?? []));
    for (const x of l.sentences) listening.push(x.pl, ...(x.altPl ?? []));
  }
  for (const w of FREQUENCY) if (w.ex) listening.push(w.ex[0]);
  // A reading text is read right through by one speaker, so its lines all take the voice the text is given.
  for (const t of READING) if (t.voice === 'f') out.push(...t.lines.map((l) => l.pl));
  // Hashed as written, as the exercises do when they pick a voice.
  out.push(...listening.filter(heardInSecondVoice));
  out.push(...spokenTexts().filter(inWomansVoice));
  return [...new Set(out.map(audioKey).filter(Boolean))];
}

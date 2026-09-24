import { normalise } from '../shared/grade';
import { CHUNKS } from './chunks';
import { LESSONS } from './course';
import { FREQUENCY } from './frequency';
import { DECLENSIONS, PRONOUNS } from './grammar';
import { PHRASEBOOK } from './phrasebook';
import { PICTURES } from './pictures';

/**
 * Every Polish word form the course uses anywhere: lesson words and sentences, drill options (which are real
 * forms by design), dialogues, the frequency list, chunks, phrases and declension tables. The grader uses it to
 * tell a real form with the wrong ending (kawa for kawę) from a typo (kaww).
 */
let words: Set<string> | undefined;

function build(): Set<string> {
  const out = new Set<string>();
  const add = (text: string | undefined) => {
    if (!text) return;
    for (const w of normalise(text.replace(/_{2,}/g, ' ').replace(/\([^)]*\)/g, ' ')).split(' ')) if (w) out.add(w);
  };
  for (const l of LESSONS) {
    if (l.phonics) continue;
    for (const i of l.items) [i.pl, ...(i.altPl ?? [])].forEach(add);
    for (const s of l.sentences) [s.pl, ...(s.altPl ?? []), ...(s.extra ?? [])].forEach(add);
    for (const d of l.drills) [d.text, ...d.options].forEach(add);
    for (const line of l.dialogue ?? []) add(line.pl);
    for (const [pl] of l.spotlight?.examples ?? []) add(pl);
    for (const row of l.spotlight?.table?.rows ?? []) row.forEach(add);
  }
  for (const w of FREQUENCY) [w.pl, w.ex?.[0]].forEach(add);
  for (const c of CHUNKS) [c.pl, c.ex?.[0]].forEach(add);
  for (const g of PHRASEBOOK) for (const [pl] of g.phrases) add(pl);
  for (const p of PICTURES) add(p.pl);
  for (const d of DECLENSIONS) [...d.singular, ...d.plural].forEach(add);
  for (const row of PRONOUNS.rows) row.slice(1).forEach((cell) => cell.split('/').forEach(add));
  return out;
}

/** Whether a (normalised, lower-case) word is a Polish form the course knows. */
export function isKnownForm(word: string): boolean {
  words ??= build();
  return words.has(word);
}

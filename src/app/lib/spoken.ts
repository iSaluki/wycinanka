import { ALPHABET, DIGRAPHS } from '../../content/alphabet';
import { CHUNKS, chunkCore } from '../../content/chunks';
import { LESSONS } from '../../content/course';
import { CULTURE } from '../../content/culture';
import { FREQUENCY } from '../../content/frequency';
import { CASES } from '../../content/grammar';
import { PHRASEBOOK } from '../../content/phrasebook';
import { PICTURES } from '../../content/pictures';
import { MINIMAL_PAIRS, SOUND_GROUPS, TONGUE_TWISTERS } from '../../content/sounds';
import { audioKey } from './speech';

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
    for (const s of l.sentences) add(s.pl, ...(s.altPl ?? []));
    for (const d of l.drills) add(d.text.replace('___', d.answer));
    for (const line of l.dialogue ?? []) add(line.pl);
    for (const [pl] of l.spotlight?.examples ?? []) add(pl);
  }
  for (const c of CHUNKS) add(c.pl, chunkCore(c), c.ex?.[0]);
  for (const w of FREQUENCY) add(w.pl, w.ex?.[0]);
  for (const p of PICTURES) add(p.pl);
  for (const c of CULTURE) for (const [pl] of c.words) add(pl);
  for (const g of PHRASEBOOK) for (const [pl] of g.phrases) add(pl);
  for (const c of CASES) add(c.example[0]);
  for (const l of ALPHABET) add(l.example[0], `${l.name}. ${l.example[0]}`);
  for (const d of DIGRAPHS) add(d.example[0]);
  for (const g of SOUND_GROUPS) for (const s of g.sounds) add(...s.examples.map((e) => e[0]), s.examples.map((e) => e[0]).join(', '));
  for (const p of MINIMAL_PAIRS) add(p.a[0], p.b[0]);
  for (const [pl] of TONGUE_TWISTERS) add(pl);

  return [...new Set(out.map(audioKey).filter(Boolean))];
}

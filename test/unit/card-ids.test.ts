import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/content/course';
import saved from './card-ids.json';

/**
 * Learners' review cards are stored under these ids. If a card's id disappears, or now names different Polish,
 * every learner who had it loses (or inherits the wrong) review history. When you correct the Polish of a
 * sentence on purpose, give it `key: 's3'` (its old id) in the lesson, or accept the reset and update
 * card-ids.json by adding the new id; never delete or change an entry.
 */
describe('card ids are stable', () => {
  const now = new Map<string, string>();
  for (const l of LESSONS) {
    for (const i of l.items) now.set(i.id, i.pl);
    for (const s of l.sentences) now.set(s.id, s.pl);
    for (const d of l.drills) now.set(d.id, `${d.text}|${d.answer}`);
  }

  it('keeps every id learners may already have', () => {
    const missing = Object.keys(saved).filter((id) => !now.has(id));
    expect(missing, 'Card ids that no longer exist').toEqual([]);
  });

  it('never moves an id onto different Polish', () => {
    const moved = Object.entries(saved as Record<string, string>)
      .filter(([id, text]) => now.has(id) && now.get(id) !== (CORRECTED[id] ?? text))
      .map(([id, text]) => `${id}: "${text}" → "${now.get(id)}"`);
    expect(moved).toEqual([]);
  });

  it('lists every current id, so new content is protected too', () => {
    const unsaved = [...now.keys()].filter((id) => !(id in saved));
    expect(unsaved, 'Run `npm run ids` to record these').toEqual([]);
  });
});

/** Deliberate corrections that keep a card's id: the same sentence or drill, spelt or phrased better. id → new text. */
const CORRECTED: Record<string, string> = {
  // The vocative, as the course teaches from Unit 2 (the plain name is still accepted).
  'u01-l3:s1': 'Cześć, Kasiu!',
  // "Przepraszam, proszę" is not something Polish speakers say.
  'u02-l2:s2': 'Przepraszam, czy mogę?',
  // Consistent with u23-l3, which teaches "Nie zapomnij kluczy!" and offers "klucze" as the wrong tile.
  'u12-l2:d2': 'Zawsze ___ kluczy!|zapominam',
  // The clitic goes before the verb: "bardzo mi smakuje", not "bardzo smakuje mi".
  'u16-l1:d4': 'Ta zupa bardzo mi ___.|smakuje',
};

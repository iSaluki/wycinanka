/**
 * Adds new lesson card ids to test/unit/card-ids.json, the record of ids learners' review cards may be stored
 * under. Existing entries are never changed or removed: test/unit/card-ids.test.ts explains what to do instead.
 *
 *     npm run ids
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { LESSONS } from '../src/content/course';

const FILE = 'test/unit/card-ids.json';
const saved = JSON.parse(readFileSync(FILE, 'utf8')) as Record<string, string>;
let added = 0;
for (const l of LESSONS) {
  const entries: Array<[string, string]> = [
    ...l.items.map((i): [string, string] => [i.id, i.pl]),
    ...l.sentences.map((s): [string, string] => [s.id, s.pl]),
    ...l.drills.map((d): [string, string] => [d.id, `${d.text}|${d.answer}`]),
  ];
  for (const [id, text] of entries) {
    if (id in saved) continue;
    saved[id] = text;
    added++;
  }
}
writeFileSync(FILE, JSON.stringify(saved, null, 1) + '\n');
console.log(`${added} new card id${added === 1 ? '' : 's'} recorded.`);

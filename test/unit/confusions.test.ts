import { beforeEach, describe, expect, it } from 'vitest';
import { clearConfusions, confusionBonus, knownConfusions, noteConfusion } from '../../src/app/lib/confusions';

/**
 * Wrong answers the learner has actually chosen, kept on the device. There is no localStorage here, which is
 * also how a private window behaves: everything must keep working, just without outliving the visit.
 */
describe('remembering the wrong answers a learner chooses', () => {
  beforeEach(() => clearConfusions());

  it('remembers what was chosen for a card, newest first', () => {
    noteConfusion('u06-l1:kawa', 'kawa');
    noteConfusion('u06-l1:kawa', 'kawą');
    expect(knownConfusions('u06-l1:kawa')).toEqual(['kawą', 'kawa']);
    expect(knownConfusions('u06-l1:herbata')).toEqual([]);
  });

  it('counts the same wrong answer once, however often it is chosen', () => {
    noteConfusion('x', 'kawa');
    noteConfusion('x', 'kawą');
    noteConfusion('x', 'Kawa!');
    expect(knownConfusions('x')).toEqual(['Kawa!', 'kawą']);
  });

  it('keeps only the last few per card, so one card cannot fill the device', () => {
    for (const w of ['a', 'b', 'c', 'd', 'e']) noteConfusion('x', w);
    expect(knownConfusions('x')).toEqual(['e', 'd', 'c']);
  });

  it('ignores an empty answer or a missing card', () => {
    noteConfusion('x', '   ');
    noteConfusion('', 'kawa');
    expect(knownConfusions('x')).toEqual([]);
  });

  it('gives no bonus at all for a card with nothing recorded, so the check can be skipped', () => {
    expect(confusionBonus('never-missed')).toBeUndefined();
  });

  it('weights the most recent mistake highest, and anything else at nothing', () => {
    noteConfusion('x', 'kawa');
    noteConfusion('x', 'kawą');
    const bonus = confusionBonus('x')!;
    expect(bonus('kawą')).toBeGreaterThan(bonus('kawa'));
    expect(bonus('kawa')).toBeGreaterThan(0);
    expect(bonus('herbata')).toBe(0);
    // Written differently, it is still the same wrong answer.
    expect(bonus('Kawą')).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/content/course';
import { lessonExercises } from '../../src/app/lib/exercises';
import { speakable } from '../../src/app/lib/speech';

describe('speakable', () => {
  it('drops English glosses, gaps and the slash between spellings', () => {
    expect(speakable('woda (water)')).toBe('woda');
    expect(speakable('Jak się pani ma? (to a woman you have just met)')).toBe('Jak się pani ma?');
    expect(speakable('Wczoraj (ja — Anna) byłam w domu.')).toBe('Wczoraj byłam w domu.');
    expect(speakable('on / ona / ono')).toBe('on, ona, ono');
    expect(speakable('Idę do ___.')).toBe('Idę do.');
    expect(speakable('Dzień dobry')).toBe('Dzień dobry');
    expect(speakable('45 = czterdzieści pięć')).toBe('czterdzieści pięć');
  });

  it('never reads an English gloss aloud after a gap is filled', () => {
    for (const l of LESSONS) {
      for (const d of l.drills) {
        const said = speakable(d.text.replace('___', d.answer));
        expect(said, d.id).not.toMatch(/[()=_]/);
      }
    }
  });

  it('reads example words, not spelling labels, in phonics lessons', () => {
    for (const l of LESSONS.filter((x) => x.phonics)) {
      for (const i of l.items) expect(i.ex?.length, i.id).toBeGreaterThan(0);
      for (const ex of lessonExercises(l)) {
        if (ex.kind === 'choose' && (ex.instruction === 'How does it sound?' || ex.instruction === 'Which spelling makes this sound?')) {
          expect(ex.say, ex.cardId).toBeTruthy();
        }
        if (ex.kind === 'match') for (const p of ex.pairs) expect(p.say, p.cardId).toBeTruthy();
      }
    }
  });
});

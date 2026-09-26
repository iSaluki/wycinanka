import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/content/course';
import { heardInSecondVoice, inWomansVoice, isWoman, voiceFor } from '../../src/app/lib/voices';

/** Every speaker in the course's dialogues. A new name must be added here, so its voice is checked by a person. */
const WOMEN = [
  'Ola', 'Ania', 'Kasia', 'Emma', 'Pani Nowak', 'Anna', 'Mama', 'Ewa', 'Nauczycielka', 'Kelnerka', 'Marta', 'Agentka',
  'Turystka', 'Pani', 'Kasjerka', 'Recepcjonistka', 'Lekarka', 'Farmaceutka', 'Klientka', 'Ekspedientka', 'Sekretarka',
  'Pracownica', 'Recepcja', 'Właścicielka', 'Sprzedawczyni',
];
const MEN = [
  'Tom', 'Jack', 'Kelner', 'Pan Smith', 'Marek', 'Adam', 'Tomek', 'Klient', 'Barman', 'Piotr', 'Ben', 'Pan', 'Szef',
  'Podróżny', 'Pacjent', 'Pracownik', 'Przewodnik', 'Pasażer', 'Turysta', 'Sprzedawca', 'Tata',
];

describe('two voices', () => {
  it("reads women's lines in the female voice and men's in the male one", () => {
    for (const w of WOMEN) expect(isWoman(w), w).toBe(true);
    for (const m of MEN) expect(isWoman(m), m).toBe(false);
    const speakers = new Set(LESSONS.flatMap((l) => (l.dialogue ?? []).map((d) => d.who)));
    for (const who of speakers) expect([...WOMEN, ...MEN], `new speaker "${who}": add to WOMEN or MEN`).toContain(who);
  });

  it("gives a woman's first-person forms the female voice", () => {
    expect(inWomansVoice('Byłam wczoraj w kinie.')).toBe(true);
    expect(inWomansVoice('Poszłabym, ale nie mam czasu.')).toBe(true);
    expect(inWomansVoice('Byłem wczoraj w kinie.')).toBe(false);
    expect(inWomansVoice('Łamie się.')).toBe(false);
    expect(voiceFor('Byłam w domu.')).toBe('f');
    expect(voiceFor('Jestem w domu.')).toBe('m');
  });

  it('splits listening practice between the voices, always the same way for a text', () => {
    const texts = LESSONS.flatMap((l) => l.sentences.map((s) => s.pl));
    const second = texts.filter(heardInSecondVoice).length / texts.length;
    expect(second).toBeGreaterThan(0.35);
    expect(second).toBeLessThan(0.65);
    for (const t of texts.slice(0, 20)) expect(voiceFor(t, true)).toBe(voiceFor(t, true));
  });
});

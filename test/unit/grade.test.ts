import { describe, expect, it } from 'vitest';
import { grade, levenshtein, normalise, passes, stripDiacritics } from '../../src/shared/grade';

describe('grade (Polish)', () => {
  it('accepts exact answers ignoring case, punctuation and extra spaces', () => {
    expect(grade('  poproszę   KAWĘ ', ['Poproszę kawę.'], 'pl').verdict).toBe('correct');
  });

  it('accepts alternative answers', () => {
    expect(grade('dziś', ['dzisiaj', 'dziś'], 'pl')).toMatchObject({ verdict: 'correct', expected: 'dziś' });
  });

  it('flags missing diacritics and names the letters', () => {
    const r = grade('dziekuje', ['dziękuję'], 'pl');
    expect(r.verdict).toBe('accent');
    expect(r.accents).toEqual([['ę', 'e']]);
    expect(grade('mały', ['mały'], 'pl').verdict).toBe('correct');
    expect(grade('maly', ['mały'], 'pl').accents).toEqual([['ł', 'l']]);
  });

  it('forgives one slip in longer words but not in short ones', () => {
    expect(grade('przeprasam', ['przepraszam'], 'pl').verdict).toBe('typo');
    expect(grade('kod', ['kot'], 'pl').verdict).toBe('wrong');
  });

  it('marks unrelated answers wrong and reports the expected answer', () => {
    expect(grade('herbata', ['kawa'], 'pl')).toMatchObject({ verdict: 'wrong', expected: 'kawa' });
    expect(grade('', ['kawa'], 'pl').verdict).toBe('wrong');
  });
});

describe('grade (English)', () => {
  it('ignores articles and common contractions', () => {
    expect(grade('the bill', ['bill'], 'en').verdict).toBe('correct');
    expect(grade("I'm cold", ['I am cold.'], 'en').verdict).toBe('correct');
    expect(grade('a coffee with milk please', ['A coffee with milk, please.'], 'en').verdict).toBe('correct');
  });
});

describe('helpers', () => {
  it('normalises typographic quotes and punctuation', () => {
    expect(normalise('„Dzień dobry!”')).toBe('dzień dobry');
  });
  it('strips every Polish diacritic', () => {
    expect(stripDiacritics('ąćęłńóśźż')).toBe('acelnoszz');
  });
  it('computes edit distance', () => {
    expect(levenshtein('kot', 'kod')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
  });
});

import { preferForm } from '../../src/app/lib/exercises';

describe('speaker-gendered forms', () => {
  it('shows the feminine past tense to a woman and keeps both accepted', () => {
    const item = { pl: 'byłem', altPl: ['byłam'] };
    expect(preferForm(item, 'f')).toEqual({ pl: 'byłam', altPl: ['byłem'] });
    expect(preferForm(item, 'm')).toBe(item);
    expect(preferForm({ pl: 'czytałam', altPl: ['czytałem'] }, 'm').pl).toBe('czytałem');
    expect(preferForm({ pl: 'Wczoraj byłem w pracy.', altPl: ['Wczoraj byłam w pracy.', 'Byłem wczoraj w pracy.'] }, 'f').pl).toBe(
      'Wczoraj byłam w pracy.',
    );
  });
  it('leaves words without gendered forms alone', () => {
    const item = { pl: 'dziś', altPl: ['dzisiaj'] };
    expect(preferForm(item, 'f')).toBe(item);
  });
});

import { isKnownForm } from '../../src/content/lexicon';

describe('grade: endings are grammar, not typos', () => {
  const pl = (typed: string, answer: string) => grade(typed, [answer], 'pl', isKnownForm);

  it('never forgives a wrong case ending as a slip', () => {
    for (const [t, a] of [
      ['Poproszę kawa', 'Poproszę kawę'],
      ['Mam koty', 'Mam kota'],
      ['Idę do pracę', 'Idę do pracy'],
      ['Mamy psy i kota', 'Mamy psa i kota'],
    ]) {
      const r = pl(t, a);
      expect(r.verdict, t).toBe('form');
      expect(passes(r.verdict)).toBe(false);
    }
    expect(pl('Poproszę kawa', 'Poproszę kawę').endings).toEqual([['kawa', 'kawę']]);
  });

  it('tells a real form without Polish letters from a missing accent', () => {
    expect(pl('Rozmawiałam z mama', 'Rozmawiałam z mamą').verdict).toBe('form');
    expect(pl('pracuje', 'pracuję').verdict).toBe('form');
    expect(pl('dziekuje', 'dziękuję').verdict).toBe('accent');
    expect(pl('Poproszę kawe', 'Poproszę kawę').verdict).toBe('accent');
  });

  it('still forgives a typo at the end of a word that is not a real form', () => {
    expect(pl('Mieszkm w Londynie', 'Mieszkam w Londynie').verdict).toBe('typo');
    expect(pl('przeprasam', 'przepraszam').verdict).toBe('typo');
  });

  it('without a word list, a changed ending is still a grammar mistake', () => {
    expect(grade('Poproszę kawa', ['Poproszę kawę'], 'pl').verdict).toBe('form');
    expect(grade('Mam koty', ['Mam kota'], 'pl').verdict).toBe('form');
  });

  it('accepts another right answer rather than calling it a wrong form', () => {
    expect(grade('Jestem nauczycielką', ['Jestem nauczycielem', 'Jestem nauczycielką'], 'pl', isKnownForm).verdict).toBe('correct');
  });
});

import { describe, expect, it } from 'vitest';
import { numberToWords, pluralForm, priceToWords, timeToWords } from '../../src/shared/numbers';

describe('numbers', () => {
  it('spells out numbers', () => {
    expect(numberToWords(0)).toBe('zero');
    expect(numberToWords(13)).toBe('trzynaście');
    expect(numberToWords(45)).toBe('czterdzieści pięć');
    expect(numberToWords(212)).toBe('dwieście dwanaście');
    expect(numberToWords(1000)).toBe('tysiąc');
    expect(numberToWords(1999)).toBe('tysiąc dziewięćset dziewięćdziesiąt dziewięć');
    expect(numberToWords(2024)).toBe('dwa tysiące dwadzieścia cztery');
    expect(numberToWords(5000)).toBe('pięć tysięcy');
    expect(numberToWords(12_000)).toBe('dwanaście tysięcy');
    expect(numberToWords(22_000)).toBe('dwadzieścia dwa tysiące');
  });

  it('agrees one and two with the noun gender', () => {
    expect(numberToWords(1, 'f')).toBe('jedna');
    expect(numberToWords(1, 'n')).toBe('jedno');
    expect(numberToWords(2, 'f')).toBe('dwie');
    expect(numberToWords(22, 'f')).toBe('dwadzieścia dwie');
    expect(numberToWords(21, 'f')).toBe('dwadzieścia jeden');
  });

  it('chooses the noun form after a number', () => {
    expect([1, 2, 4, 5, 12, 14, 21, 22, 25, 112, 122].map(pluralForm)).toEqual([
      'one', 'few', 'few', 'many', 'many', 'many', 'many', 'few', 'many', 'many', 'few',
    ]);
  });

  it('reads prices', () => {
    expect(priceToWords(1)).toBe('jeden złoty');
    expect(priceToWords(3)).toBe('trzy złote');
    expect(priceToWords(12.5)).toBe('dwanaście złotych pięćdziesiąt groszy');
    expect(priceToWords(0.02)).toBe('dwa grosze');
    expect(priceToWords(24.99)).toBe('dwadzieścia cztery złote dziewięćdziesiąt dziewięć groszy');
  });
});

describe('clock', () => {
  it('tells the time formally and in everyday speech', () => {
    expect(timeToWords(7, 30)).toEqual({ formal: 'Jest siódma trzydzieści.', everyday: 'Jest wpół do ósmej.', at: 'o siódmej trzydzieści' });
    expect(timeToWords(15, 0).formal).toBe('Jest piętnasta.');
    expect(timeToWords(15, 0).everyday).toBe('Jest trzecia.');
    expect(timeToWords(8, 15).everyday).toBe('Jest kwadrans po ósmej.');
    expect(timeToWords(8, 45).everyday).toBe('Jest za kwadrans dziewiąta.');
    expect(timeToWords(8, 10).everyday).toBe('Jest dziesięć po ósmej.');
    expect(timeToWords(8, 50).everyday).toBe('Jest za dziesięć dziewiąta.');
    expect(timeToWords(21, 5).formal).toBe('Jest dwudziesta pierwsza zero pięć.');
    expect(timeToWords(11, 30).everyday).toBe('Jest wpół do dwunastej.');
  });
});

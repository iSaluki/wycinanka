import { describe, expect, it } from 'vitest';
import { pronounce, respell } from '../../src/shared/phonetics';

const ipa = (w: string) => pronounce(w)[0].ipa;

describe('pronunciation engine', () => {
  it('reads digraphs and surprising letters', () => {
    expect(respell('woda')).toBe('VO-da');
    expect(respell('szkoła')).toBe('SHKO-wa');
    expect(respell('czas')).toBe('chas');
    expect(respell('chleb')).toBe('khlep');
    expect(respell('rzeka')).toBe('ZHE-ka');
  });

  it('softens consonants before i, and hides i before a vowel', () => {
    expect(ipa('ciocia')).toBe('ˈt͡ɕɔ.t͡ɕa');
    expect(ipa('nie')).toBe('ɲɛ');
    expect(ipa('pić')).toBe('pit͡ɕ');
    expect(ipa('dziecko')).toBe('ˈd͡ʑɛt͡s.kɔ');
    expect(ipa('miasto')).toBe('ˈmʲa.stɔ');
  });

  it('applies final devoicing and voicing assimilation', () => {
    expect(ipa('chleb')).toBe('xlɛp');
    expect(ipa('wtorek')).toBe('ˈftɔ.rɛk');
    expect(ipa('twój')).toBe('tfuj');
    expect(ipa('przepraszam')).toBe('pʂɛ.ˈpra.ʂam');
    expect(ipa('łóżko')).toBe('ˈwu.ʂkɔ');
  });

  it('handles nasal vowels by position', () => {
    expect(ipa('dziękuję')).toBe('d͡ʑɛŋ.ˈku.jɛ');
    expect(ipa('ząb')).toBe('zɔmp');
    expect(ipa('są')).toBe('sɔ̃');
    expect(ipa('ręka')).toBe('ˈrɛŋ.ka');
  });

  it('stresses the second-to-last syllable', () => {
    expect(respell('dziękuję')).toBe('jeng-KOO-ye');
    expect(respell('Polska')).toBe('POL-ska');
    expect(respell('szczęście')).toBe('SHCHEN-shche');
  });

  it('keeps consonant + rz onsets together', () => {
    expect(respell('Szczebrzeszyn')).toBe('shche-BZHE-shin');
  });

  it('reads phrases and ignores punctuation', () => {
    expect(pronounce('Dzień dobry!').map((w) => w.respelling)).toEqual(["jen'", 'DO-bri']);
  });
});

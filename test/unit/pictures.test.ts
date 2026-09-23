import { describe, expect, it } from 'vitest';
import { getCard, isCardId, LESSONS } from '../../src/content/course';
import { FREQUENCY } from '../../src/content/frequency';
import { PICTURE_DECKS, PICTURES } from '../../src/content/pictures';
import { normalise } from '../../src/shared/grade';
import { pictureChoice, reviewExercise } from '../../src/app/lib/exercises';

const SVGS = import.meta.glob<string>('../../public/pictures/*.svg', { query: '?raw', import: 'default', eager: true });
const svgFor = (img: string) => SVGS[`../../public${img}`];

describe('picture flashcards', () => {
  it('has unique, valid card ids that do not clash with the course', () => {
    const ids = PICTURES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^pic-[a-z0-9-]{1,60}$/);
    const other = new Set([...LESSONS.flatMap((l) => [...l.items, ...l.sentences, ...l.drills].map((x) => x.id)), ...FREQUENCY.map((w) => w.id)]);
    for (const id of ids) expect(other.has(id), id).toBe(false);
  });

  it('registers every picture as a review card', () => {
    for (const p of PICTURES) {
      expect(isCardId(p.id)).toBe(true);
      expect(getCard(p.id)?.kind).toBe('picture');
    }
  });

  it('ships a self-hosted SVG for every picture, and no unused ones', () => {
    for (const p of PICTURES) {
      expect(p.img).toMatch(/^\/pictures\/[a-z0-9-]+\.svg$/);
      expect(svgFor(p.img), p.img).toMatch(/^<svg /);
    }
    expect(Object.keys(SVGS)).toHaveLength(PICTURES.length);
  });

  it('keeps each deck unambiguous: at least four pictures, all with different words', () => {
    for (const d of PICTURE_DECKS) {
      expect(d.pictures.length, d.id).toBeGreaterThanOrEqual(4);
      const pl = d.pictures.map((p) => normalise(p.pl));
      const en = d.pictures.map((p) => normalise(p.en));
      expect(new Set(pl).size, d.id).toBe(pl.length);
      expect(new Set(en).size, d.id).toBe(en.length);
    }
    const all = PICTURES.map((p) => normalise(p.pl));
    expect(all.filter((w, i) => all.indexOf(w) !== i)).toEqual([]);
  });

  it('quizzes a picture with four Polish options, one of them right', () => {
    for (const d of PICTURE_DECKS)
      for (const p of d.pictures) {
        const ex = pictureChoice(p, d.pictures.map((x) => x.pl));
        if (ex.kind !== 'choose') throw new Error('expected a choice');
        expect(ex.image).toBe(p.img);
        expect(ex.options).toHaveLength(4);
        expect(new Set(ex.options).size).toBe(4);
        expect(ex.options).toContain(p.pl);
        expect(ex.answer).toBe(p.pl);
        for (const o of ex.options) expect(d.pictures.some((x) => x.pl === o)).toBe(true);
      }
  });

  it('reviews picture cards as picture quizzes', () => {
    const p = PICTURES[0];
    const ex = reviewExercise(getCard(p.id)!, 5, p.id);
    expect(ex.kind === 'choose' && ex.image).toBe(p.img);
  });
});

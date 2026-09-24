import { describe, expect, it } from 'vitest';
import { CULTURE, CULTURE_THEMES } from '../../src/content/culture';
import { respell } from '../../src/shared/phonetics';
import { speakable } from '../../src/app/lib/speech';

describe('culture notes', () => {
  it('have unique, URL-safe ids and a known theme', () => {
    const ids = CULTURE.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CULTURE) {
      expect(c.id).toMatch(/^[a-z-]+$/);
      expect(CULTURE_THEMES.map((t) => t.id)).toContain(c.theme);
    }
    for (const t of CULTURE_THEMES) expect(CULTURE.some((c) => c.theme === t.id), t.id).toBe(true);
  });

  it('each have an article and Polish words to take away', () => {
    for (const c of CULTURE) {
      expect(c.body.length, c.id).toBeGreaterThan(0);
      expect(c.words.length, c.id).toBeGreaterThanOrEqual(4);
      for (const [pl, en] of c.words) {
        expect(pl.trim(), c.id).toBe(pl);
        expect(en.length, pl).toBeGreaterThan(0);
        // Every word is read aloud as written and can be respelt.
        expect(speakable(pl), pl).toBe(pl);
        expect(respell(pl).length, pl).toBeGreaterThan(0);
      }
    }
  });

  it('use balanced lesson markup', () => {
    for (const c of CULTURE) {
      for (const p of c.body) {
        expect((p.match(/\*\*/g) ?? []).length % 2, `${c.id}: ${p}`).toBe(0);
        expect((p.match(/\{/g) ?? []).length, `${c.id}: ${p}`).toBe((p.match(/\}/g) ?? []).length);
      }
    }
  });

  it('have a few videos, each a real YouTube id with a title, channel and caption', () => {
    const videos = CULTURE.flatMap((c) => (c.video ? [c.video] : []));
    // A few, well chosen: not one on every note.
    expect(videos.length).toBeGreaterThanOrEqual(3);
    expect(videos.length).toBeLessThanOrEqual(CULTURE.length / 2);
    expect(new Set(videos.map((v) => v.youtube)).size).toBe(videos.length);
    for (const v of videos) {
      expect(v.youtube).toMatch(/^[\w-]{11}$/);
      expect(v.title.length, v.youtube).toBeGreaterThan(0);
      expect(v.channel.length, v.youtube).toBeGreaterThan(0);
      expect((v.caption.match(/\{/g) ?? []).length, v.caption).toBe((v.caption.match(/\}/g) ?? []).length);
    }
    // Sto lat, as sung by real people, goes with name days.
    expect(CULTURE.find((c) => c.id === 'imieniny')?.video).toBeTruthy();
  });
});

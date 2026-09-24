import { existsSync, readFileSync } from 'node:fs';
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

  it('mark Polish in the articles so it can be tapped and heard as written', () => {
    for (const c of CULTURE) {
      const marked = c.body.flatMap((p) => [...p.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]));
      expect(marked.length, c.id).toBeGreaterThan(0);
      for (const pl of marked) expect(speakable(pl), `${c.id}: ${pl}`).toBe(pl);
      // A bolded Polish term is written **{like this}**, never as plain bold around braces or vice versa.
      for (const p of c.body) expect(p, c.id).not.toMatch(/\{\*\*|\*\*\}/);
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

  it('have pictures that exist, with alt text and a full credit', () => {
    const pictured = CULTURE.filter((c) => c.image);
    expect(pictured.length).toBeGreaterThanOrEqual(10);
    for (const { id, image } of pictured) {
      const file = `public${image!.src}`;
      expect(existsSync(file), file).toBe(true);
      // Declared size matches the file (JPEG SOF0/SOF2 marker), so the page doesn't jump as it loads.
      const buf = readFileSync(file);
      let i = 2;
      while (i < buf.length && !(buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2))) i += 2 + buf.readUInt16BE(i + 2);
      expect([buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)], id).toEqual([image!.width, image!.height]);
      expect(image!.alt.length, id).toBeGreaterThan(10);
      expect(image!.author.length, id).toBeGreaterThan(0);
      expect(image!.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(buf.length, `${id} should stay small`).toBeLessThan(250_000);
    }
  });
});

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
});

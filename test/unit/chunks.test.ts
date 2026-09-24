import { describe, expect, it } from 'vitest';
import { chunkCore, CHUNK_DECKS, CHUNKS } from '../../src/content/chunks';
import { getCard, LESSONS } from '../../src/content/course';
import { normalise } from '../../src/shared/grade';
import { buildWithChunk, chunkExercise, chunkLearnSession, completeChunk, mergeChunks, tokenise } from '../../src/app/lib/exercises';

describe('lexical chunks', () => {
  it('are review cards with unique ids and distinct meanings', () => {
    const ids = CHUNKS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CHUNKS) {
      expect(c.id).toMatch(/^chunk-[a-z0-9-]{1,57}$/);
      expect(getCard(c.id)?.kind, c.id).toBe('chunk');
      expect(chunkCore(c).split(' ').length, c.pl).toBeGreaterThanOrEqual(2);
    }
    const ens = CHUNKS.map((c) => normalise(c.en));
    expect(new Set(ens).size).toBe(ens.length);
    for (const d of CHUNK_DECKS) expect(d.chunks.length).toBeGreaterThanOrEqual(5);
  });

  it('appear whole in their example sentences, so they can be one tile', () => {
    for (const c of CHUNKS.filter((x) => x.ex)) {
      const ex = buildWithChunk(c)!;
      expect(ex.kind).toBe('build');
      if (ex.kind !== 'build') continue;
      const core = chunkCore(c);
      expect(ex.tiles.map(normalise), c.pl).toContain(normalise(core));
      // The right tiles, in order, grade as the example sentence.
      const right = mergeChunks(tokenise(c.ex![0]), [{ core: tokenise(core).map((w) => w.toLocaleLowerCase('pl')) }]);
      expect(normalise(right.join(' '))).toBe(normalise(c.ex![0]));
    }
  });

  it('blank a real word of the phrase, never the capitalised first one', () => {
    for (const c of CHUNKS) {
      for (let i = 0; i < 10; i++) {
        const ex = completeChunk(c);
        if (ex.kind !== 'gap') throw new Error('expected a gap');
        expect(ex.text, c.pl).toContain('___');
        expect(ex.options).toContain(ex.answer);
        expect(new Set(ex.options.map(normalise)).size).toBe(ex.options.length);
        expect(normalise(ex.text.replace('___', ex.answer))).toBe(normalise(c.pl));
        expect(ex.answer, c.pl).not.toBe(tokenise(chunkCore(c))[0]);
      }
    }
  });

  it('give an exercise at every stage and a full first session', () => {
    for (const c of CHUNKS) for (const reps of [0, 1, 2, 3, 6]) expect(chunkExercise(c, reps), `${c.id} ${reps}`).toBeTruthy();
    const session = chunkLearnSession(CHUNK_DECKS[0].chunks);
    expect(session[0].kind).toBe('meet');
    expect(session.filter((e) => e.kind === 'gap')).toHaveLength(CHUNK_DECKS[0].chunks.length);
  });

  it('keep every lesson sentence buildable when chunks become single tiles', () => {
    let merged = 0;
    for (const l of LESSONS)
      for (const s of l.sentences) {
        const tiles = mergeChunks(tokenise(s.pl));
        if (tiles.length < tokenise(s.pl).length) merged++;
        expect(normalise(tiles.join(' ')), s.id).toBe(normalise(tokenise(s.pl).join(' ')));
      }
    // Lessons really do use chunks.
    expect(merged).toBeGreaterThan(5);
  });
});

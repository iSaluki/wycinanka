import { describe, expect, it } from 'vitest';
import { MIGRATIONS, statements } from '../../src/worker/migrations';

describe('bundled migrations', () => {
  it('match migrations/*.sql exactly, in order', () => {
    const files = import.meta.glob<string>('../../migrations/*.sql', { query: '?raw', import: 'default', eager: true });
    const onDisk = Object.entries(files)
      .map(([path, sql]) => ({ name: path.split('/').pop()!, sql }))
      .sort((a, b) => a.name.localeCompare(b.name));
    expect(MIGRATIONS).toEqual(onDisk);
  });

  it('split into whole statements without comments', () => {
    const s = statements(MIGRATIONS[0].sql);
    expect(s.length).toBe(7);
    for (const stmt of s) {
      expect(stmt).toMatch(/^CREATE (TABLE|INDEX) /);
      expect(stmt).not.toContain('--');
    }
  });
});

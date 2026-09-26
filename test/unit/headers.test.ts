import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FILE_POLICY, pagePolicy, SECURITY_HEADERS } from '../../src/worker/pages';

/** The headers public/_headers gives every file (its "/*" block). */
function headersForAll(): Record<string, string> {
  const text = readFileSync('public/_headers', 'utf8');
  const block = text.split(/\n(?=\/)/).find((b) => b.trimStart().startsWith('/*'))!;
  return Object.fromEntries(
    block
      .split('\n')
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()]),
  );
}

describe('security headers', () => {
  const all = headersForAll();

  it('are the same whether a file comes straight from the assets or through the Worker', () => {
    const { 'Content-Security-Policy': csp, ...rest } = all;
    expect(SECURITY_HEADERS).toEqual(rest);
    expect(FILE_POLICY).toBe(csp);
  });

  it('let pages run only our scripts, the analytics beacon and scripts carrying the nonce', () => {
    const p = pagePolicy('abc123');
    expect(p).toContain("script-src 'self' 'nonce-abc123' https://static.cloudflareinsights.com;");
    expect(p).not.toContain('unsafe-inline');
    expect(p).toContain("connect-src 'self' https://cloudflareinsights.com;");
  });
});

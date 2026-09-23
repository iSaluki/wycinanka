import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/worker/crypto';

const PEPPER = 'unit-test-pepper-0123456789abcdefghij';
const ITER = 10_000;

describe('password hashing', () => {
  it('peppers hashes when a pepper is configured', async () => {
    const h = await hashPassword('correct horse battery', PEPPER, ITER);
    expect(h).toMatch(/^pbkdf2-sha256\$10000\$/);
    expect(await verifyPassword('correct horse battery', h, PEPPER, ITER)).toEqual({ ok: true, rehash: false });
    expect((await verifyPassword('wrong horse battery', h, PEPPER, ITER)).ok).toBe(false);
    expect((await verifyPassword('correct horse battery', h, PEPPER + 'x', ITER)).ok).toBe(false);
  });

  it('works without a pepper, and marks those hashes', async () => {
    for (const pepper of [undefined, '', 'too-short']) {
      const h = await hashPassword('correct horse battery', pepper, ITER);
      expect(h).toMatch(/^pbkdf2-sha256-np\$/);
      expect(await verifyPassword('correct horse battery', h, pepper, ITER)).toEqual({ ok: true, rehash: false });
    }
  });

  it('upgrades unpeppered hashes once a pepper is set', async () => {
    const h = await hashPassword('correct horse battery', undefined, ITER);
    expect(await verifyPassword('correct horse battery', h, PEPPER, ITER)).toEqual({ ok: true, rehash: true });
  });

  it('fails closed when a peppered hash is checked without the pepper', async () => {
    const h = await hashPassword('correct horse battery', PEPPER, ITER);
    expect(await verifyPassword('correct horse battery', h, undefined, ITER)).toEqual({ ok: false, rehash: false });
  });
});

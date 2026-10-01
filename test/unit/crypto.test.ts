import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, wrapHash } from '../../src/worker/crypto';

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

  it('wraps unpeppered hashes with the pepper, without the password', async () => {
    const h = await hashPassword('correct horse battery', undefined, ITER);
    const w = await wrapHash(h, PEPPER);
    expect(w).toMatch(/^pbkdf2-sha256-w\$10000\$/);
    expect(w!.split('$')[2]).toBe(h.split('$')[2]);
    expect(w!.split('$')[3]).not.toBe(h.split('$')[3]);
    // Verifies with the pepper and asks to be replaced by a plain peppered hash.
    expect(await verifyPassword('correct horse battery', w!, PEPPER, ITER)).toEqual({ ok: true, rehash: true });
    expect((await verifyPassword('wrong horse battery', w!, PEPPER, ITER)).ok).toBe(false);
    expect((await verifyPassword('correct horse battery', w!, PEPPER + 'x', ITER)).ok).toBe(false);
    // Fails closed without the pepper.
    expect(await verifyPassword('correct horse battery', w!, undefined, ITER)).toEqual({ ok: false, rehash: false });
  });

  it('only wraps unpeppered hashes, and only with a usable pepper', async () => {
    const np = await hashPassword('correct horse battery', undefined, ITER);
    expect(await wrapHash(np, undefined)).toBeNull();
    expect(await wrapHash(np, 'too-short')).toBeNull();
    expect(await wrapHash(await hashPassword('correct horse battery', PEPPER, ITER), PEPPER)).toBeNull();
    expect(await wrapHash((await wrapHash(np, PEPPER))!, PEPPER)).toBeNull();
    expect(await wrapHash('garbage', PEPPER)).toBeNull();
  });
});

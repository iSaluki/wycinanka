/**
 * Password hashing and token helpers, built on WebCrypto only.
 *
 * Hash format: pbkdf2-sha256$<iterations>$<salt b64url>$<hash b64url>
 *
 * The password is first HMAC-ed with a secret pepper held as a Worker secret (never stored in D1),
 * then stretched with PBKDF2-HMAC-SHA256. Workers caps PBKDF2 at 100,000 iterations, below OWASP's
 * 600,000 recommendation; the pepper means a leaked database alone cannot be cracked offline.
 */

const enc = new TextEncoder();
export const MAX_ITERATIONS = 100_000;
export const MIN_ITERATIONS = 10_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(s: string): Uint8Array {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

/** 256-bit random, URL-safe token. */
export const randomToken = () => b64url(randomBytes(32));

export async function sha256(input: string): Promise<string> {
  return b64url(await crypto.subtle.digest('SHA-256', enc.encode(input)));
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function clampIterations(n: number): number {
  if (!Number.isFinite(n)) return MAX_ITERATIONS;
  return Math.min(MAX_ITERATIONS, Math.max(MIN_ITERATIONS, Math.floor(n)));
}

async function pepperKey(pepper: string): Promise<CryptoKey> {
  if (!pepper || pepper.length < 32) throw new Error('PEPPER secret is missing or shorter than 32 characters');
  return crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function derive(password: string, salt: Uint8Array, iterations: number, pepper: string): Promise<Uint8Array> {
  const peppered = await crypto.subtle.sign('HMAC', await pepperKey(pepper), enc.encode(password.normalize('NFKC')));
  const key = await crypto.subtle.importKey('raw', peppered, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, HASH_BYTES * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, pepper: string, iterations: number): Promise<string> {
  const iter = clampIterations(iterations);
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(password, salt, iter, pepper);
  return `pbkdf2-sha256$${iter}$${b64url(salt)}$${b64url(hash)}`;
}

export interface VerifyResult {
  ok: boolean;
  /** True when the stored hash used a different work factor and should be replaced. */
  rehash: boolean;
}

export async function verifyPassword(password: string, stored: string, pepper: string, iterations: number): Promise<VerifyResult> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return { ok: false, rehash: false };
  const iter = Number(parts[1]);
  if (!Number.isInteger(iter) || iter < MIN_ITERATIONS || iter > MAX_ITERATIONS) return { ok: false, rehash: false };
  const salt = fromB64url(parts[2]);
  const expected = fromB64url(parts[3]);
  const actual = await derive(password, salt, iter, pepper);
  const ok = timingSafeEqual(actual, expected);
  return { ok, rehash: ok && iter !== clampIterations(iterations) };
}

/** A well-formed hash of a random password, used to spend equal time on unknown usernames. */
let dummy: Promise<string> | undefined;
export function dummyHash(pepper: string, iterations: number): Promise<string> {
  dummy ??= hashPassword(randomToken(), pepper, iterations);
  return dummy;
}

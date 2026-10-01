/**
 * Password hashing and token helpers, built on WebCrypto only.
 *
 * Hash format: pbkdf2-sha256$<iterations>$<salt b64url>$<hash b64url>        (peppered)
 *              pbkdf2-sha256-np$<iterations>$<salt b64url>$<hash b64url>     (no pepper configured)
 *              pbkdf2-sha256-w$<iterations>$<salt b64url>$<hmac b64url>      (unpeppered hash, wrapped with the pepper)
 *
 * The password is first HMAC-ed with a secret pepper held as a Worker secret (never stored in D1),
 * then stretched with PBKDF2-HMAC-SHA256. Workers caps PBKDF2 at 100,000 iterations, below OWASP's
 * 600,000 recommendation; the pepper means a leaked database alone cannot be cracked offline.
 *
 * The pepper is optional so a fresh deployment works before the secret is set. Hashes made without
 * one are marked and upgraded to peppered hashes at the next sign-in once PEPPER exists. Until then,
 * housekeeping wraps them (HMAC of the stored hash, keyed by the pepper; see wrapHash), which needs no
 * password, so accounts that never sign in again are protected too. A peppered or wrapped hash never
 * verifies without the pepper (fail closed).
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

export function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array<ArrayBuffer> {
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

export const MIN_PEPPER_LENGTH = 32;
const PEPPERED = 'pbkdf2-sha256';
const UNPEPPERED = 'pbkdf2-sha256-np';
const WRAPPED = 'pbkdf2-sha256-w';
const SCHEMES = new Set([PEPPERED, UNPEPPERED, WRAPPED]);

let warned = false;
/** The pepper to use, or null when none is configured. A too-short pepper is ignored rather than trusted. */
export function usablePepper(pepper: string | undefined): string | null {
  if (pepper && pepper.length >= MIN_PEPPER_LENGTH) return pepper;
  if (!warned) {
    warned = true;
    // An error, not a warning, so it stands out in the Worker's logs: without a pepper a leaked database can be
    // attacked offline. Set it with `wrangler secret put PEPPER` (docs/DEVELOPING.md → Add the pepper).
    console.error(
      JSON.stringify({
        event: 'pepper_missing',
        message: `PEPPER secret ${pepper ? `is shorter than ${MIN_PEPPER_LENGTH} characters` : 'is not set'}; password hashes are not peppered.`,
      }),
    );
  }
  return null;
}

async function hmac(pepper: string, data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number, pepper: string | null): Promise<Uint8Array<ArrayBuffer>> {
  const pw = new Uint8Array(enc.encode(password.normalize('NFKC')));
  const material = pepper ? await hmac(pepper, pw) : pw;
  const key = await crypto.subtle.importKey('raw', material, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, HASH_BYTES * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, pepper: string | undefined, iterations: number): Promise<string> {
  const iter = clampIterations(iterations);
  const salt = randomBytes(SALT_BYTES);
  const usable = usablePepper(pepper);
  const hash = await derive(password, salt, iter, usable);
  return `${usable ? PEPPERED : UNPEPPERED}$${iter}$${b64url(salt)}$${b64url(hash)}`;
}

export interface VerifyResult {
  ok: boolean;
  /** True when the stored hash used a different work factor or pepper setting and should be replaced. */
  rehash: boolean;
}

export async function verifyPassword(password: string, stored: string, pepper: string | undefined, iterations: number): Promise<VerifyResult> {
  const parts = stored.split('$');
  if (parts.length !== 4 || !SCHEMES.has(parts[0])) return { ok: false, rehash: false };
  const usable = usablePepper(pepper);
  const scheme = parts[0];
  if (scheme !== UNPEPPERED && !usable) return { ok: false, rehash: false };
  const iter = Number(parts[1]);
  if (!Number.isInteger(iter) || iter < MIN_ITERATIONS || iter > MAX_ITERATIONS) return { ok: false, rehash: false };
  const salt = fromB64url(parts[2]);
  const expected = fromB64url(parts[3]);
  let actual = await derive(password, salt, iter, scheme === PEPPERED ? usable : null);
  if (scheme === WRAPPED) actual = await hmac(usable!, actual);
  const ok = timingSafeEqual(actual, expected);
  // Wrapped hashes always upgrade: a plain peppered hash costs the same to check and is the format new ones use.
  return { ok, rehash: ok && (iter !== clampIterations(iterations) || scheme !== (usable ? PEPPERED : UNPEPPERED)) };
}

/**
 * Protects an unpeppered hash with the pepper without knowing the password: the stored hash is replaced by its HMAC
 * under the pepper. Returns null when there is nothing to do (no usable pepper, or the hash is not unpeppered).
 */
export async function wrapHash(stored: string, pepper: string | undefined): Promise<string | null> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== UNPEPPERED) return null;
  const usable = usablePepper(pepper);
  if (!usable) return null;
  return `${WRAPPED}$${parts[1]}$${parts[2]}$${b64url(await hmac(usable, fromB64url(parts[3])))}`;
}

/** A well-formed hash of a random password, used to spend equal time on unknown usernames. */
let dummy: Promise<string> | undefined;
export function dummyHash(pepper: string | undefined, iterations: number): Promise<string> {
  dummy ??= hashPassword(randomToken(), pepper, iterations);
  return dummy;
}

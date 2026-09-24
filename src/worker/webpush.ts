/**
 * Web Push from a Worker, with WebCrypto only: VAPID (RFC 8292) to identify us to the push service,
 * and aes128gcm message encryption (RFC 8291) so only the learner's browser can read the reminder.
 *
 * No D1 or Workers-only types here, so the encryption can be checked against the reference implementation
 * in plain Node (test/unit/webpush.test.ts). The key pair itself is stored by reminders.ts.
 */
import { b64url, fromB64url, randomBytes } from './crypto';

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface VapidKeys {
  /** Uncompressed P-256 public key, base64url: the browser's applicationServerKey. */
  publicKey: string;
  privateJwk: JsonWebKey;
}

const enc = new TextEncoder();
type Bytes = Uint8Array<ArrayBuffer>;
const utf8 = (s: string): Bytes => new Uint8Array(enc.encode(s));

/**
 * Push services a subscription may point at. The Worker POSTs to the endpoint, so anything else is refused:
 * a learner must not be able to make us send requests to arbitrary hosts.
 */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/];

export function isPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  return url.protocol === 'https:' && !url.port && !url.username && PUSH_HOSTS.some((re) => re.test(url.hostname));
}

export async function generateVapid(): Promise<VapidKeys> {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  const raw = (await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer;
  const privateJwk = (await crypto.subtle.exportKey('jwk', pair.privateKey)) as JsonWebKey;
  return { publicKey: b64url(raw), privateJwk };
}

async function vapidHeader(endpoint: string, keys: VapidKeys, subject: string, now: number): Promise<string> {
  const header = b64url(utf8(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(
    utf8(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject })),
  );
  const key = await crypto.subtle.importKey('jwk', keys.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  // WebCrypto returns the raw r||s signature JWS expects.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, utf8(`${header}.${claims}`));
  return `vapid t=${header}.${claims}.${b64url(sig)}, k=${keys.publicKey}`;
}

const concat = (...parts: Bytes[]): Bytes => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

async function hkdf(salt: Bytes, ikm: Bytes, info: Bytes, bytes: number): Promise<Bytes> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
}

/** Encrypts a payload for one subscription (RFC 8291, single aes128gcm record). */
export async function encryptPayload(payload: Bytes, target: Pick<PushTarget, 'p256dh' | 'auth'>, salt = randomBytes(16)): Promise<Bytes> {
  const uaPublic = fromB64url(target.p256dh);
  const authSecret = fromB64url(target.auth);
  if (uaPublic.length !== 65 || authSecret.length !== 16) throw new Error('Invalid subscription keys');

  const local = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair;
  const asPublic = new Uint8Array((await crypto.subtle.exportKey('raw', local.publicKey)) as ArrayBuffer);
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  // workers-types names the peer key `$public`; the runtime, like the WebCrypto spec, reads `public`.
  const ecdh = { name: 'ECDH', public: uaKey } as unknown as Parameters<SubtleCrypto['deriveBits']>[0];
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits(ecdh, local.privateKey, 256));

  const ikm = await hkdf(authSecret, ecdhSecret, concat(utf8('WebPush: info\0'), uaPublic, asPublic), 32);
  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12);

  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  // 0x02 marks the last (and only) record; no padding.
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, concat(payload, new Uint8Array([2]))));

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

export type SendResult = 'sent' | 'gone' | 'failed';

/** Sends one push message. 'gone' means the subscription has expired and should be deleted. */
export async function sendPush(
  target: PushTarget,
  message: unknown,
  keys: VapidKeys,
  opts: { subject: string; ttl?: number; now?: number; fetcher?: typeof fetch },
): Promise<SendResult> {
  if (!isPushEndpoint(target.endpoint)) return 'gone';
  const body = await encryptPayload(utf8(JSON.stringify(message)), target);
  const res = await (opts.fetcher ?? fetch)(target.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidHeader(target.endpoint, keys, opts.subject, opts.now ?? Date.now()),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(opts.ttl ?? 4 * 3600),
      Urgency: 'normal',
    },
    body,
  });
  await res.body?.cancel();
  if (res.status === 404 || res.status === 410) return 'gone';
  if (!res.ok) {
    console.error(JSON.stringify({ event: 'push_failed', status: res.status, host: new URL(target.endpoint).hostname }));
    return 'failed';
  }
  return 'sent';
}

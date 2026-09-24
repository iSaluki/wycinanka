/// <reference types="node" />
import { createECDH, createPublicKey, randomBytes, verify } from 'node:crypto';
import { describe, expect, it } from 'vitest';
// The reference aes128gcm implementation used by the web-push library.
// @ts-expect-error: http_ece ships without type declarations.
import ece from 'http_ece';
import { b64url, fromB64url } from '../../src/worker/crypto';
import { localTime, reminderDue, reminderMessage } from '../../src/shared/reminders';
import { encryptPayload, isPushEndpoint, sendPush, type VapidKeys } from '../../src/worker/webpush';

/** A browser's side of a push subscription. */
function browserKeys() {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = randomBytes(16);
  return { ecdh, auth, p256dh: b64url(ecdh.getPublicKey()), authB64: b64url(auth) };
}

async function vapid(): Promise<VapidKeys> {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  return {
    publicKey: b64url(await crypto.subtle.exportKey('raw', pair.publicKey)),
    privateJwk: await crypto.subtle.exportKey('jwk', pair.privateKey),
  };
}

describe('web push encryption', () => {
  it('produces aes128gcm that the reference implementation decrypts', async () => {
    const b = browserKeys();
    const body = await encryptPayload(new TextEncoder().encode('{"title":"Czas na polski!"}'), { p256dh: b.p256dh, auth: b.authB64 });
    const plain = ece.decrypt(Buffer.from(body), { version: 'aes128gcm', privateKey: b.ecdh, authSecret: b.auth });
    expect(plain.toString('utf8')).toBe('{"title":"Czas na polski!"}');
  });

  it('sends a signed request the push service can verify', async () => {
    const b = browserKeys();
    const keys = await vapid();
    let seen: Request | undefined;
    const fetcher = (async (url: string, init: RequestInit) => {
      seen = new Request(url, init);
      return new Response(null, { status: 201 });
    }) as unknown as typeof fetch;
    const endpoint = 'https://fcm.googleapis.com/fcm/send/abc123';
    const now = Date.UTC(2026, 8, 24, 17, 0);
    const result = await sendPush({ endpoint, p256dh: b.p256dh, auth: b.authB64 }, { title: 'Hi' }, keys, { subject: 'https://example.test', now, fetcher });
    expect(result).toBe('sent');
    expect(seen!.headers.get('content-encoding')).toBe('aes128gcm');
    expect(Number(seen!.headers.get('ttl'))).toBeGreaterThan(0);

    const auth = seen!.headers.get('authorization')!;
    const [, jwt, k] = auth.match(/^vapid t=([^,]+), k=(.+)$/)!;
    expect(k).toBe(keys.publicKey);
    const [h, c, s] = jwt.split('.');
    const claims = JSON.parse(Buffer.from(fromB64url(c)).toString());
    expect(claims).toMatchObject({ aud: 'https://fcm.googleapis.com', sub: 'https://example.test' });
    expect(claims.exp).toBeGreaterThan(now / 1000);
    expect(claims.exp - now / 1000).toBeLessThanOrEqual(24 * 3600);
    const pub = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: keys.privateJwk.x!, y: keys.privateJwk.y! }, format: 'jwk' });
    const ok = verify('sha256', Buffer.from(`${h}.${c}`), { key: pub, dsaEncoding: 'ieee-p1363' }, Buffer.from(fromB64url(s)));
    expect(ok).toBe(true);

    const plain = ece.decrypt(Buffer.from(await seen!.arrayBuffer()), { version: 'aes128gcm', privateKey: b.ecdh, authSecret: b.auth });
    expect(JSON.parse(plain.toString())).toEqual({ title: 'Hi' });
  });

  it('treats 404 and 410 as an expired subscription', async () => {
    const b = browserKeys();
    const keys = await vapid();
    const fetcher = (async () => new Response(null, { status: 410 })) as unknown as typeof fetch;
    const r = await sendPush({ endpoint: 'https://web.push.apple.com/x', p256dh: b.p256dh, auth: b.authB64 }, {}, keys, { subject: 's', fetcher });
    expect(r).toBe('gone');
  });

  it('only talks to real push services', () => {
    expect(isPushEndpoint('https://fcm.googleapis.com/fcm/send/x')).toBe(true);
    expect(isPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/x')).toBe(true);
    expect(isPushEndpoint('https://web.push.apple.com/abc')).toBe(true);
    expect(isPushEndpoint('https://wns2-by3p.notify.windows.com/w/?token=x')).toBe(true);
    expect(isPushEndpoint('http://fcm.googleapis.com/x')).toBe(false);
    expect(isPushEndpoint('https://fcm.googleapis.com.evil.test/x')).toBe(false);
    expect(isPushEndpoint('https://evilpush.apple.com.test/x')).toBe(false);
    expect(isPushEndpoint('https://169.254.169.254/latest')).toBe(false);
    expect(isPushEndpoint('https://fcm.googleapis.com:8443/x')).toBe(false);
    expect(isPushEndpoint('not a url')).toBe(false);
  });
});

describe('reminder timing', () => {
  const at = Date.UTC(2026, 8, 24, 17, 0); // 18:00 in London (BST), 03:00 next day in Sydney.

  it('works out local day and hour in the learner’s time zone', () => {
    expect(localTime(at, 'Europe/London')).toEqual({ day: '2026-09-24', hour: 18 });
    expect(localTime(at, 'Australia/Sydney')).toEqual({ day: '2026-09-25', hour: 3 });
    expect(localTime(at, 'Not/AZone')).toBeNull();
  });

  it('is due only at the chosen hour, and only when switched on', () => {
    expect(reminderDue({ reminders: true, timeZone: 'Europe/London' }, at)).toBe('2026-09-24');
    expect(reminderDue({ reminders: true, timeZone: 'Europe/London', reminderHour: 9 }, at)).toBeNull();
    expect(reminderDue({ reminders: false, timeZone: 'Europe/London' }, at)).toBeNull();
    expect(reminderDue({ reminders: true, timeZone: 'Australia/Sydney', reminderHour: 3 }, at)).toBe('2026-09-25');
    // An unknown zone falls back to London rather than never reminding.
    expect(reminderDue({ reminders: true, timeZone: 'Not/AZone' }, at)).toBe('2026-09-24');
  });

  it('writes a reminder that fits the learner', () => {
    expect(reminderMessage(5, 12).body).toBe('Keep your 5-day streak going: 12 review cards are waiting.');
    expect(reminderMessage(0, 1)).toMatchObject({ body: '1 review card is waiting. A few minutes is all it takes.', url: '/review' });
    expect(reminderMessage(3, 0).body).toBe('Keep your 3-day streak going with a quick lesson.');
    expect(reminderMessage(0, 0)).toMatchObject({ url: '/' });
  });
});

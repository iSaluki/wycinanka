import { env } from 'cloudflare:workers';
import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { LESSONS, lessonCardIds } from '../../src/content/course';
import { localDay } from '../../src/shared/progress';
import { app, cleanUp } from '../../src/worker/index';
import { migrate } from '../../src/worker/migrate';
import { MIGRATIONS } from '../../src/worker/migrations';
import { sendReminders } from '../../src/worker/reminders';
import { b64url } from '../../src/worker/crypto';
import { cleanTranscript, WHISPER } from '../../src/worker/routes/speech';

const ORIGIN = 'https://wycinanka.test';
const worker = (exports as unknown as { default: Fetcher }).default;

let ipCounter = 0;
/** Each test gets its own client IP so throttling state does not leak between tests. */
function client(ip = `203.0.113.${++ipCounter}`) {
  let cookie = '';
  async function call(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await worker.fetch(`${ORIGIN}${path}`, {
      method,
      headers: {
        origin: ORIGIN,
        'cf-connecting-ip': ip,
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(cookie ? { cookie } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) {
      const [pair] = set.split(';');
      cookie = pair.endsWith('=') ? '' : pair;
    }
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, json, headers: res.headers, setCookie: set };
  }
  return { call, get cookie() { return cookie; }, set cookie(v: string) { cookie = v; } };
}

let userCounter = 0;
const uniqueName = () => `learner_${Date.now().toString(36)}_${++userCounter}`;
const PASSWORD = 'szczebrzeszyn chrząszcz';
const today = localDay(new Date());

async function signedUp() {
  const c = client();
  const username = uniqueName();
  const r = await c.call('POST', '/api/auth/register', { username, password: PASSWORD });
  expect(r.status).toBe(201);
  return { c, username };
}

describe('schema', () => {
  it('shares wrangler\'s migrations table and skips what is already applied', async () => {
    expect(await migrate(env.DB)).toEqual([]);
    const { results } = await env.DB.prepare('SELECT name FROM d1_migrations ORDER BY id').all<{ name: string }>();
    expect(results.map((r) => r.name)).toEqual(MIGRATIONS.map((m) => m.name));
  });

  it('applies pending migrations once, atomically with their bookkeeping row', async () => {
    const name = `9999_test_${Date.now()}.sql`;
    MIGRATIONS.push({ name, sql: '-- test\nCREATE TABLE zz_test (id INTEGER);\nCREATE INDEX zz_test_id ON zz_test(id);\n' });
    try {
      expect(await migrate(env.DB)).toEqual([name]);
      expect(await migrate(env.DB)).toEqual([]);
      expect((await env.DB.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name LIKE 'zz_test%'").first<{ n: number }>())!.n).toBe(2);
    } finally {
      MIGRATIONS.pop();
      await env.DB.batch([env.DB.prepare('DROP TABLE zz_test'), env.DB.prepare('DELETE FROM d1_migrations WHERE name = ?1').bind(name)]);
    }
  });
});

describe('previews (no database binding)', () => {
  const noDb = { ...env, DB: undefined } as unknown as typeof env;
  it('treats everyone as a guest', async () => {
    const r = await app.request('/api/auth/me', {}, noDb);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ user: null });
  });

  it('reports accounts as unavailable instead of crashing', async () => {
    const r = await app.request(
      '/api/auth/login',
      { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost' }, body: '{}' },
      noDb,
    );
    expect(r.status).toBe(503);
    expect(((await r.json()) as { error: string }).error).toMatch(/preview/);
  });
});

describe('housekeeping', () => {
  it('removes expired sessions and stale throttle rows, and keeps live ones', async () => {
    const now = Date.now();
    const { c, username } = await signedUp();
    const user = await env.DB.prepare('SELECT id FROM users WHERE username = ?1').bind(username).first<{ id: string }>();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)').bind('expired-test', user!.id, now - 10, now - 1),
      env.DB.prepare('INSERT INTO auth_throttle (key, count, window_start, locked_until) VALUES (?1, 1, ?2, 0)').bind('stale-test', now - 2 * 86_400_000),
      env.DB.prepare('INSERT INTO auth_throttle (key, count, window_start, locked_until) VALUES (?1, 1, ?2, 0)').bind('fresh-test', now),
    ]);
    await cleanUp(env, now);
    const count = async (sql: string, key: string) => (await env.DB.prepare(sql).bind(key).first<{ n: number }>())!.n;
    expect(await count('SELECT COUNT(*) AS n FROM sessions WHERE id_hash = ?1', 'expired-test')).toBe(0);
    expect(await count('SELECT COUNT(*) AS n FROM auth_throttle WHERE key = ?1', 'stale-test')).toBe(0);
    expect(await count('SELECT COUNT(*) AS n FROM auth_throttle WHERE key = ?1', 'fresh-test')).toBe(1);
    expect((await c.call('GET', '/api/auth/me')).json.user.username).toBe(username);
  });
});

describe('registration and sign-in', () => {
  it('registers, sets a hardened session cookie and reports the user', async () => {
    const c = client();
    const username = uniqueName();
    const r = await c.call('POST', '/api/auth/register', { username, password: PASSWORD });
    expect(r.status).toBe(201);
    expect(r.setCookie).toMatch(/^__Host-session=/);
    expect(r.setCookie).toMatch(/HttpOnly/i);
    expect(r.setCookie).toMatch(/Secure/i);
    expect(r.setCookie).toMatch(/SameSite=Lax/i);
    expect(r.setCookie).toMatch(/Path=\//);
    const me = await c.call('GET', '/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.json.user.username).toBe(username);
  });

  it('stores only a peppered PBKDF2 hash and a hashed session token', async () => {
    const { c, username } = await signedUp();
    const row = await env.DB.prepare('SELECT password_hash FROM users WHERE username = ?1').bind(username).first<{ password_hash: string }>();
    expect(row!.password_hash).toMatch(/^pbkdf2-sha256\$\d+\$[\w-]+\$[\w-]+$/);
    expect(row!.password_hash).not.toContain(PASSWORD);
    const token = decodeURIComponent(c.cookie.split('=')[1]);
    const session = await env.DB.prepare('SELECT COUNT(*) AS n FROM sessions WHERE id_hash = ?1').bind(token).first<{ n: number }>();
    expect(session!.n).toBe(0);
  });

  it('rejects weak passwords and invalid usernames', async () => {
    const c = client();
    expect((await c.call('POST', '/api/auth/register', { username: uniqueName(), password: 'short' })).status).toBe(400);
    expect((await c.call('POST', '/api/auth/register', { username: uniqueName(), password: 'qwertyuiop' })).status).toBe(400);
    expect((await c.call('POST', '/api/auth/register', { username: 'a b', password: PASSWORD })).status).toBe(400);
    expect((await c.call('POST', '/api/auth/register', { username: "x' OR 1=1 --", password: PASSWORD })).status).toBe(400);
  });

  it('rejects unknown fields in request bodies', async () => {
    const c = client();
    const r = await c.call('POST', '/api/auth/register', { username: uniqueName(), password: PASSWORD, admin: true });
    expect(r.status).toBe(400);
  });

  it('refuses a duplicate username regardless of case', async () => {
    const { username } = await signedUp();
    const r = await client().call('POST', '/api/auth/register', { username: username.toUpperCase(), password: PASSWORD });
    expect(r.status).toBe(409);
  });

  it('signs in and out, invalidating the session server-side', async () => {
    const { username } = await signedUp();
    const c = client();
    const r = await c.call('POST', '/api/auth/login', { username, password: PASSWORD });
    expect(r.status).toBe(200);
    expect(r.json.snapshot.user.username).toBe(username);
    const stolen = c.cookie;
    await c.call('POST', '/api/auth/logout', {});
    const replay = client();
    replay.cookie = stolen;
    expect((await replay.call('GET', '/api/auth/me')).json.user).toBeNull();
  });

  it('gives the same error for a wrong password and an unknown user', async () => {
    const { username } = await signedUp();
    const wrong = await client().call('POST', '/api/auth/login', { username, password: 'not the password at all' });
    const unknown = await client().call('POST', '/api/auth/login', { username: uniqueName(), password: PASSWORD });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.json.error).toBe(unknown.json.error);
  });

  it('locks an account after repeated failed sign-ins from one network', async () => {
    const { username } = await signedUp();
    const attacker = client();
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await attacker.call('POST', '/api/auth/login', { username, password: `wrong password ${i}` })).status);
    expect(statuses.slice(0, 7).every((s) => s === 401)).toBe(true);
    expect(statuses[7]).toBe(429);
    // Even the right password is refused from that network while locked…
    expect((await attacker.call('POST', '/api/auth/login', { username, password: PASSWORD })).status).toBe(429);
    // …but the learner, on their own network, can still sign in: nobody can lock someone else out.
    expect((await client().call('POST', '/api/auth/login', { username, password: PASSWORD })).status).toBe(200);
  });

  it('treats a whole IPv6 /64 as one network, so rotating addresses does not dodge the limit', async () => {
    const { username } = await signedUp();
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) {
      const c = client(`2001:db8:${ipCounter % 9999}:1::${(i + 1).toString(16)}`);
      statuses.push((await c.call('POST', '/api/auth/login', { username, password: `wrong password ${i}` })).status);
    }
    expect(statuses[7]).toBe(429);
    ipCounter++;
  });

  it('limits how many usernames one network can check by trying to register', async () => {
    const c = client();
    const { username } = await signedUp();
    const statuses: number[] = [];
    for (let i = 0; i < 30; i++) statuses.push((await c.call('POST', '/api/auth/register', { username, password: PASSWORD })).status);
    expect(statuses.slice(0, 29)).toEqual(Array(29).fill(409));
    expect(statuses[29]).toBe(429);
  });

  it('limits registrations per IP', async () => {
    const c = client();
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      statuses.push((await c.call('POST', '/api/auth/register', { username: uniqueName(), password: PASSWORD })).status);
    }
    expect(statuses.slice(0, 6).every((s) => s === 201)).toBe(true);
    expect(statuses[6]).toBe(429);
  });
});

describe('request hardening', () => {
  it('blocks cross-site state-changing requests', async () => {
    const r = await client().call('POST', '/api/auth/login', { username: 'x', password: 'y' }, { origin: 'https://evil.example' });
    expect(r.status).toBe(403);
  });

  it('blocks requests with no origin information', async () => {
    const res = await worker.fetch(`${ORIGIN}/api/auth/logout`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    expect(res.status).toBe(403);
  });

  it('requires JSON bodies', async () => {
    const res = await worker.fetch(`${ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { origin: ORIGIN, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=a&password=b',
    });
    expect(res.status).toBe(415);
  });

  it('rejects oversized bodies', async () => {
    const r = await client().call('POST', '/api/auth/login', { username: 'a'.repeat(20_000), password: 'x' });
    expect(r.status).toBe(413);
  });

  it('sends security headers and never caches API responses', async () => {
    const r = await client().call('GET', '/api/auth/me');
    expect(r.json).toEqual({ user: null });
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(r.headers.get('x-frame-options')).toBe('DENY');
    expect(r.headers.get('strict-transport-security')).toContain('max-age=');
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const r = await client().call('GET', '/api/nope');
    expect(r.status).toBe(404);
    expect(r.json.error).toBeTruthy();
  });

  it('requires a session for progress endpoints', async () => {
    expect((await client().call('GET', '/api/progress')).status).toBe(401);
  });
});

describe('progress', () => {
  const lesson = LESSONS[5];

  it('records a lesson, adds its cards and awards XP', async () => {
    const { c } = await signedUp();
    const ids = lessonCardIds(lesson);
    const r = await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 9, total: 10, missed: [ids[0]], day: today });
    expect(r.status).toBe(200);
    expect(r.json.score).toBe(90);
    expect(r.json.xp).toBe(19);
    expect(r.json.cards).toHaveLength(ids.length);
    const snap = await c.call('GET', '/api/progress');
    expect(snap.json.lessons[lesson.id]).toMatchObject({ best: 90, completions: 1 });
    expect(snap.json.cards).toHaveLength(ids.length);
    expect(snap.json.activity[0]).toMatchObject({ day: today, xp: 19, lessons: 1 });
  });

  it('rejects unknown lessons, foreign card ids and implausible dates', async () => {
    const { c } = await signedUp();
    expect((await c.call('POST', '/api/progress/lesson', { lessonId: 'u99-l1', correct: 1, total: 1, day: today })).status).toBe(404);
    expect(
      (await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 1, total: 1, missed: ['u18-l1:dwie'], day: today })).status,
    ).toBe(400);
    expect((await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 1, total: 1, day: '2020-01-01' })).status).toBe(400);
    expect((await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 5, total: 1, day: today })).status).toBe(400);
  });

  it('schedules reviews server-side and ignores replays', async () => {
    const { c } = await signedUp();
    const id = lessonCardIds(lesson)[0];
    const at = Date.now();
    const first = await c.call('POST', '/api/progress/reviews', { day: today, reviews: [{ cardId: id, rating: 3, at }] });
    expect(first.status).toBe(200);
    expect(first.json.applied).toBe(1);
    expect(first.json.cards[0].due).toBeGreaterThan(at);
    const replay = await c.call('POST', '/api/progress/reviews', { day: today, reviews: [{ cardId: id, rating: 3, at }] });
    expect(replay.json.applied).toBe(0);
    const bad = await c.call('POST', '/api/progress/reviews', { day: today, reviews: [{ cardId: id, rating: 3, at: at - 30 * 86_400_000 }] });
    expect(bad.status).toBe(400);
    const junk = await c.call('POST', '/api/progress/reviews', { day: today, reviews: [{ cardId: 'u01-l1:nonexistent', rating: 3, at }] });
    expect(junk.status).toBe(400);
    const picture = await c.call('POST', '/api/progress/reviews', { day: today, reviews: [{ cardId: 'pic-apple', rating: 3, at }] });
    expect(picture.status).toBe(200);
    expect(picture.json.cards[0].cardId).toBe('pic-apple');
  });

  it('keeps each learner\'s progress private', async () => {
    const a = await signedUp();
    const b = await signedUp();
    await a.c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 10, total: 10, day: today });
    const snapB = await b.c.call('GET', '/api/progress');
    expect(snapB.json.lessons).toEqual({});
    expect(snapB.json.cards).toEqual([]);
  });

  it('saves settings with strict validation', async () => {
    const { c } = await signedUp();
    expect((await c.call('PUT', '/api/progress/settings', { dailyGoal: 30, theme: 'dark' })).json.settings).toEqual({ dailyGoal: 30, theme: 'dark' });
    expect((await c.call('PUT', '/api/progress/settings', { dailyGoal: 999 })).status).toBe(400);
    expect((await c.call('PUT', '/api/progress/settings', { isAdmin: true })).status).toBe(400);
  });

  it('counts a lesson sent twice with the same key only once', async () => {
    const { c } = await signedUp();
    const body = { lessonId: lesson.id, correct: 10, total: 10, day: today, key: 'retry-key-0001' };
    const first = await c.call('POST', '/api/progress/lesson', body);
    expect(first.json.xp).toBe(20);
    const again = await c.call('POST', '/api/progress/lesson', body);
    expect(again.status).toBe(200);
    expect(again.json).toMatchObject({ duplicate: true, xp: 0 });
    const snap = await c.call('GET', '/api/progress');
    expect(snap.json.lessons[lesson.id].completions).toBe(1);
    expect(snap.json.activity[0].xp).toBe(20);
  });

  it('accepts a lesson finished offline a few days ago, on the day it was done', async () => {
    const { c } = await signedUp();
    const at = Date.now() - 3 * 86_400_000;
    const day = localDay(new Date(at));
    const r = await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 10, total: 10, day, at });
    expect(r.status).toBe(200);
    expect(r.json.day.day).toBe(day);
    const tooOld = Date.now() - 10 * 86_400_000;
    expect((await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 1, total: 1, day: localDay(new Date(tooOld)), at: tooOld })).status).toBe(400);
    // The day has to match when it was done, so a streak can't be back-filled.
    expect((await c.call('POST', '/api/progress/lesson', { lessonId: lesson.id, correct: 1, total: 1, day: today, at })).status).toBe(400);
  });

  it('imports guest progress kept on the device for weeks, but not with made-up days', async () => {
    const { c } = await signedUp();
    const at = Date.now() - 40 * 86_400_000;
    const day = localDay(new Date(at));
    const ok = await c.call('POST', '/api/progress/import', {
      lessons: [{ lessonId: lesson.id, correct: 8, total: 10, missed: [], day, at }],
      reviews: [],
    });
    expect(ok.status).toBe(200);
    expect(ok.json.activity[0].day).toBe(day);
    const other = await signedUp();
    const fake = await other.c.call('POST', '/api/progress/import', {
      lessons: [{ lessonId: lesson.id, correct: 8, total: 10, missed: [], day: today, at }],
      reviews: [],
    });
    expect(fake.status).toBe(400);
  });

  it('imports a guest session once, replaying it server-side', async () => {
    const { c } = await signedUp();
    const now = Date.now();
    const ids = lessonCardIds(lesson);
    const body = {
      lessons: [{ lessonId: lesson.id, correct: 10, total: 10, missed: [], day: today, at: now - 60_000 }],
      reviews: [{ cardId: ids[0], rating: 3, at: now - 1000, day: today }],
      settings: { startUnit: 2 },
    };
    const r = await c.call('POST', '/api/progress/import', body);
    expect(r.status).toBe(200);
    expect(r.json.lessons[lesson.id].best).toBe(100);
    expect(r.json.cards).toHaveLength(ids.length);
    expect(r.json.settings.startUnit).toBe(2);
    const again = await c.call('POST', '/api/progress/import', body);
    expect(again.status).toBe(409);
  });
});

describe('account', () => {
  it('changes the password and signs out other sessions', async () => {
    const { c, username } = await signedUp();
    const other = client();
    await other.call('POST', '/api/auth/login', { username, password: PASSWORD });
    expect((await c.call('POST', '/api/account/password', { currentPassword: 'wrong wrong wrong', newPassword: 'a brand new passphrase' })).status).toBe(403);
    expect((await c.call('POST', '/api/account/password', { currentPassword: PASSWORD, newPassword: 'a brand new passphrase' })).status).toBe(200);
    expect((await c.call('GET', '/api/auth/me')).json.user.username).toBe(username);
    expect((await other.call('GET', '/api/auth/me')).json.user).toBeNull();
    expect((await client().call('POST', '/api/auth/login', { username, password: 'a brand new passphrase' })).status).toBe(200);
  });

  it('exports all personal data without secrets', async () => {
    const { c, username } = await signedUp();
    const r = await c.call('GET', '/api/account/export');
    expect(r.status).toBe(200);
    expect(r.headers.get('content-disposition')).toContain('attachment');
    expect(r.json.user.username).toBe(username);
    expect(JSON.stringify(r.json)).not.toMatch(/pbkdf2|password|id_hash/);
  });

  it('deletes the account and every row belonging to it', async () => {
    const { c, username } = await signedUp();
    await c.call('POST', '/api/progress/lesson', { lessonId: LESSONS[0].id, correct: 5, total: 5, day: today, key: 'delete-me-key' });
    expect((await c.call('POST', '/api/push/subscribe', await subscription())).status).toBe(200);
    const user = await env.DB.prepare('SELECT id FROM users WHERE username = ?1').bind(username).first<{ id: string }>();
    expect((await c.call('DELETE', '/api/account', { password: 'nope nope nope' })).status).toBe(403);
    expect((await c.call('DELETE', '/api/account', { password: PASSWORD })).status).toBe(200);
    for (const table of ['users', 'sessions', 'cards', 'lesson_progress', 'activity', 'push_subscriptions', 'sync_keys']) {
      const col = table === 'users' ? 'id' : 'user_id';
      const n = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${col} = ?1`).bind(user!.id).first<{ n: number }>();
      expect(n!.n, table).toBe(0);
    }
    expect((await c.call('GET', '/api/auth/me')).json.user).toBeNull();
  });
});

let endpointCounter = 0;
/** A browser push subscription, as PushSubscription.toJSON() gives it. */
async function subscription(host = 'https://fcm.googleapis.com') {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair;
  const raw = (await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer;
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return { endpoint: `${host}/fcm/send/device-${Date.now()}-${++endpointCounter}`, keys: { p256dh: b64url(raw), auth: b64url(auth) } };
}

describe('daily reminders', () => {
  it('hands out one stable public key', async () => {
    const { c } = await signedUp();
    const a = await c.call('GET', '/api/push/key');
    expect(a.status).toBe(200);
    expect(a.json.publicKey).toMatch(/^[A-Za-z0-9_-]{87}$/);
    expect((await c.call('GET', '/api/push/key')).json.publicKey).toBe(a.json.publicKey);
    expect((await client().call('GET', '/api/push/key')).status).toBe(401);
  });

  it('subscribes and unsubscribes a device, and refuses endpoints that are not push services', async () => {
    const { c, username } = await signedUp();
    const sub = await subscription();
    expect((await c.call('POST', '/api/push/subscribe', sub)).status).toBe(200);
    expect((await c.call('POST', '/api/push/subscribe', sub)).status).toBe(200);
    const count = async () =>
      (await env.DB.prepare('SELECT COUNT(*) AS n FROM push_subscriptions s JOIN users u ON u.id = s.user_id WHERE u.username = ?1').bind(username).first<{ n: number }>())!.n;
    expect(await count()).toBe(1);
    expect((await c.call('POST', '/api/push/subscribe', await subscription('https://attacker.example'))).status).toBe(400);
    expect((await c.call('POST', '/api/push/subscribe', { ...sub, keys: { p256dh: 'x', auth: 'y' } })).status).toBe(400);
    // Someone else can't remove it.
    const other = await signedUp();
    await other.c.call('POST', '/api/push/unsubscribe', { endpoint: sub.endpoint });
    expect(await count()).toBe(1);
    expect((await c.call('POST', '/api/push/unsubscribe', { endpoint: sub.endpoint })).status).toBe(200);
    expect(await count()).toBe(0);
  });

  it('accepts reminder settings and rejects nonsense', async () => {
    const { c } = await signedUp();
    const ok = await c.call('PUT', '/api/progress/settings', { reminders: true, reminderHour: 8, timeZone: 'Europe/Warsaw' });
    expect(ok.json.settings).toMatchObject({ reminders: true, reminderHour: 8, timeZone: 'Europe/Warsaw' });
    expect((await c.call('PUT', '/api/progress/settings', { reminderHour: 24 })).status).toBe(400);
    expect((await c.call('PUT', '/api/progress/settings', { timeZone: "'; DROP TABLE users" })).status).toBe(400);
  });

  it('reminds at the chosen hour, once a day, and not after practice', async () => {
    const now = Date.UTC(2031, 0, 15, 19, 0);
    const day = '2031-01-15';
    const lazy = await signedUp();
    const keen = await signedUp();
    const later = await signedUp();
    const expired = await signedUp();
    for (const [u, hour] of [[lazy, 19], [keen, 19], [later, 7], [expired, 19]] as const) {
      await u.c.call('PUT', '/api/progress/settings', { reminders: true, reminderHour: hour, timeZone: 'UTC' });
    }
    const subs = new Map<string, string>();
    for (const u of [lazy, keen, later, expired]) {
      const sub = await subscription();
      subs.set(u.username, sub.endpoint);
      await u.c.call('POST', '/api/push/subscribe', sub);
    }
    const keenId = (await env.DB.prepare('SELECT id FROM users WHERE username = ?1').bind(keen.username).first<{ id: string }>())!.id;
    await env.DB.prepare('INSERT INTO activity (user_id, day, xp) VALUES (?1, ?2, 12)').bind(keenId, day).run();

    const sent: string[] = [];
    const fetcher = (async (url: string) => {
      sent.push(url);
      return new Response(null, { status: url === subs.get(expired.username) ? 410 : 201 });
    }) as unknown as typeof fetch;

    const first = await sendReminders(env, now, fetcher);
    expect(sent).toContain(subs.get(lazy.username));
    expect(sent).not.toContain(subs.get(keen.username));
    expect(sent).not.toContain(subs.get(later.username));
    expect(first.practised).toBeGreaterThanOrEqual(1);
    expect(first.gone).toBeGreaterThanOrEqual(1);
    const gone = await env.DB.prepare('SELECT COUNT(*) AS n FROM push_subscriptions WHERE endpoint = ?1').bind(subs.get(expired.username)).first<{ n: number }>();
    expect(gone!.n).toBe(0);

    sent.length = 0;
    await sendReminders(env, now + 30 * 60_000, fetcher);
    expect(sent).not.toContain(subs.get(lazy.username));
  });

  it("can't take over another learner's device without its keys", async () => {
    const a = await signedUp();
    const b = await signedUp();
    const sub = await subscription();
    expect((await a.c.call('POST', '/api/push/subscribe', sub)).status).toBe(200);
    const other = await subscription();
    expect((await b.c.call('POST', '/api/push/subscribe', { endpoint: sub.endpoint, keys: other.keys })).status).toBe(409);
    // The same browser (same keys) moves to whoever signs in on it.
    expect((await b.c.call('POST', '/api/push/subscribe', sub)).status).toBe(200);
  });

  it('sends a test reminder only to the learner\'s own subscribed device', async () => {
    const { c } = await signedUp();
    expect((await c.call('POST', '/api/push/test', { endpoint: 'https://fcm.googleapis.com/fcm/send/nobody' })).status).toBe(404);
  });
});

describe('speech transcription', () => {
  /** A tiny WAV: a RIFF header and a little silence. */
  const wav = btoa('RIFF' + '\0'.repeat(40) + 'WAVEfmt ' + '\0'.repeat(200));
  const ctx = { waitUntil: () => undefined, passThroughOnException: () => undefined, props: {} } as unknown as ExecutionContext;
  const calls: Array<{ model: string; input: Record<string, unknown> }> = [];
  const withAi = (run: (input: Record<string, unknown>) => unknown) =>
    ({
      ...env,
      AI: {
        run: async (model: string, input: Record<string, unknown>) => {
          calls.push({ model, input });
          return run(input);
        },
      },
    }) as unknown as typeof env;
  let ip = 0;
  const post = (body: unknown, e: typeof env, headers: Record<string, string> = {}) =>
    app.request(
      '/api/speech/transcribe',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'http://localhost', 'cf-connecting-ip': `198.51.100.${++ip}`, ...headers },
        body: JSON.stringify(body),
      },
      e,
      ctx,
    );

  it('transcribes a recording as Polish with Whisper, for guests too, and stores nothing', async () => {
    calls.length = 0;
    const r = await post({ audio: wav }, withAi(() => ({ text: ' Dzień dobry. ' })));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ text: 'Dzień dobry.' });
    expect(calls).toHaveLength(1);
    expect(calls[0].model).toBe(WHISPER);
    expect(calls[0].input).toMatchObject({ audio: wav, language: 'pl' });
  });

  it('accepts only a WAV recording, and nothing else in the body', async () => {
    const e = withAi(() => ({ text: 'x' }));
    expect((await post({ audio: btoa('not a wav file at all') }, e)).status).toBe(400);
    expect((await post({ audio: wav, extra: 1 }, e)).status).toBe(400);
    expect((await post({}, e)).status).toBe(400);
  });

  it('allows a recording of about ten seconds, and no more', async () => {
    const e = withAi(() => ({ text: 'x' }));
    const tenSeconds = btoa('RIFF' + '\0'.repeat(16_000 * 2 * 10));
    expect((await post({ audio: tenSeconds }, e)).status).toBe(200);
    const tooLong = btoa('RIFF' + '\0'.repeat(16_000 * 2 * 12));
    expect([400, 413]).toContain((await post({ audio: tooLong }, e)).status);
  });

  it('stops before the daily allowance runs out, and keeps part of it for learners with an account', async () => {
    const e = { ...withAi(() => ({ text: 'tak' })), SPEECH_DAILY_LIMIT: '4' } as unknown as typeof env;
    await env.DB.prepare("DELETE FROM auth_throttle WHERE key LIKE 'speech:%day'").run();
    // Guests may use half: two.
    expect((await post({ audio: wav }, e)).status).toBe(200);
    expect((await post({ audio: wav }, e)).status).toBe(200);
    expect((await post({ audio: wav }, e)).status).toBe(503);
    // A signed-in learner still gets the rest.
    const { c } = await signedUp();
    const cookie = c.cookie;
    expect((await post({ audio: wav }, e, { cookie })).status).toBe(200);
    expect((await post({ audio: wav }, e, { cookie })).status).toBe(200);
    expect((await post({ audio: wav }, e, { cookie })).status).toBe(503);
    await env.DB.prepare("DELETE FROM auth_throttle WHERE key LIKE 'speech:%day'").run();
  });

  it('says so when recognition is unavailable, so the app can fall back', async () => {
    expect((await post({ audio: wav }, { ...env, AI: undefined } as unknown as typeof env)).status).toBe(503);
    const r = await post({ audio: wav }, withAi(() => { throw new Error('daily allowance used up'); }));
    expect(r.status).toBe(503);
  });

  it('is throttled per IP', async () => {
    const e = withAi(() => ({ text: 'tak' }));
    const headers = { 'cf-connecting-ip': '198.51.100.250' };
    let last = 0;
    for (let i = 0; i < 181; i++) last = (await post({ audio: wav }, e, headers)).status;
    expect(last).toBe(429);
  });

  it('drops the subtitle credits Whisper imagines in silence', () => {
    expect(cleanTranscript('Napisy stworzone przez społeczność Amara.org')).toBe('');
    expect(cleanTranscript('Dziękuję za obejrzenie!')).toBe('');
    expect(cleanTranscript('Dziękuję.')).toBe('Dziękuję.');
  });
});

describe('static app', () => {
  it('serves the single-page app for non-API paths', async () => {
    const res = await worker.fetch(`${ORIGIN}/learn`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<!doctype html>');
  });
});

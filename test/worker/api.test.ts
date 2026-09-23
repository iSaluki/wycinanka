import { env } from 'cloudflare:workers';
import { exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { LESSONS, lessonCardIds } from '../../src/content/course';
import { localDay } from '../../src/shared/progress';
import { migrate } from '../../src/worker/migrate';
import { MIGRATIONS } from '../../src/worker/migrations';

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

  it('locks an account after repeated failed sign-ins', async () => {
    const { username } = await signedUp();
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await client().call('POST', '/api/auth/login', { username, password: `wrong password ${i}` })).status);
    expect(statuses.slice(0, 7).every((s) => s === 401)).toBe(true);
    expect(statuses[7]).toBe(429);
    // Even the right password is refused while locked.
    expect((await client().call('POST', '/api/auth/login', { username, password: PASSWORD })).status).toBe(429);
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
    await c.call('POST', '/api/progress/lesson', { lessonId: LESSONS[0].id, correct: 5, total: 5, day: today });
    const user = await env.DB.prepare('SELECT id FROM users WHERE username = ?1').bind(username).first<{ id: string }>();
    expect((await c.call('DELETE', '/api/account', { password: 'nope nope nope' })).status).toBe(403);
    expect((await c.call('DELETE', '/api/account', { password: PASSWORD })).status).toBe(200);
    for (const table of ['users', 'sessions', 'cards', 'lesson_progress', 'activity']) {
      const col = table === 'users' ? 'id' : 'user_id';
      const n = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${col} = ?1`).bind(user!.id).first<{ n: number }>();
      expect(n!.n, table).toBe(0);
    }
    expect((await c.call('GET', '/api/auth/me')).json.user).toBeNull();
  });
});

describe('static app', () => {
  it('serves the single-page app for non-API paths', async () => {
    const res = await worker.fetch(`${ORIGIN}/learn`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<!doctype html>');
  });
});

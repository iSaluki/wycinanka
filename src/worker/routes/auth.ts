import { Hono } from 'hono';
import { credentialsSchema } from '../../shared/schemas';
import { passwordProblem, PASSWORD_MESSAGES } from '../../shared/password';
import { dummyHash, hashPassword, verifyPassword } from '../crypto';
import { iterations, type AppEnv } from '../env';
import { clientIp, HttpError, readJson } from '../http';
import { clearSessionCookie, createSession, currentUser, revokeSession } from '../session';
import { clear, hit, lockedFor, POLICIES, retryMinutes } from '../throttle';
import { snapshot } from '../store';

export const auth = new Hono<AppEnv>();

const tooMany = (ms: number) =>
  new HttpError(429, `Too many attempts. Try again in ${retryMinutes(ms)} minute${retryMinutes(ms) === 1 ? '' : 's'}.`);

auth.post('/register', async (c) => {
  const db = c.env.DB;
  const now = Date.now();
  const ipKey = `register:ip:${clientIp(c)}`;
  const locked = await lockedFor(db, ipKey, now);
  if (locked) throw tooMany(locked);

  const { username, password } = await readJson(c, credentialsSchema);
  const problem = passwordProblem(password, username);
  if (problem) throw new HttpError(400, PASSWORD_MESSAGES[problem], { field: 'password' });

  const exists = await db.prepare('SELECT 1 FROM users WHERE username = ?1').bind(username).first();
  if (exists) throw new HttpError(409, 'That username is taken. Try another.', { field: 'username' });

  await hit(db, ipKey, POLICIES.registerIp, now);
  const id = crypto.randomUUID();
  const hash = await hashPassword(password, c.env.PEPPER, iterations(c.env));
  try {
    await db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?1, ?2, ?3, ?4)').bind(id, username, hash, now).run();
  } catch {
    // Unique constraint race: someone registered the same name in between.
    throw new HttpError(409, 'That username is taken. Try another.', { field: 'username' });
  }
  console.log(JSON.stringify({ event: 'register', user: id }));
  await createSession(c, id);
  return c.json({ user: { username, createdAt: now } }, 201);
});

auth.post('/login', async (c) => {
  const db = c.env.DB;
  const now = Date.now();
  const { username, password } = await readJson(c, credentialsSchema);
  const ipKey = `login:ip:${clientIp(c)}`;
  const userKey = `login:user:${username.toLowerCase()}`;

  const locked = Math.max(await lockedFor(db, ipKey, now), await lockedFor(db, userKey, now));
  if (locked) throw tooMany(locked);
  await hit(db, ipKey, POLICIES.loginIp, now);

  const row = await db
    .prepare('SELECT id, username, password_hash, created_at, settings FROM users WHERE username = ?1')
    .bind(username)
    .first<{ id: string; username: string; password_hash: string; created_at: number; settings: string }>();

  const iter = iterations(c.env);
  // Spend the same effort whether or not the user exists, so timing does not reveal usernames.
  const stored = row?.password_hash ?? (await dummyHash(c.env.PEPPER, iter));
  const result = await verifyPassword(password, stored, c.env.PEPPER, iter);

  if (!row || !result.ok) {
    const lock = await hit(db, userKey, POLICIES.loginUser, now);
    console.log(JSON.stringify({ event: 'login_failed', locked: lock > 0 }));
    if (lock) throw tooMany(lock);
    throw new HttpError(401, 'Username or password is incorrect.');
  }

  await clear(db, userKey);
  if (result.rehash) {
    const fresh = await hashPassword(password, c.env.PEPPER, iter);
    await db.prepare('UPDATE users SET password_hash = ?1 WHERE id = ?2').bind(fresh, row.id).run();
  }
  await createSession(c, row.id);
  const snap = await snapshot(db, { id: row.id, username: row.username, createdAt: row.created_at, settings: row.settings });
  return c.json({ user: snap.user, snapshot: snap });
});

auth.post('/logout', async (c) => {
  const user = await currentUser(c);
  if (user) await revokeSession(c, user.sessionHash);
  clearSessionCookie(c);
  return c.json({ ok: true });
});

auth.get('/me', async (c) => {
  const user = await currentUser(c);
  if (!user) {
    clearSessionCookie(c);
    throw new HttpError(401, 'Not signed in.');
  }
  return c.json({ user: { username: user.username, createdAt: user.createdAt } });
});

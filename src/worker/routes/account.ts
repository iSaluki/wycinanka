import { Hono } from 'hono';
import { changePasswordSchema, deleteAccountSchema } from '../../shared/schemas';
import { passwordProblem, PASSWORD_MESSAGES } from '../../shared/password';
import { hashPassword, verifyPassword } from '../crypto';
import { iterations, type AppEnv, type SessionUser } from '../env';
import { HttpError, readJson } from '../http';
import { clearSessionCookie, createSession, requireUser, revokeAllSessions } from '../session';
import { snapshot } from '../store';
import { clear, hit, lockedFor, POLICIES, retryMinutes } from '../throttle';
import type { Context } from 'hono';

export const account = new Hono<AppEnv>();
account.use('*', requireUser);

/** Re-check the password for sensitive actions, with its own lockout. */
async function confirmPassword(c: Context<AppEnv>, user: SessionUser, password: string) {
  const now = Date.now();
  const key = `sensitive:user:${user.id}`;
  const locked = await lockedFor(c.env.DB, key, now);
  if (locked) throw new HttpError(429, `Too many attempts. Try again in ${retryMinutes(locked)} minutes.`);
  const { ok } = await verifyPassword(password, user.passwordHash, c.env.PEPPER, iterations(c.env));
  if (!ok) {
    await hit(c.env.DB, key, POLICIES.sensitiveUser, now);
    throw new HttpError(403, 'Your current password is incorrect.', { field: 'password' });
  }
  await clear(c.env.DB, key);
}

account.post('/password', async (c) => {
  const user = c.get('user');
  const { currentPassword, newPassword } = await readJson(c, changePasswordSchema);
  await confirmPassword(c, user, currentPassword);
  const problem = passwordProblem(newPassword, user.username);
  if (problem) throw new HttpError(400, PASSWORD_MESSAGES[problem], { field: 'newPassword' });
  const hash = await hashPassword(newPassword, c.env.PEPPER, iterations(c.env));
  await c.env.DB.prepare('UPDATE users SET password_hash = ?1 WHERE id = ?2').bind(hash, user.id).run();
  // Sign out everywhere else: a password change is often a response to a compromise.
  await revokeAllSessions(c, user.id);
  await createSession(c, user.id);
  console.log(JSON.stringify({ event: 'password_changed', user: user.id }));
  return c.json({ ok: true });
});

account.get('/export', async (c) => {
  const user = c.get('user');
  const snap = await snapshot(c.env.DB, user);
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), ...snap }, null, 2);
  return c.body(body, 200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': 'attachment; filename="wycinanka-data.json"',
  });
});

account.delete('/', async (c) => {
  const user = c.get('user');
  const { password } = await readJson(c, deleteAccountSchema);
  await confirmPassword(c, user, password);
  const db = c.env.DB;
  await db.batch([
    db.prepare('DELETE FROM cards WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM lesson_progress WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM activity WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
    db.prepare('DELETE FROM auth_throttle WHERE key = ?1').bind(`sensitive:user:${user.id}`),
    db.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);
  clearSessionCookie(c);
  console.log(JSON.stringify({ event: 'account_deleted', user: user.id }));
  return c.json({ ok: true });
});

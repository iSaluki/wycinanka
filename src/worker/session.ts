import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { randomToken, sha256 } from './crypto';
import type { AppEnv, SessionUser } from './env';
import { HttpError } from './http';

export const COOKIE = '__Host-session';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;
const MAX_SESSIONS_PER_USER = 10;

export async function createSession(c: Context<AppEnv>, userId: string): Promise<void> {
  const token = randomToken();
  const now = Date.now();
  const idHash = await sha256(token);
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)').bind(
      idHash,
      userId,
      now,
      now + SESSION_TTL_MS,
    ),
    // Drop expired sessions and keep only the most recent few per user.
    c.env.DB.prepare(
      `DELETE FROM sessions WHERE user_id = ?1 AND (expires_at <= ?2 OR id_hash NOT IN
         (SELECT id_hash FROM sessions WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?3))`,
    ).bind(userId, now, MAX_SESSIONS_PER_USER),
  ]);
  setCookie(c, COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearSessionCookie(c: Context<AppEnv>): void {
  deleteCookie(c, COOKIE, { path: '/', secure: true });
}

export async function currentUser(c: Context<AppEnv>): Promise<SessionUser | null> {
  const token = getCookie(c, COOKIE);
  if (!token || token.length > 100) return null;
  const idHash = await sha256(token);
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.username, u.created_at, u.settings, u.password_hash
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id_hash = ?1 AND s.expires_at > ?2`,
  )
    .bind(idHash, Date.now())
    .first<{ id: string; username: string; created_at: number; settings: string; password_hash: string }>();
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
    settings: row.settings,
    passwordHash: row.password_hash,
    sessionHash: idHash,
  };
}

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await currentUser(c);
  if (!user) {
    clearSessionCookie(c);
    throw new HttpError(401, 'Sign in to save your progress.');
  }
  c.set('user', user);
  return next();
};

export async function revokeSession(c: Context<AppEnv>, idHash: string): Promise<void> {
  await c.env.DB.prepare('DELETE FROM sessions WHERE id_hash = ?1').bind(idHash).run();
}

export async function revokeAllSessions(c: Context<AppEnv>, userId: string): Promise<void> {
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(userId).run();
}

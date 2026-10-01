import { usablePepper, wrapHash } from './crypto';
import type { Env } from './env';

/** Removes expired sessions and stale throttle counters. Housekeeping only: expiry is also checked on every read. */
export async function cleanUp(env: Env, now = Date.now()): Promise<void> {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now),
    env.DB.prepare('DELETE FROM auth_throttle WHERE locked_until <= ?1 AND window_start <= ?2').bind(now, now - 86_400_000),
    // Results can only be re-sent for a week (see routes/progress.ts), so older keys are never needed.
    env.DB.prepare('DELETE FROM sync_keys WHERE created_at <= ?1').bind(now - 30 * 86_400_000),
  ]);
  await wrapUnpeppered(env);
}

const UNPEPPERED_PREFIX = 'pbkdf2-sha256-np$';

/**
 * Once PEPPER is set, wraps every hash made without it (crypto.ts → wrapHash), so a leaked database can't be attacked
 * offline even for accounts that never sign in again. Each row is only updated if its hash is unchanged, so a sign-in
 * that re-hashes at the same moment wins. Returns how many were wrapped.
 */
export async function wrapUnpeppered(env: Env, limit = 200): Promise<number> {
  if (!usablePepper(env.PEPPER)) return 0;
  const { results } = await env.DB.prepare('SELECT id, password_hash FROM users WHERE substr(password_hash, 1, ?1) = ?2 LIMIT ?3')
    .bind(UNPEPPERED_PREFIX.length, UNPEPPERED_PREFIX, limit)
    .all<{ id: string; password_hash: string }>();
  const updates: D1PreparedStatement[] = [];
  for (const row of results) {
    const wrapped = await wrapHash(row.password_hash, env.PEPPER);
    if (wrapped) updates.push(env.DB.prepare('UPDATE users SET password_hash = ?1 WHERE id = ?2 AND password_hash = ?3').bind(wrapped, row.id, row.password_hash));
  }
  if (!updates.length) return 0;
  await env.DB.batch(updates);
  console.log(JSON.stringify({ event: 'hashes_wrapped', count: updates.length }));
  return updates.length;
}

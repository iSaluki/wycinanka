import type { Env } from './env';

/** Removes expired sessions and stale throttle counters. Housekeeping only: expiry is also checked on every read. */
export async function cleanUp(env: Env, now = Date.now()): Promise<void> {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now),
    env.DB.prepare('DELETE FROM auth_throttle WHERE locked_until <= ?1 AND window_start <= ?2').bind(now, now - 86_400_000),
    // Results can only be re-sent for a week (see routes/progress.ts), so older keys are never needed.
    env.DB.prepare('DELETE FROM sync_keys WHERE created_at <= ?1').bind(now - 30 * 86_400_000),
  ]);
}

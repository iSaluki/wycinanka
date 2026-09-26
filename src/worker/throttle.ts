/**
 * Fixed-window attempt counters in D1, with a lockout once the limit is reached.
 * Used for login, registration and password-confirmed actions.
 */

export interface Policy {
  limit: number;
  windowMs: number;
  lockMs: number;
}

export const POLICIES = {
  loginIp: { limit: 30, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  /** Wrong passwords for one account from one network. Locks only that network out, so nobody else can lock you out. */
  loginUser: { limit: 8, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  /**
   * Wrong passwords for one account from anywhere: a slow, distributed guessing attack. High enough that locking
   * someone out this way takes hundreds of attempts from dozens of networks.
   */
  loginUserAll: { limit: 200, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  registerIp: { limit: 6, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  /** Sign-up attempts, taken or not: enough to try a few names, not to list who has an account. */
  registerCheck: { limit: 30, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  sensitiveUser: { limit: 6, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  pushTest: { limit: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  /** Spoken answers sent for transcription: about one every 20 seconds for an hour is plenty for practice. */
  speechIp: { limit: 180, windowMs: 60 * 60_000, lockMs: 30 * 60_000 },
  /** The same, per signed-in learner, so learners sharing a network (a school, a family) don't share one limit. */
  speechUser: { limit: 180, windowMs: 60 * 60_000, lockMs: 30 * 60_000 },
  /** Problem reports from browsers: a broken device sends a handful, not a flood. */
  reportIp: { limit: 30, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
} satisfies Record<string, Policy>;

/** Milliseconds until the key unlocks, or 0 if it is not locked. */
export async function lockedFor(db: D1Database, key: string, now: number): Promise<number> {
  const row = await db.prepare('SELECT locked_until FROM auth_throttle WHERE key = ?1').bind(key).first<{ locked_until: number }>();
  return row && row.locked_until > now ? row.locked_until - now : 0;
}

/** Record one attempt. Returns how long the key is now locked for (0 if still under the limit). */
export async function hit(db: D1Database, key: string, p: Policy, now: number): Promise<number> {
  const row = await db
    .prepare(
      `INSERT INTO auth_throttle (key, count, window_start, locked_until) VALUES (?1, 1, ?2, CASE WHEN 1 >= ?4 THEN ?2 + ?5 ELSE 0 END)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ?2 - window_start > ?3 THEN 1 ELSE count + 1 END,
         locked_until = CASE WHEN (CASE WHEN ?2 - window_start > ?3 THEN 1 ELSE count + 1 END) >= ?4 THEN ?2 + ?5 ELSE locked_until END,
         window_start = CASE WHEN ?2 - window_start > ?3 THEN ?2 ELSE window_start END
       RETURNING locked_until`,
    )
    .bind(key, now, p.windowMs, p.limit, p.lockMs)
    .first<{ locked_until: number }>();
  return row && row.locked_until > now ? row.locked_until - now : 0;
}

export async function clear(db: D1Database, key: string): Promise<void> {
  await db.prepare('DELETE FROM auth_throttle WHERE key = ?1').bind(key).run();
}

export const retryMinutes = (ms: number) => Math.max(1, Math.ceil(ms / 60_000));

export interface Env {
  /** Absent in Worker Previews, which do not inherit production bindings (see wrangler.jsonc `previews`). */
  DB: D1Database;
  ASSETS: Fetcher;
  /** Workers AI, for transcribing spoken answers. Absent in Worker Previews. */
  AI?: Ai;
  /** Worker secret used to pepper password hashes. At least 32 characters. Optional: see crypto.ts. */
  PEPPER?: string;
  PBKDF2_ITERATIONS?: string;
  /** Contact URL or mailto: sent to push services with every reminder (VAPID "sub"). */
  PUSH_CONTACT?: string;
}

export interface SessionUser {
  id: string;
  username: string;
  createdAt: number;
  settings: string;
  passwordHash: string;
  sessionHash: string;
}

export type AppEnv = { Bindings: Env; Variables: { user: SessionUser } };

export const iterations = (env: Env) => Number(env.PBKDF2_ITERATIONS ?? 100_000);

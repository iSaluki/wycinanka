export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Worker secret used to pepper password hashes. At least 32 characters. Optional: see crypto.ts. */
  PEPPER?: string;
  PBKDF2_ITERATIONS?: string;
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

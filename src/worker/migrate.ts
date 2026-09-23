/**
 * Applies pending D1 migrations from inside the Worker, so a deploy straight from the dashboard
 * (which never runs `wrangler d1 migrations apply`) still gets a working database.
 *
 * It shares Wrangler's `d1_migrations` table, so the CLI and the Worker agree on what has been applied.
 * Each migration runs in one batch (a transaction) together with its bookkeeping row.
 */
import type { Env } from './env';
import { MIGRATIONS, statements } from './migrations';

const TABLE = `CREATE TABLE IF NOT EXISTS d1_migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

async function applied(db: D1Database): Promise<Set<string>> {
  await db.prepare(TABLE).run();
  const { results } = await db.prepare('SELECT name FROM d1_migrations').all<{ name: string }>();
  return new Set(results.map((r) => r.name));
}

export async function migrate(db: D1Database): Promise<string[]> {
  const done = await applied(db);
  const ran: string[] = [];
  for (const m of MIGRATIONS) {
    if (done.has(m.name)) continue;
    try {
      await db.batch([...statements(m.sql).map((s) => db.prepare(s)), db.prepare('INSERT INTO d1_migrations (name) VALUES (?1)').bind(m.name)]);
      ran.push(m.name);
      console.log(JSON.stringify({ event: 'migration_applied', name: m.name }));
    } catch (err) {
      // Another isolate may have applied it at the same moment; that is fine. Anything else is not.
      if (!(await applied(db)).has(m.name)) throw err;
    }
  }
  return ran;
}

let ready: Promise<unknown> | undefined;
/** Runs the migrations once per isolate. A failure is retried on the next request. */
export function ensureSchema(env: Env): Promise<unknown> {
  ready ??= migrate(env.DB).catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}

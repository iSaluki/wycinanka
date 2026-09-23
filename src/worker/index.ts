import { Hono } from 'hono';
import type { AppEnv, Env } from './env';
import { apiHeaders, bodyLimit, HttpError, sameOriginOnly } from './http';
import { ensureSchema } from './migrate';
import { account } from './routes/account';
import { auth } from './routes/auth';
import { progress } from './routes/progress';

const IMPORT_PATH = '/api/progress/import';

export const app = new Hono<AppEnv>();

app.use('/api/*', apiHeaders);
app.use('/api/*', async (c, next) => {
  await ensureSchema(c.env);
  maybeCleanUp(c.env, c.executionCtx);
  await next();
});
app.use('/api/*', sameOriginOnly);
app.use('/api/*', async (c, next) => (c.req.path === IMPORT_PATH ? next() : bodyLimit(16 * 1024)(c, next)));

app.route('/api/auth', auth);
app.route('/api/account', account);
app.route('/api/progress', progress);

app.all('/api/*', () => {
  throw new HttpError(404, 'Not found.');
});

// Anything that is not an API route is the single-page app.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message, ...err.extra }, err.status);
  console.error(JSON.stringify({ event: 'error', path: c.req.path, message: err instanceof Error ? err.message : String(err) }));
  return c.json({ error: 'Something went wrong on our side. Try again in a moment.' }, 500);
});

/** Removes expired sessions and stale throttle counters. Housekeeping only: expiry is also checked on every read. */
export async function cleanUp(env: Env, now = Date.now()): Promise<void> {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now),
    env.DB.prepare('DELETE FROM auth_throttle WHERE locked_until <= ?1 AND window_start <= ?2').bind(now, now - 86_400_000),
  ]);
}

// The free plan allows only five Cron Triggers per account, so clean-up piggybacks on API traffic instead:
// at most once an hour per isolate, after the response has been sent.
const CLEAN_UP_EVERY = 3_600_000;
let lastCleanUp = 0;
function maybeCleanUp(env: Env, ctx: { waitUntil(promise: Promise<unknown>): void }): void {
  const now = Date.now();
  if (now - lastCleanUp < CLEAN_UP_EVERY) return;
  lastCleanUp = now;
  ctx.waitUntil(cleanUp(env, now).catch((err) => console.error(JSON.stringify({ event: 'cleanup_failed', message: String(err) }))));
}

export default {
  fetch: app.fetch,
  /** Also runs the clean-up if a Cron Trigger is added (for example on a paid plan). */
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    await ensureSchema(env);
    await cleanUp(env);
  },
} satisfies ExportedHandler<Env>;

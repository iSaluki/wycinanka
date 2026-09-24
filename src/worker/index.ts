import { Hono } from 'hono';
import type { AppEnv, Env } from './env';
import { apiHeaders, bodyLimit, HttpError, sameOriginOnly } from './http';
import { ensureSchema } from './migrate';
import { account } from './routes/account';
import { auth } from './routes/auth';
import { progress } from './routes/progress';
import { push } from './routes/push';
import { speech, SPEECH_BODY_LIMIT, TRANSCRIBE_PATH } from './routes/speech';
import { sendReminders } from './reminders';

const IMPORT_PATH = '/api/progress/import';

export const app = new Hono<AppEnv>();

app.use('/api/*', apiHeaders);
// Worker Previews start without production bindings, so a Preview has no database: it runs in guest mode.
app.use('/api/*', async (c, next) => {
  if (c.env.DB) return next();
  if (c.req.method === 'GET' && c.req.path === '/api/auth/me') return c.json({ user: null });
  throw new HttpError(503, "Accounts aren't available in this preview. You can still learn as a guest.");
});
app.use('/api/*', async (c, next) => {
  await ensureSchema(c.env);
  maybeCleanUp(c.env, c.executionCtx);
  await next();
});
app.use('/api/*', sameOriginOnly);
app.use('/api/*', async (c, next) => {
  if (c.req.path === IMPORT_PATH) return next();
  return bodyLimit(c.req.path === TRANSCRIBE_PATH ? SPEECH_BODY_LIMIT : 16 * 1024)(c, next);
});

app.route('/api/auth', auth);
app.route('/api/account', account);
app.route('/api/progress', progress);
app.route('/api/push', push);
app.route('/api/speech', speech);

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
    // Results can only be re-sent for a week (see routes/progress.ts), so older keys are never needed.
    env.DB.prepare('DELETE FROM sync_keys WHERE created_at <= ?1').bind(now - 30 * 86_400_000),
  ]);
}

// Clean-up also piggybacks on API traffic (at most once an hour per isolate, after the response has been
// sent), so it keeps happening even if the hourly Cron Trigger is removed.
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
  /** Hourly Cron Trigger (wrangler.jsonc): daily practice reminders, then housekeeping. */
  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    if (!env.DB) return;
    await ensureSchema(env);
    await sendReminders(env, event.scheduledTime);
    await cleanUp(env);
  },
} satisfies ExportedHandler<Env>;

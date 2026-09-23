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

export default {
  fetch: app.fetch,
  /** Daily clean-up of expired sessions and stale throttle counters (Cron Trigger). */
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    await ensureSchema(env);
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?1').bind(now),
      env.DB.prepare('DELETE FROM auth_throttle WHERE locked_until <= ?1 AND window_start <= ?2').bind(now, now - 86_400_000),
    ]);
  },
} satisfies ExportedHandler<Env>;

import { Hono } from 'hono';
import { clientReportSchema } from '../../shared/schemas';
import type { AppEnv } from '../env';
import { clientIp, HttpError, readJson } from '../http';
import { hit, lockedFor, POLICIES } from '../throttle';

/**
 * Problems reported by learners' browsers, written to the Worker's logs as `client_problem` events so they can
 * be searched in Workers Observability (the dashboard's Logs tab for this Worker). Nothing is stored in the
 * database apart from the per-network throttle. The user agent and country come from the request itself.
 */
export const report = new Hono<AppEnv>();

report.post('/', async (c) => {
  const now = Date.now();
  const key = `report:ip:${clientIp(c)}`;
  if (await lockedFor(c.env.DB, key, now)) throw new HttpError(429, 'Too many reports.');
  const body = await readJson(c, clientReportSchema);
  await hit(c.env.DB, key, POLICIES.reportIp, now);
  const cf = (c.req.raw as { cf?: { country?: string } }).cf;
  console.error(
    JSON.stringify({
      event: 'client_problem',
      ...body,
      userAgent: (c.req.header('user-agent') ?? '').slice(0, 300),
      country: cf?.country,
    }),
  );
  return c.json({ ok: true });
});

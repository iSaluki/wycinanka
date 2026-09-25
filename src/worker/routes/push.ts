import { Hono } from 'hono';
import { pushEndpointSchema, pushSubscriptionSchema } from '../../shared/schemas';
import type { AppEnv } from '../env';
import { HttpError, readJson } from '../http';
import { pushSubject, vapidKeys } from '../reminders';
import { requireUser } from '../session';
import { hit, lockedFor, POLICIES, retryMinutes } from '../throttle';
import { isPushEndpoint, sendPush } from '../webpush';

/** Devices a learner can get reminders on. The oldest subscription is dropped beyond this. */
const MAX_DEVICES = 5;

export const push = new Hono<AppEnv>();
push.use('*', requireUser);

/** The public key browsers need to subscribe (applicationServerKey). */
push.get('/key', async (c) => c.json({ publicKey: (await vapidKeys(c.env.DB)).publicKey }));

push.post('/subscribe', async (c) => {
  const user = c.get('user');
  const { endpoint, keys } = await readJson(c, pushSubscriptionSchema);
  if (!isPushEndpoint(endpoint)) throw new HttpError(400, "This browser's notification service isn't supported.");
  const db = c.env.DB;
  // A browser's subscription moves to whoever signs in on it (same endpoint, same keys). Knowing someone
  // else's endpoint isn't enough to take their reminders over.
  const current = await db
    .prepare('SELECT user_id, p256dh, auth FROM push_subscriptions WHERE endpoint = ?1')
    .bind(endpoint)
    .first<{ user_id: string; p256dh: string; auth: string }>();
  if (current && current.user_id !== user.id && (current.p256dh !== keys.p256dh || current.auth !== keys.auth)) {
    throw new HttpError(409, 'This device is already set up for reminders. Switch reminders off and on again.');
  }
  await db.batch([
    db
      .prepare(
        `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth, created_at) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT (endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
           created_at = excluded.created_at`,
      )
      .bind(endpoint, user.id, keys.p256dh, keys.auth, Date.now()),
    db
      .prepare(
        `DELETE FROM push_subscriptions WHERE user_id = ?1 AND endpoint NOT IN
           (SELECT endpoint FROM push_subscriptions WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2)`,
      )
      .bind(user.id, MAX_DEVICES),
  ]);
  return c.json({ ok: true });
});

push.post('/unsubscribe', async (c) => {
  const { endpoint } = await readJson(c, pushEndpointSchema);
  await c.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?1 AND user_id = ?2').bind(endpoint, c.get('user').id).run();
  return c.json({ ok: true });
});

/** Sends a sample reminder to this device now, so learners can check notifications work. */
push.post('/test', async (c) => {
  const user = c.get('user');
  const { endpoint } = await readJson(c, pushEndpointSchema);
  const now = Date.now();
  const key = `push-test:user:${user.id}`;
  const locked = await lockedFor(c.env.DB, key, now);
  if (locked) throw new HttpError(429, `That's enough test reminders for now. Try again in ${retryMinutes(locked)} minutes.`);
  await hit(c.env.DB, key, POLICIES.pushTest, now);
  const target = await c.env.DB.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE endpoint = ?1 AND user_id = ?2')
    .bind(endpoint, user.id)
    .first<{ endpoint: string; p256dh: string; auth: string }>();
  if (!target) throw new HttpError(404, 'Reminders are not switched on for this device.');
  const result = await sendPush(
    target,
    { title: 'Czas na polski!', body: "This is how your daily reminder will look. Do zobaczenia jutro — see you tomorrow!", url: '/' },
    await vapidKeys(c.env.DB),
    { subject: pushSubject(c.env), now, ttl: 600 },
  );
  if (result === 'gone') {
    await c.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?1').bind(endpoint).run();
    throw new HttpError(409, 'This device is no longer subscribed. Switch reminders off and on again.');
  }
  if (result === 'failed') throw new HttpError(503, "The notification service didn't accept the reminder. Try again later.");
  return c.json({ ok: true });
});

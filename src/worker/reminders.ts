/**
 * Daily practice reminders. An hourly Cron Trigger calls sendReminders(): every learner who has turned
 * reminders on, whose chosen hour it now is in their own time zone, and who hasn't practised yet today,
 * gets one push notification on each device they subscribed from. last_sent_day stops repeats.
 */
import { addDays, streak } from '../shared/progress';
import { reminderDue, reminderMessage } from '../shared/reminders';
import type { Env } from './env';
import { parseSettings } from './store';
import { generateVapid, sendPush, type PushTarget, type SendResult, type VapidKeys } from './webpush';

/**
 * Free-plan Workers may make 50 subrequests per invocation, and push requests count towards it; this cap
 * leaves room for the D1 queries. Learners beyond it miss that day's reminder, so a deployment with more
 * than 40 learners reminded in the same hour needs the paid plan (and a higher cap).
 */
const MAX_PUSHES_PER_RUN = 40;

const VAPID_ROW = 'vapid';

let cached: VapidKeys | undefined;

/**
 * The VAPID key pair that signs our push messages. Generated on first use and kept in D1 (app_keys), so
 * reminders work on a fresh deployment without any secrets to set. Replacing it would silently break every
 * existing subscription, so it is created once and never rotated. Safe when two isolates race: the first insert wins.
 */
export async function vapidKeys(db: D1Database): Promise<VapidKeys> {
  if (cached) return cached;
  const read = () => db.prepare('SELECT value FROM app_keys WHERE name = ?1').bind(VAPID_ROW).first<{ value: string }>();
  let row = await read();
  if (!row) {
    const fresh = await generateVapid();
    await db.prepare('INSERT OR IGNORE INTO app_keys (name, value) VALUES (?1, ?2)').bind(VAPID_ROW, JSON.stringify(fresh)).run();
    row = await read();
  }
  cached = JSON.parse(row!.value) as VapidKeys;
  return cached;
}

export const pushSubject = (env: Env) => env.PUSH_CONTACT ?? 'https://polish.saluki.cloud';

interface Row extends PushTarget {
  last_sent_day: string | null;
  user_id: string;
  settings: string;
}

export async function sendReminders(
  env: Env,
  now = Date.now(),
  fetcher?: typeof fetch,
): Promise<Record<SendResult | 'practised', number>> {
  const db = env.DB;
  const tally = { sent: 0, gone: 0, failed: 0, practised: 0 };
  const { results } = await db
    .prepare(
      `SELECT s.endpoint, s.p256dh, s.auth, s.last_sent_day, u.id AS user_id, u.settings
         FROM push_subscriptions s JOIN users u ON u.id = s.user_id`,
    )
    .all<Row>();

  const due: Array<{ row: Row; day: string }> = [];
  for (const row of results) {
    const day = reminderDue(parseSettings(row.settings), now);
    if (day && row.last_sent_day !== day) due.push({ row, day });
  }
  if (!due.length) return tally;

  // One query each for everyone's recent activity and review backlog.
  const userIds = JSON.stringify([...new Set(due.map((d) => d.row.user_id))]);
  const since = addDays(due.reduce((min, d) => (d.day < min ? d.day : min), due[0].day), -400);
  const [activity, backlog] = await db.batch([
    db
      .prepare('SELECT user_id, day FROM activity WHERE user_id IN (SELECT value FROM json_each(?1)) AND day >= ?2 AND xp > 0')
      .bind(userIds, since),
    db
      .prepare('SELECT user_id, COUNT(*) AS n FROM cards WHERE user_id IN (SELECT value FROM json_each(?1)) AND due <= ?2 GROUP BY user_id')
      .bind(userIds, now),
  ]);
  const days = new Map<string, Set<string>>();
  for (const r of activity.results as Array<{ user_id: string; day: string }>) {
    if (!days.has(r.user_id)) days.set(r.user_id, new Set());
    days.get(r.user_id)!.add(r.day);
  }
  const dueCards = new Map((backlog.results as Array<{ user_id: string; n: number }>).map((r) => [r.user_id, r.n]));

  const toSend = due.filter(({ row, day }) => {
    const practised = days.get(row.user_id)?.has(day);
    if (practised) tally.practised++;
    return !practised;
  });
  if (!toSend.length) return tally;

  const keys = await vapidKeys(db);
  const subject = pushSubject(env);
  const outcomes = await Promise.all(
    toSend.slice(0, MAX_PUSHES_PER_RUN).map(async ({ row, day }) => {
      const message = reminderMessage(streak(days.get(row.user_id) ?? [], day), dueCards.get(row.user_id) ?? 0);
      let result: SendResult;
      try {
        result = await sendPush(row, message, keys, { subject, now, fetcher });
      } catch (err) {
        console.error(JSON.stringify({ event: 'push_error', message: String(err) }));
        result = 'failed';
      }
      tally[result]++;
      return { endpoint: row.endpoint, day, result };
    }),
  );

  const stmts = outcomes.map((o) =>
    o.result === 'gone'
      ? db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?1').bind(o.endpoint)
      : db
          .prepare('UPDATE push_subscriptions SET last_sent_day = ?1, last_sent_at = ?2, last_result = ?3 WHERE endpoint = ?4')
          .bind(o.day, now, o.result, o.endpoint),
  );
  if (stmts.length) await db.batch(stmts);
  console.log(JSON.stringify({ event: 'reminders', ...tally }));
  return tally;
}

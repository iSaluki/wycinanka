import { DurableObject } from 'cloudflare:workers';
import type { Env } from './env';
import { ensureSchema } from './migrate';
import { sendReminders } from './reminders';
import { cleanUp } from './housekeeping';

/**
 * The hourly clock for daily reminders, without a Cron Trigger (the account's are all in use). One Durable
 * Object keeps an alarm set for just after the start of every hour; each alarm sends the reminders that are
 * due, tidies up, and sets the next one. The first API request an isolate handles (and every new reminder
 * subscription) makes sure the alarm is set, so the clock starts itself after a deploy.
 */
export class ReminderClock extends DurableObject<Env> {
  /** Sets the alarm if none is waiting. Cheap to call often. */
  async start(): Promise<void> {
    if ((await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(nextTick(Date.now()));
  }

  async alarm(): Promise<void> {
    // The next tick is set first, so a failure below can never stop the clock.
    await this.ctx.storage.setAlarm(nextTick(Date.now()));
    if (!this.env.DB) return;
    await ensureSchema(this.env);
    await sendReminders(this.env, Date.now());
    await cleanUp(this.env);
  }
}

/** One minute past the next hour: every time zone's hours start on the hour or the half hour. */
export function nextTick(now: number): number {
  const HOUR = 3_600_000;
  return Math.floor(now / HOUR) * HOUR + HOUR + 60_000;
}

let started = false;

/** Makes sure the reminder clock is running. Once per isolate is enough; failures are retried on the next isolate. */
export function startClock(env: Env, ctx: { waitUntil(p: Promise<unknown>): void }, force = false): void {
  if ((started && !force) || !env.REMINDER_CLOCK) return;
  started = true;
  const stub = env.REMINDER_CLOCK.get(env.REMINDER_CLOCK.idFromName('reminders'));
  ctx.waitUntil(
    stub.start().catch((err: unknown) => {
      started = false;
      console.error(JSON.stringify({ event: 'clock_start_failed', message: String(err) }));
    }),
  );
}

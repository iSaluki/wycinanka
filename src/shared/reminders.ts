import type { Settings } from './schemas';

/** Daily practice reminders: when they are due and what they say. Shared by the settings screen and the Worker. */
export const DEFAULT_REMINDER_HOUR = 18;
export const DEFAULT_TIME_ZONE = 'Europe/London';

/** The calendar day and hour (0–23) at `now` in a time zone, or null if the zone is unknown. */
export function localTime(now: number, timeZone: string): { day: string; hour: number } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(now));
    const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
    return { day: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) % 24 };
  } catch {
    return null;
  }
}

export function isValidTimeZone(tz: string): boolean {
  return localTime(0, tz) !== null;
}

/**
 * Hours after the chosen one that a reminder may still go out. The hourly clock can run late or skip a beat,
 * and a reminder an hour late is better than none; last_sent_day keeps it to one a day.
 */
export const REMINDER_GRACE_HOURS = 1;

/** When a learner with these settings should be reminded at `now`: their local day, or null if not now. */
export function reminderDue(settings: Settings, now: number): string | null {
  if (!settings.reminders) return null;
  const t = localTime(now, settings.timeZone ?? DEFAULT_TIME_ZONE) ?? localTime(now, DEFAULT_TIME_ZONE)!;
  const late = t.hour - (settings.reminderHour ?? DEFAULT_REMINDER_HOUR);
  return late >= 0 && late <= REMINDER_GRACE_HOURS ? t.day : null;
}

export function reminderMessage(streakDays: number, due: number): { title: string; body: string; url: string } {
  const cards = `${due} review card${due === 1 ? '' : 's'}`;
  let body: string;
  if (streakDays > 0 && due > 0) body = `Keep your ${streakDays}-day streak going: ${cards} ${due === 1 ? 'is' : 'are'} waiting.`;
  else if (streakDays > 0) body = `Keep your ${streakDays}-day streak going with a quick lesson.`;
  else if (due > 0) body = `${cards} ${due === 1 ? 'is' : 'are'} waiting. A few minutes is all it takes.`;
  else body = 'A few minutes of Polish today keeps it fresh.';
  return { title: 'Czas na polski!', body, url: due > 0 ? '/review' : '/' };
}

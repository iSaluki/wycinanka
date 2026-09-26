import { useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { isStandalone } from './pwa';
import { getState, updateSettings } from './store';

/**
 * Daily practice reminders in the browser: asks for notification permission, subscribes this device
 * with the service worker's PushManager and registers the subscription with the Worker, which sends
 * the reminders (src/worker/reminders.ts).
 */

export type ReminderSupport =
  /** Push works here. */
  | 'ok'
  /** iPhone or iPad in Safari: web push only works once the app is on the home screen. */
  | 'install-first'
  /** The learner has blocked notifications for this site. */
  | 'blocked'
  | 'unsupported';

const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function reminderSupport(): ReminderSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const hasPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (!hasPush) return isIos() && !isStandalone() ? 'install-first' : 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  return 'ok';
}

export const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

async function registration(): Promise<ServiceWorkerRegistration> {
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
  ]);
  if (!reg) throw new Error("Reminders need the app's background service, which hasn't started. Reload the page and try again.");
  return reg;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (reminderSupport() !== 'ok') return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

function toBytes(b64url: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const bin = atob(b64url.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
}

async function register(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  await api('POST', '/push/subscribe', { endpoint: json.endpoint, keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth } });
}

async function subscribe(): Promise<PushSubscription> {
  const reg = await registration();
  const { publicKey } = await api<{ publicKey: string }>('GET', '/push/key');
  const key = toBytes(publicKey);
  const existing = await reg.pushManager.getSubscription();
  // A subscription made with a different server key can't receive our messages: replace it.
  if (existing) {
    const current = existing.options.applicationServerKey;
    const same = current && new Uint8Array(current).every((b, i) => b === key[i]) && current.byteLength === key.length;
    if (same) return existing;
    await existing.unsubscribe();
  }
  try {
    const sub = await Promise.race([
      reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 20_000)),
    ]);
    if (!sub) throw new Error("This browser's notification service didn't answer. Check your connection and try again.");
    return sub;
  } catch (e) {
    // Browsers report failures here in their own words ("Registration failed - permission denied"), including
    // in private windows, where Chrome has no push at all.
    if (e instanceof DOMException) {
      throw new Error("This browser couldn't set up notifications. Private or incognito windows can't get reminders; try a normal window.");
    }
    throw e;
  }
}

/** Asks for permission, subscribes this device and switches reminders on for the account. */
export async function enableReminders(hour: number): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in your browser settings, then try again.'
        : 'Reminders need permission to show notifications.',
    );
  }
  const sub = await subscribe();
  await register(sub);
  await updateSettings({ reminders: true, reminderHour: hour, timeZone: timeZone() });
}

/** Switches reminders off for the account and unsubscribes this device. */
export async function disableReminders(): Promise<void> {
  await updateSettings({ reminders: false });
  await forgetThisDevice();
}

/** Stops reminders reaching this device (used on sign-out, so a shared device stops getting them). */
export async function forgetThisDevice(): Promise<void> {
  try {
    const sub = await currentSubscription();
    if (!sub) return;
    await api('POST', '/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined);
    await sub.unsubscribe();
  } catch {
    // Nothing to undo if push isn't available.
  }
}

export async function sendTestReminder(): Promise<void> {
  const sub = await currentSubscription();
  if (!sub) throw new Error('Reminders are not switched on for this device.');
  await api('POST', '/push/test', { endpoint: sub.endpoint });
}

/**
 * On start-up for a signed-in learner with reminders on: re-register this device's subscription
 * (browsers occasionally rotate them) and keep the time zone current after travel.
 */
export async function refreshReminders(): Promise<void> {
  const { user, settings } = getState();
  if (!user || !settings.reminders || reminderSupport() !== 'ok' || Notification.permission !== 'granted') return;
  try {
    const sub = await currentSubscription();
    if (sub) await register(sub);
    if (settings.timeZone !== timeZone()) await updateSettings({ timeZone: timeZone() });
  } catch (e) {
    if (!(e instanceof ApiError)) console.warn('Could not refresh reminders', e);
  }
}

/** Whether this device currently receives reminders. */
export function useDeviceSubscribed(): [boolean | null, () => void] {
  const [on, setOn] = useState<boolean | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    currentSubscription()
      .then((s) => live && setOn(!!s))
      .catch(() => live && setOn(false));
    return () => {
      live = false;
    };
  }, [tick]);
  return [on, () => setTick((t) => t + 1)];
}

export interface ReminderStatus {
  subscribed: boolean;
  lastSentAt?: number | null;
  lastResult?: string | null;
}

/** When this device was last sent a daily reminder, as the Worker recorded it. Null if it can't be checked. */
export function useReminderStatus(active: boolean): ReminderStatus | null {
  const [status, setStatus] = useState<ReminderStatus | null>(null);
  useEffect(() => {
    if (!active) return setStatus(null);
    let live = true;
    currentSubscription()
      .then((sub) => (sub ? api<ReminderStatus>('POST', '/push/status', { endpoint: sub.endpoint }) : null))
      .then((s) => live && setStatus(s))
      .catch(() => live && setStatus(null));
    return () => {
      live = false;
    };
  }, [active]);
  return status;
}

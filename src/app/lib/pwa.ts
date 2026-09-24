import { useSyncExternalStore } from 'react';

/**
 * Installing Wycinanka as an app (PWA). Chromium browsers fire `beforeinstallprompt`, which we hold on to
 * so the learner can install from our own button. iOS Safari has no such event, but can still add the app
 * to the home screen from the Share menu, so there we explain how.
 */

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode = 'prompt' | 'ios' | null;

const DISMISS_KEY = 'wycinanka:install-dismissed';
/** After "Not now", ask again a fortnight later. */
const SNOOZE_MS = 14 * 86_400_000;

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

function isMobile(): boolean {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || iPadOS;
}

/** Safari on iPhone and iPad, where "Add to Home Screen" lives in the Share menu. */
function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
}

function snoozed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
}

function mode(): InstallMode {
  if (installed || isStandalone() || !isMobile() || snoozed()) return null;
  if (deferred) return 'prompt';
  if (isIosSafari()) return 'ios';
  return null;
}

let current: InstallMode = null;
function refresh() {
  const next = mode();
  if (next !== current) {
    current = next;
    emit();
  }
}

export function useInstallMode(): InstallMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

/** Shows the browser's own install dialog. */
export async function install(): Promise<void> {
  const e = deferred;
  if (!e) return;
  deferred = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  if (outcome === 'dismissed') dismissInstall();
  refresh();
}

export function dismissInstall(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Private mode: it just asks again next visit.
  }
  refresh();
}

/** Registers the service worker and starts listening for install events. Call once at start-up. */
export function initPwa(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    refresh();
  });
  refresh();
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('Service worker not registered', err));
    });
  }
}

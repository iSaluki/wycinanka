import { useSyncExternalStore } from 'react';

/**
 * Culture breaks read or skipped, remembered on this device so each one comes up once. Losing this only
 * means a break is offered again, so it lives in local storage rather than in synced progress.
 */
const KEY = 'wycinanka:culture-seen';
const listeners = new Set<() => void>();

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

let seen = read();

export function markCultureSeen(id: string) {
  if (seen.has(id)) return;
  seen = new Set([...seen, id]);
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    /* storage unavailable: the break may be offered again, which is harmless */
  }
  listeners.forEach((l) => l());
}

export function useCultureSeen(): ReadonlySet<string> {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => seen,
    () => seen,
  );
}

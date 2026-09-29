import { useSyncExternalStore } from 'react';

/**
 * Texts read through, remembered on this device. A reading text isn't a review card — it is input, not something
 * to be recalled on a schedule — so what is kept is only whether it has been read, and losing it costs nothing
 * more than a tick.
 */
const KEY = 'wycinanka:reading-done';
const listeners = new Set<() => void>();

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

let done = read();

export function markRead(id: string) {
  if (done.has(id)) return;
  done = new Set([...done, id]);
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    // Storage unavailable: the text simply shows as unread next time.
  }
  listeners.forEach((l) => l());
}

export function useReadingDone(): ReadonlySet<string> {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => done,
    () => done,
  );
}

import type { Rating } from '../../shared/fsrs';
import type { Exercise, ExtraTag } from './exercises';

/**
 * A lesson left part-way, kept on this device so it can be picked up again: the exact questions it was built
 * with (they are shuffled, so they can't simply be made again), where the learner was, and what they had
 * answered. One saved lesson per lesson id, for a few days.
 */

export interface SavedEntry {
  ex: Exercise;
  retry: boolean;
  key: number;
}

export interface SavedSession {
  queue: SavedEntry[];
  pos: number;
  correct: number;
  total: number;
  missed: string[];
  ratings: Array<[string, { rating: Rating; at: number }]>;
  attempts: Array<{ cardId: string; pass: boolean; tag?: ExtraTag; helped?: boolean }>;
  spoken: { tried: number; said: number };
}

interface Stored extends SavedSession {
  /** Who it belongs to: a guest, or a signed-in learner's name. Someone else on the device never gets it. */
  owner: string;
  savedAt: number;
}

const PREFIX = 'wycinanka:resume:';
/** Older than this, a half-done lesson is better started again. */
const KEEP_MS = 7 * 86_400_000;

const keyFor = (lessonId: string) => PREFIX + lessonId;

export function saveSession(lessonId: string, owner: string, s: SavedSession): void {
  try {
    localStorage.setItem(keyFor(lessonId), JSON.stringify({ ...s, owner, savedAt: Date.now() } satisfies Stored));
  } catch {
    // Storage full or unavailable: the lesson just starts again next time.
  }
}

export function loadSession(lessonId: string, owner: string, now = Date.now()): SavedSession | null {
  try {
    const raw = localStorage.getItem(keyFor(lessonId));
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (s.owner !== owner || now - s.savedAt > KEEP_MS || !Array.isArray(s.queue) || !(s.pos > 0) || s.pos >= s.queue.length) {
      clearSession(lessonId);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearSession(lessonId: string): void {
  try {
    localStorage.removeItem(keyFor(lessonId));
  } catch {
    // Nothing to clear.
  }
}

/**
 * Review answers already sent when the learner left (warm-up and revision questions are real reviews): keep
 * them as attempts, but drop their ratings so finishing the lesson later doesn't send them twice.
 */
export function markSent(lessonId: string, cardIds: string[]): void {
  try {
    const raw = localStorage.getItem(keyFor(lessonId));
    if (!raw) return;
    const s = JSON.parse(raw) as Stored;
    const sent = new Set(cardIds);
    s.ratings = s.ratings.filter(([id]) => !sent.has(id));
    localStorage.setItem(keyFor(lessonId), JSON.stringify(s));
  } catch {
    // Worst case, a review is counted twice.
  }
}

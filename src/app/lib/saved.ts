import type { DayRecord, LessonRecord, ProgressState } from '../../shared/engine';
import { fromRow, toRow } from '../../shared/engine';
import type { CardRow, ImportInput, LessonResult, ReviewInput, Settings } from '../../shared/schemas';

/**
 * Progress kept on this device: a guest's whole progress (so a refresh or a closed tab loses nothing), and a
 * signed-in learner's results that couldn't be sent yet (the outbox). Storage can be missing or full in private
 * windows, so every read and write is allowed to fail: the app then behaves as it did before, in memory only.
 */

const GUEST_KEY = 'wycinanka:guest';
const OUTBOX_KEY = 'wycinanka:outbox';

export interface SavedGuest {
  settings: Settings;
  guestLog: ImportInput;
  lessons: Array<[string, LessonRecord]>;
  cards: CardRow[];
  activity: Array<[string, DayRecord]>;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full or unavailable: progress stays in memory for this visit.
  }
}

export function saveGuest(settings: Settings, guestLog: ImportInput, p: ProgressState) {
  const saved: SavedGuest = {
    settings,
    guestLog,
    lessons: [...p.lessons],
    cards: [...p.cards].map(([id, c]) => toRow(id, c)),
    activity: [...p.activity],
  };
  write(GUEST_KEY, saved);
}

export function loadGuest(): { settings: Settings; guestLog: ImportInput; progress: ProgressState } | null {
  const g = read<SavedGuest>(GUEST_KEY);
  if (!g || !Array.isArray(g.cards) || !g.guestLog) return null;
  return {
    settings: g.settings ?? {},
    guestLog: { lessons: g.guestLog.lessons ?? [], reviews: g.guestLog.reviews ?? [] },
    progress: {
      lessons: new Map(g.lessons ?? []),
      cards: new Map(g.cards.map((r) => [r.cardId, fromRow(r)])),
      activity: new Map(g.activity ?? []),
    },
  };
}

export const clearGuest = () => write(GUEST_KEY, null);

/** A result waiting to be sent: a finished lesson or a batch of reviews. */
export type PendingOp =
  | { kind: 'lesson'; body: LessonResult & { at: number; key: string } }
  | { kind: 'reviews'; body: { day: string; reviews: ReviewInput[] } };

interface Outbox {
  username: string;
  ops: PendingOp[];
}

/** Results waiting for this learner. Another learner's outbox on a shared device is never sent as theirs. */
export function loadOutbox(username: string): PendingOp[] {
  const o = read<Outbox>(OUTBOX_KEY);
  return o && o.username.toLowerCase() === username.toLowerCase() && Array.isArray(o.ops) ? o.ops : [];
}

export function saveOutbox(username: string, ops: PendingOp[]) {
  write(OUTBOX_KEY, ops.length ? { username, ops } : null);
}

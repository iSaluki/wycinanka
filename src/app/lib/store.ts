import { useSyncExternalStore } from 'react';
import {
  applyLesson,
  applyReviews,
  emptyState,
  emptyTouched,
  fromRow,
  type DayRecord,
  type ProgressState,
} from '../../shared/engine';
import type { Card } from '../../shared/fsrs';
import { localDay } from '../../shared/progress';
import type { CardRow, ImportInput, LessonResult, ReviewInput, Settings, Snapshot } from '../../shared/schemas';
import { api, ApiError } from './api';
import { clearGuest, loadGuest, loadOutbox, saveGuest, saveOutbox, type PendingOp } from './saved';
import { setSoundEffects } from './sfx';
import { setPreferDeviceVoice, setSpeechRate } from './speech';

/**
 * App state. Signed-in learners: the server is authoritative and every change is sent to the API,
 * with the local copy updated immediately; anything that can't be sent waits in an outbox on the device
 * and goes when the connection is back. Guests: progress is kept on this device (saved.ts).
 */

export interface User {
  username: string;
  createdAt: number;
}

export interface AppState {
  status: 'loading' | 'ready';
  user: User | null;
  settings: Settings;
  progress: ProgressState;
  /** Guest events, replayed on the server if the guest creates an account. */
  guestLog: ImportInput;
  /** Last sync problem, shown as a banner. */
  syncError: string | null;
  /** Bumps on every change so hooks re-render. */
  version: number;
}

export const DEFAULT_SETTINGS: Required<Pick<Settings, 'dailyGoal' | 'speechRate' | 'theme' | 'reduceMotion'>> = {
  dailyGoal: 20,
  speechRate: 0.9,
  theme: 'system',
  reduceMotion: false,
};

let state: AppState = {
  status: 'loading',
  user: null,
  settings: {},
  progress: emptyState(),
  guestLog: { lessons: [], reviews: [] },
  syncError: null,
  version: 0,
};

const listeners = new Set<() => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch, version: state.version + 1 };
  applySettingsToDocument(state.settings);
  if (state.status === 'ready' && !state.user && ('progress' in patch || 'settings' in patch || 'guestLog' in patch)) {
    saveGuest(state.settings, state.guestLog, state.progress);
  }
  listeners.forEach((l) => l());
}

export function useApp<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
  );
}

export const getState = () => state;

/** The --paper colour of each theme (styles.css). */
const THEME_COLOR = { light: '#ffffff', dark: '#141210' } as const;

function applySettingsToDocument(s: Settings) {
  const root = document.documentElement;
  const theme = s.theme ?? 'system';
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  // Browser chrome follows a theme chosen in settings, not only the device's scheme.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const scheme = m.media.includes('dark') ? 'dark' : 'light';
    m.content = THEME_COLOR[theme === 'system' ? scheme : theme];
  });
  if (s.reduceMotion) root.setAttribute('data-motion', 'reduce');
  else root.removeAttribute('data-motion');
  setSpeechRate(s.speechRate ?? DEFAULT_SETTINGS.speechRate);
  setPreferDeviceVoice(!!s.deviceVoice);
  setSoundEffects(s.sounds !== false);
}

function fromSnapshot(snap: Snapshot): ProgressState {
  const p = emptyState();
  for (const [id, l] of Object.entries(snap.lessons)) p.lessons.set(id, l);
  for (const c of snap.cards) p.cards.set(c.cardId, fromRow(c));
  for (const a of snap.activity) p.activity.set(a.day, { xp: a.xp, lessons: a.lessons, reviews: a.reviews });
  return p;
}

function loadSnapshot(snap: Snapshot) {
  set({
    status: 'ready',
    user: snap.user,
    settings: snap.settings,
    progress: fromSnapshot(snap),
    guestLog: { lessons: [], reviews: [] },
    syncError: null,
  });
}

/** Clone the maps so React sees a new object after a mutation. */
const cloneProgress = (p: ProgressState): ProgressState => ({
  lessons: new Map(p.lessons),
  cards: new Map(p.cards),
  activity: new Map(p.activity),
});

function mergeRows(p: ProgressState, rows: CardRow[], day?: ({ day: string } & DayRecord) | null) {
  for (const r of rows) p.cards.set(r.cardId, fromRow(r));
  if (day) p.activity.set(day.day, { xp: day.xp, lessons: day.lessons, reviews: day.reviews });
}

/** A guest's progress from earlier visits on this device, or a fresh start. */
function guestState(): Partial<AppState> {
  const g = loadGuest();
  return g ? { settings: g.settings, guestLog: g.guestLog, progress: g.progress } : {};
}

export async function init() {
  try {
    const me = await api<{ user: User | null }>('GET', '/auth/me');
    if (me.user) {
      loadSnapshot(await api<Snapshot>('GET', '/progress'));
      void flushOutbox();
    } else set({ status: 'ready', user: null, ...guestState() });
  } catch (e) {
    set({ status: 'ready', user: null, ...guestState(), syncError: e instanceof ApiError && e.status !== 401 ? e.message : null });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => void flushOutbox());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void flushOutbox();
    });
  }
}

const SYNC_WAITING = "Saved on this device. It will be sent to your account when you're back online.";

/**
 * Worth keeping to send later: no connection, a server hiccup, too many requests, or a session that has
 * expired (it goes once the learner signs in again). Anything else the server will never accept.
 */
const keep = (e: unknown) =>
  !(e instanceof ApiError) || e.status === 0 || e.status === 401 || e.status === 408 || e.status === 429 || e.status >= 500;

const newKey = () => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
};

type LessonResponse = { cards: CardRow[]; lesson?: { best: number; completions: number; at: number }; day: { day: string } & DayRecord };
type ReviewsResponse = { cards: CardRow[]; day: ({ day: string } & DayRecord) | null };

async function send(op: PendingOp) {
  if (op.kind === 'lesson') {
    const res = await api<LessonResponse>('POST', '/progress/lesson', op.body);
    const p = cloneProgress(state.progress);
    mergeRows(p, res.cards, res.day);
    if (res.lesson) p.lessons.set(op.body.lessonId, res.lesson);
    set({ progress: p });
  } else {
    const res = await api<ReviewsResponse>('POST', '/progress/reviews', op.body);
    const p = cloneProgress(state.progress);
    mergeRows(p, res.cards, res.day);
    set({ progress: p });
  }
}

let flushing = false;
/** Sends waiting results in order. Stops at the first that can't be sent yet; drops any the server refuses. */
export async function flushOutbox() {
  const user = state.user;
  if (flushing || !user) return;
  flushing = true;
  try {
    let ops = loadOutbox(user.username);
    while (ops.length && state.user === user) {
      try {
        await send(ops[0]);
      } catch (e) {
        if (keep(e)) {
          set({ syncError: SYNC_WAITING });
          return;
        }
        set({ syncError: e instanceof ApiError ? `A result from earlier couldn't be saved: ${e.message}` : null });
      }
      ops = ops.slice(1);
      saveOutbox(user.username, ops);
    }
    if (state.syncError === SYNC_WAITING) set({ syncError: null });
  } finally {
    flushing = false;
  }
}

/** Sends a result now, or keeps it in the outbox if it can't be sent yet. */
async function sendOrKeep(op: PendingOp) {
  const user = state.user!;
  const waiting = loadOutbox(user.username);
  if (waiting.length) {
    // Keep the order: this one goes after what is already waiting.
    saveOutbox(user.username, [...waiting, op]);
    void flushOutbox();
    return;
  }
  try {
    await send(op);
    if (state.syncError === SYNC_WAITING) set({ syncError: null });
  } catch (e) {
    if (keep(e)) {
      saveOutbox(user.username, [...loadOutbox(user.username), op]);
      set({ syncError: SYNC_WAITING });
    } else {
      set({ syncError: e instanceof ApiError ? `Your last change couldn't be saved: ${e.message}` : SYNC_WAITING });
    }
  }
}

export async function completeLesson(input: Omit<LessonResult, 'day'>) {
  const now = Date.now();
  const result: LessonResult = { ...input, day: localDay() };
  const progress = cloneProgress(state.progress);
  const outcome = applyLesson(progress, emptyTouched(), result, now);
  if (!state.user) {
    set({ progress, guestLog: { ...state.guestLog, lessons: [...state.guestLog.lessons, { ...result, at: now }].slice(-GUEST_LESSONS) } });
    return outcome;
  }
  set({ progress });
  await sendOrKeep({ kind: 'lesson', body: { ...result, at: now, key: newKey() } });
  return outcome;
}

export async function submitReviews(reviews: ReviewInput[]) {
  if (!reviews.length) return;
  const day = localDay();
  const progress = cloneProgress(state.progress);
  applyReviews(progress, emptyTouched(), reviews.map((r) => ({ ...r, day })));
  if (!state.user) {
    set({
      progress,
      guestLog: { ...state.guestLog, reviews: [...state.guestLog.reviews, ...reviews.map((r) => ({ ...r, day }))].slice(-GUEST_REVIEWS) },
    });
    return;
  }
  set({ progress });
  for (let i = 0; i < reviews.length; i += 100) await sendOrKeep({ kind: 'reviews', body: { day, reviews: reviews.slice(i, i + 100) } });
}

export async function updateSettings(patch: Settings) {
  set({ settings: { ...state.settings, ...patch } });
  if (!state.user) return;
  try {
    await api('PUT', '/progress/settings', patch);
  } catch (e) {
    set({ syncError: e instanceof ApiError ? e.message : SYNC_WAITING });
  }
}

/** The most a guest's device keeps (and imports): the server accepts up to these many. */
const GUEST_LESSONS = 300;
const GUEST_REVIEWS = 3000;

const hasGuestProgress = () => state.guestLog.lessons.length > 0 || state.guestLog.reviews.length > 0;

async function importGuest(): Promise<string | null> {
  if (!hasGuestProgress()) return null;
  try {
    loadSnapshot(await api<Snapshot>('POST', '/progress/import', { ...state.guestLog, settings: state.settings }));
    clearGuest();
    return null;
  } catch (e) {
    return e instanceof ApiError ? e.message : 'Your guest progress could not be added to your account.';
  }
}

/** Returns a note to show the learner if guest progress could not be carried over. */
export async function register(username: string, password: string): Promise<string | null> {
  await api('POST', '/auth/register', { username, password });
  if (hasGuestProgress()) {
    const note = await importGuest(); // loads the new snapshot on success
    if (!note) return null;
    loadSnapshot(await api<Snapshot>('GET', '/progress'));
    return note;
  }
  // Keep choices made before signing up, such as the starting unit.
  if (Object.keys(state.settings).length) await api('PUT', '/progress/settings', state.settings).catch(() => undefined);
  loadSnapshot(await api<Snapshot>('GET', '/progress'));
  clearGuest();
  return null;
}

export async function login(username: string, password: string): Promise<string | null> {
  const res = await api<{ snapshot: Snapshot }>('POST', '/auth/login', { username, password });
  const hadGuest = hasGuestProgress();
  if (hadGuest && Object.keys(res.snapshot.lessons).length === 0 && res.snapshot.cards.length === 0) {
    const note = await importGuest();
    if (!note) return null;
  }
  loadSnapshot(res.snapshot);
  void flushOutbox();
  return hadGuest && Object.keys(res.snapshot.lessons).length > 0
    ? "This account already has progress, so today's guest progress wasn't added to it."
    : null;
}

function resetToGuest() {
  clearGuest();
  set({ user: null, settings: {}, progress: emptyState(), guestLog: { lessons: [], reviews: [] }, syncError: null });
}

export async function logout() {
  await api('POST', '/auth/logout').catch(() => undefined);
  resetToGuest();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api('POST', '/account/password', { currentPassword, newPassword });
}

export async function deleteAccount(password: string) {
  await api('DELETE', '/account', { password });
  resetToGuest();
}

export async function downloadExport() {
  const res = await fetch('/api/account/export', { credentials: 'same-origin' });
  if (!res.ok) throw new ApiError(res.status, 'The export could not be created. Try again.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wycinanka-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

export const dismissSyncError = () => set({ syncError: null });

// ---------- Derived data ----------

export function dueCards(p: ProgressState, now = Date.now()): Array<[string, Card]> {
  return [...p.cards.entries()].filter(([, c]) => c.due <= now).sort((a, b) => a[1].due - b[1].due);
}

export function nextDue(p: ProgressState): number | null {
  let min: number | null = null;
  for (const c of p.cards.values()) if (min === null || c.due < min) min = c.due;
  return min;
}

export function totalXp(p: ProgressState): number {
  let n = 0;
  for (const d of p.activity.values()) n += d.xp;
  return n;
}

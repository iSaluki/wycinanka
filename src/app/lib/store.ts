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
import { setSpeechRate } from './speech';

/**
 * App state. Signed-in learners: the server is authoritative and every change is sent to the API,
 * with the local copy updated immediately. Guests: progress lives only in memory for this tab.
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

export async function init() {
  try {
    const me = await api<{ user: User | null }>('GET', '/auth/me');
    if (me.user) loadSnapshot(await api<Snapshot>('GET', '/progress'));
    else set({ status: 'ready', user: null });
  } catch (e) {
    set({ status: 'ready', user: null, syncError: e instanceof ApiError && e.status !== 401 ? e.message : null });
  }
}

const SYNC_FAILED = "Your last change couldn't be saved. It's kept on this device until you reload — check your connection.";

export async function completeLesson(input: Omit<LessonResult, 'day'>) {
  const now = Date.now();
  const result: LessonResult = { ...input, day: localDay() };
  const progress = cloneProgress(state.progress);
  const outcome = applyLesson(progress, emptyTouched(), result, now);
  if (!state.user) {
    set({ progress, guestLog: { ...state.guestLog, lessons: [...state.guestLog.lessons, { ...result, at: now }] } });
    return outcome;
  }
  set({ progress });
  try {
    const res = await api<{ cards: CardRow[]; lesson: { best: number; completions: number; at: number }; day: { day: string } & DayRecord }>(
      'POST',
      '/progress/lesson',
      result,
    );
    const p = cloneProgress(state.progress);
    mergeRows(p, res.cards, res.day);
    p.lessons.set(result.lessonId, res.lesson);
    set({ progress: p, syncError: null });
  } catch (e) {
    set({ syncError: e instanceof ApiError ? `${SYNC_FAILED} (${e.message})` : SYNC_FAILED });
  }
  return outcome;
}

export async function submitReviews(reviews: ReviewInput[]) {
  if (!reviews.length) return;
  const day = localDay();
  const progress = cloneProgress(state.progress);
  applyReviews(progress, emptyTouched(), reviews.map((r) => ({ ...r, day })));
  if (!state.user) {
    set({ progress, guestLog: { ...state.guestLog, reviews: [...state.guestLog.reviews, ...reviews.map((r) => ({ ...r, day }))].slice(-500) } });
    return;
  }
  set({ progress });
  try {
    for (let i = 0; i < reviews.length; i += 100) {
      const res = await api<{ cards: CardRow[]; day: ({ day: string } & DayRecord) | null }>('POST', '/progress/reviews', {
        day,
        reviews: reviews.slice(i, i + 100),
      });
      const p = cloneProgress(state.progress);
      mergeRows(p, res.cards, res.day);
      set({ progress: p, syncError: null });
    }
  } catch (e) {
    set({ syncError: e instanceof ApiError ? `${SYNC_FAILED} (${e.message})` : SYNC_FAILED });
  }
}

export async function updateSettings(patch: Settings) {
  set({ settings: { ...state.settings, ...patch } });
  if (!state.user) return;
  try {
    await api('PUT', '/progress/settings', patch);
  } catch (e) {
    set({ syncError: e instanceof ApiError ? e.message : SYNC_FAILED });
  }
}

const hasGuestProgress = () => state.guestLog.lessons.length > 0 || state.guestLog.reviews.length > 0;

async function importGuest(): Promise<string | null> {
  if (!hasGuestProgress()) return null;
  try {
    loadSnapshot(await api<Snapshot>('POST', '/progress/import', { ...state.guestLog, settings: state.settings }));
    return null;
  } catch (e) {
    return e instanceof ApiError ? e.message : 'Your progress from this visit could not be added to your account.';
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
  return hadGuest && Object.keys(res.snapshot.lessons).length > 0
    ? "This account already has progress, so today's guest progress wasn't added to it."
    : null;
}

function resetToGuest() {
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

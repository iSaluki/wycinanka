import { LESSONS, getUnitOfLesson, startPosition, UNITS } from '../../content/course';
import type { Lesson } from '../../content/types';
import { localDay, streak } from '../../shared/progress';
import { DEFAULT_SETTINGS, dueCards, totalXp, useApp, type AppState } from './store';

export function nextLesson(s: AppState): Lesson | undefined {
  const start = startPosition(s.settings.startUnit ?? 1);
  const done = s.progress.lessons;
  return (
    LESSONS.find((l) => !done.has(l.id) && (getUnitOfLesson(l.id)?.n ?? 0) >= start) ?? LESSONS.find((l) => !done.has(l.id))
  );
}

export interface Stats {
  done: Set<string>;
  streak: number;
  todayXp: number;
  goal: number;
  due: number;
  deck: number;
  xp: number;
  next: Lesson | undefined;
}

export function computeStats(s: AppState): Stats {
  const today = localDay();
  const active = [...s.progress.activity.entries()].filter(([, d]) => d.xp > 0).map(([day]) => day);
  return {
    done: new Set(s.progress.lessons.keys()),
    streak: streak(active, today),
    todayXp: s.progress.activity.get(today)?.xp ?? 0,
    goal: s.settings.dailyGoal ?? DEFAULT_SETTINGS.dailyGoal,
    due: dueCards(s.progress).length,
    deck: s.progress.cards.size,
    xp: totalXp(s.progress),
    next: nextLesson(s),
  };
}

let cache: { version: number; stats: Stats } | null = null;

/** Memoised per state version, so every component can call it cheaply. */
export function useStats(): Stats {
  return useApp((s) => {
    if (cache?.version !== s.version) cache = { version: s.version, stats: computeStats(s) };
    return cache.stats;
  });
}

export const unitProgress = (unitId: string, done: Set<string>) => {
  const u = UNITS.find((x) => x.id === unitId)!;
  return u.lessons.filter((l) => done.has(l.id)).length;
};

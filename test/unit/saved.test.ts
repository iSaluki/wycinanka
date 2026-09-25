import { beforeEach, describe, expect, it } from 'vitest';
import { applyLesson, emptyState, emptyTouched } from '../../src/shared/engine';
import { LESSONS } from '../../src/content/course';
import { clearGuest, loadGuest, loadOutbox, saveGuest, saveOutbox } from '../../src/app/lib/saved';

class MemoryStorage {
  data = new Map<string, string>();
  getItem = (k: string) => this.data.get(k) ?? null;
  setItem = (k: string, v: string) => void this.data.set(k, v);
  removeItem = (k: string) => void this.data.delete(k);
}

describe('progress kept on the device', () => {
  beforeEach(() => {
    (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
  });

  it("keeps a guest's progress across a reload", () => {
    const p = emptyState();
    const result = { lessonId: LESSONS[1].id, correct: 5, total: 5, missed: [], day: '2026-09-24' };
    applyLesson(p, emptyTouched(), result, 1_000);
    saveGuest({ dailyGoal: 30 }, { lessons: [{ ...result, at: 1_000 }], reviews: [] }, p);
    const back = loadGuest()!;
    expect(back.settings).toEqual({ dailyGoal: 30 });
    expect(back.guestLog.lessons).toHaveLength(1);
    expect([...back.progress.cards.keys()]).toEqual([...p.cards.keys()]);
    expect(back.progress.cards.get([...p.cards.keys()][0])).toEqual([...p.cards.values()][0]);
    expect(back.progress.lessons.get(LESSONS[1].id)).toEqual(p.lessons.get(LESSONS[1].id));
    clearGuest();
    expect(loadGuest()).toBeNull();
  });

  it("never hands one learner's waiting results to another", () => {
    const op = { kind: 'reviews' as const, body: { day: '2026-09-24', reviews: [{ cardId: 'pic-apple', rating: 3 as const, at: 1 }] } };
    saveOutbox('Anna', [op]);
    expect(loadOutbox('anna')).toEqual([op]);
    expect(loadOutbox('tom')).toEqual([]);
    saveOutbox('Anna', []);
    expect(loadOutbox('Anna')).toEqual([]);
  });

  it('carries on without storage', () => {
    (globalThis as { localStorage?: unknown }).localStorage = undefined;
    expect(() => saveGuest({}, { lessons: [], reviews: [] }, emptyState())).not.toThrow();
    expect(loadGuest()).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { getLesson, isLessonId, LESSONS, nextLessonAfter } from '../../src/content/course';
import { CULTURE } from '../../src/content/culture';
import { CULTURE_STOPS, cultureAfter, cultureStop } from '../../src/content/culture-stops';
import { PICTURE_DECKS } from '../../src/content/pictures';
import { lessonPlan, pictureRound, withPictures } from '../../src/app/lib/exercises';
import { lessonPictures } from '../../src/app/lib/reinforce';
import { emptyState } from '../../src/shared/engine';
import { newCard } from '../../src/shared/fsrs';

describe('culture breaks in the course', () => {
  it('follow real lessons and point at real culture notes, each once', () => {
    const ids = CULTURE_STOPS.map(([, c]) => c);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [lesson, culture] of CULTURE_STOPS) {
      expect(isLessonId(lesson), lesson).toBe(true);
      expect(cultureAfter(lesson)?.id).toBe(culture);
    }
  });

  it('cover every culture note', () => {
    expect(new Set(CULTURE_STOPS.map(([, c]) => c))).toEqual(new Set(CULTURE.map((c) => c.id)));
  });

  it('know the lesson to go on to', () => {
    const [lesson, culture] = CULTURE_STOPS[0];
    expect(cultureStop(culture)).toEqual({ after: lesson, next: nextLessonAfter(lesson) });
    expect(cultureAfter(LESSONS[LESSONS.length - 1].id)).toBeUndefined();
  });

  it('give every culture note a picture', () => {
    for (const c of CULTURE) expect(c.image, c.id).toBeDefined();
  });
});

describe('pictures in lessons', () => {
  it('lesson words that have a picture flashcard show it and are named from it', () => {
    const lesson = getLesson('u04-l1')!;
    expect(withPictures(lesson.items).filter((i) => i.img).length).toBeGreaterThan(0);
    const named = lessonPlan(lesson, { speaking: false }).exercises.filter((e) => e.kind === 'choose' && e.image);
    expect(named.length).toBeGreaterThan(0);
  });

  it('a new learner meets new pictures, then names each one', () => {
    const { fresh, known } = lessonPictures(emptyState());
    expect(known).toEqual([]);
    expect(fresh.map((p) => p.id)).toEqual(PICTURE_DECKS[0].pictures.slice(0, 2).map((p) => p.id));
    const [group] = pictureRound(fresh, known);
    expect(group[0].kind).toBe('meet');
    expect(group.slice(1).map((e) => e.kind === 'choose' && e.tag === 'picture' && e.cardId)).toEqual(fresh.map((p) => p.id));
  });

  it('mixes one new picture with a known one', () => {
    const p = emptyState();
    const first = PICTURE_DECKS[0].pictures[0];
    p.cards.set(first.id, newCard(Date.now()));
    const { fresh, known } = lessonPictures(p);
    expect(known.map((k) => k.id)).toEqual([first.id]);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].id).not.toBe(first.id);
    expect(pictureRound(fresh, known)).toHaveLength(2);
  });
});

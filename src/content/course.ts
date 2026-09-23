import { u01, u02, u03, u04, u05 } from './units/a1-part1';
import { u06, u07, u08, u09, u10 } from './units/a1-part2';
import { u11, u12, u13, u14, u15, u16 } from './units/a2';
import { u17, u18 } from './units/b1';
import { FREQUENCY } from './frequency';
import type { FrequencyWord, Item, Lesson, Sentence, Unit } from './types';

export const UNITS: Unit[] = [u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12, u13, u14, u15, u16, u17, u18];

export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);

export type CardSource =
  | { kind: 'item'; item: Item; lesson: Lesson }
  | { kind: 'sentence'; sentence: Sentence; lesson: Lesson }
  | { kind: 'word'; word: FrequencyWord };

const lessonMap = new Map<string, Lesson>();
const unitOfLesson = new Map<string, Unit>();
const cardMap = new Map<string, CardSource>();

for (const u of UNITS) {
  for (const l of u.lessons) {
    lessonMap.set(l.id, l);
    unitOfLesson.set(l.id, u);
    for (const item of l.items) cardMap.set(item.id, { kind: 'item', item, lesson: l });
    for (const sentence of l.sentences) cardMap.set(sentence.id, { kind: 'sentence', sentence, lesson: l });
  }
}
for (const word of FREQUENCY) cardMap.set(word.id, { kind: 'word', word });

export const getLesson = (id: string) => lessonMap.get(id);
export const getUnitOfLesson = (id: string) => unitOfLesson.get(id);
export const getCard = (id: string) => cardMap.get(id);
export const isCardId = (id: string) => cardMap.has(id);
export const isLessonId = (id: string) => lessonMap.has(id);

/** Card ids a lesson adds to the review deck. */
export function lessonCardIds(lesson: Lesson): string[] {
  return [...lesson.items.map((i) => i.id), ...lesson.sentences.map((s) => s.id)];
}

export function nextLessonAfter(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}

export const TOTAL_LESSONS = LESSONS.length;

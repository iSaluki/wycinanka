import { nextLessonAfter } from './course';
import { cultureTopic, type CultureTopic } from './culture';
import type { Lesson } from './types';

/**
 * Culture breaks in the course: a culture note to read after a lesson, placed where it fits what was just
 * learnt (name days after introductions, the Christmas Eve supper after the family). They teach and never
 * test: nothing to answer, no score, and a learner who only wants the language can skip them.
 */
const AFTER: Array<[lessonId: string, cultureId: string]> = [
  ['u00-l6', 'wycinanki'],
  ['u01-l3', 'chrzest'],
  ['u02-l3', 'goscinnosc'],
  ['u03-l2', 'imieniny'],
  ['u04-l3', 'rzeczpospolita'],
  ['u06-l2', 'kuchnia'],
  ['u06-l3', 'tlusty-czwartek'],
  ['u07-l3', 'muzyka'],
  ['u08-l1', 'wigilia'],
  ['u09-l1', 'powstanie-warszawskie'],
  ['u10-l1', 'swieta-narodowe'],
  ['u10-l3', 'wielkanoc'],
  ['u11-l3', 'solidarnosc'],
  ['u12-l3', 'marzanna'],
  ['u13-l3', 'andrzejki'],
  ['u14-l3', 'noc-kupaly'],
  ['u16-l3', 'wszystkich-swietych'],
];

export const CULTURE_STOPS: ReadonlyArray<readonly [string, string]> = AFTER;

const byLesson = new Map(AFTER);
const lessonOf = new Map(AFTER.map(([l, c]) => [c, l]));

/** The culture break that follows a lesson, if any. */
export function cultureAfter(lessonId: string): CultureTopic | undefined {
  const id = byLesson.get(lessonId);
  return id ? cultureTopic(id) : undefined;
}

/** Where a culture break sits in the course: the lesson before it and the one after. */
export function cultureStop(cultureId: string): { after: string; next?: Lesson } | undefined {
  const after = lessonOf.get(cultureId);
  return after ? { after, next: nextLessonAfter(after) } : undefined;
}

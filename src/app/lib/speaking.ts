import { CHUNKS } from '../../content/chunks';
import { getUnitOfLesson, LESSONS, UNITS } from '../../content/course';
import { TONGUE_TWISTERS } from '../../content/sounds';
import type { Lesson } from '../../content/types';
import { preferForm, readAloud, sayAfterMe, sayInPolish, shuffle, type Exercise } from './exercises';

/** Rounds for the speaking section (pages/Speaking). */

const SIZE = 10;

/**
 * The lessons to speak from: those finished, or, before any, the first few of the learner's starting unit,
 * so there is always something to say.
 */
export function speakingLessons(done: Set<string>, startUnit = 1): Lesson[] {
  const finished = LESSONS.filter((l) => !l.phonics && done.has(l.id));
  if (finished.length) return finished;
  const unit = UNITS.find((u) => u.n === Math.max(1, startUnit)) ?? UNITS[1];
  return unit.lessons.filter((l) => !l.phonics).slice(0, 2);
}

/** Lessons with a dialogue to role-play: finished ones, or before any, the next one coming up. */
export function conversationLessons(done: Set<string>, startUnit = 1): { lessons: Lesson[]; preview: boolean } {
  const withDialogue = LESSONS.filter((l) => (l.dialogue?.length ?? 0) > 1);
  const finished = withDialogue.filter((l) => done.has(l.id));
  if (finished.length) return { lessons: finished, preview: false };
  const from = LESSONS.findIndex((l) => getUnitOfLesson(l.id)!.n >= startUnit);
  const next = withDialogue.find((l) => LESSONS.indexOf(l) >= from) ?? withDialogue[0];
  return { lessons: next ? [next] : [], preview: true };
}

export type SpeakingMode = 'repeat' | 'translate' | 'sounds' | 'phrases' | 'twisters';

/** A round of speaking practice. */
export function speakingRound(mode: SpeakingMode, lessons: Lesson[], speaker?: 'm' | 'f'): Exercise[] {
  const items = lessons.flatMap((l) => l.items).map((i) => preferForm(i, speaker));
  const sentences = lessons.flatMap((l) => l.sentences).map((s) => preferForm(s, speaker));
  switch (mode) {
    case 'repeat': {
      // Words first, then sentences: build up from short to long.
      const words = shuffle(items).slice(0, SIZE / 2);
      const said = shuffle(sentences).slice(0, SIZE - words.length);
      return [...words, ...said].map(sayAfterMe);
    }
    case 'translate':
      return shuffle(items)
        .slice(0, SIZE)
        .sort((a, b) => a.pl.length - b.pl.length)
        .map(sayInPolish);
    case 'sounds':
      return shuffle(LESSONS.filter((l) => l.phonics).flatMap((l) => l.items.flatMap((i) => (i.ex ?? []).map((w) => ({ id: i.id, w, en: i.en })))))
        .slice(0, SIZE)
        .map(({ id, w }) => readAloud(id, w));
    case 'phrases':
      return shuffle(CHUNKS)
        .slice(0, 8)
        .map((c) => sayAfterMe({ id: c.id, pl: c.pl, en: c.en }));
    case 'twisters':
      return TONGUE_TWISTERS.map(([pl, en], i) => sayAfterMe({ id: `twister-${i}`, pl, en }));
  }
}

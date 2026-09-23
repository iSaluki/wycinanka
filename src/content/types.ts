export type Level = 'A1' | 'A2' | 'B1';
export type Gender = 'm' | 'f' | 'n' | 'pl' | 'mp';

/** A word or fixed phrase taught in a lesson. */
export interface Item {
  id: string;
  pl: string;
  en: string;
  /** Extra accepted answers. */
  altPl?: string[];
  altEn?: string[];
  /** Pronunciation or usage note shown on the intro card. */
  hint?: string;
  g?: Gender;
  /** Example words (phonics lessons). */
  ex?: string[];
  /** Picture of the thing (picture flashcards). */
  img?: string;
}

/** A full sentence: used for building, translating and listening. */
export interface Sentence {
  id: string;
  pl: string;
  en: string;
  altPl?: string[];
  altEn?: string[];
  /** Plausible wrong tiles for the sentence builder (Polish). */
  extra?: string[];
}

/** Choose-the-right-form exercise, e.g. a case ending. `text` contains ___ for the gap. */
export interface Drill {
  id: string;
  text: string;
  en: string;
  options: string[];
  answer: string;
  why?: string;
}

export interface Spotlight {
  title: string;
  /** Short paragraphs. `**x**` marks emphasis; Polish in `{x}` is set in the Polish face. */
  body: string[];
  table?: { head: string[]; rows: string[][] };
  examples?: Array<[pl: string, en: string]>;
}

export interface DialogueLine {
  who: string;
  pl: string;
  en: string;
}

export interface Lesson {
  id: string;
  title: string;
  goal: string;
  items: Item[];
  sentences: Sentence[];
  drills: Drill[];
  spotlight?: Spotlight;
  dialogue?: DialogueLine[];
  /** A phonics lesson: items are letters and sounds rather than words. */
  phonics?: boolean;
}

export interface Unit {
  id: string;
  n: number;
  title: string;
  titlePl: string;
  level: Level;
  summary: string;
  lessons: Lesson[];
}

export interface FrequencyWord {
  id: string;
  rank: number;
  pl: string;
  en: string;
  pos: string;
  ex?: [pl: string, en: string];
}

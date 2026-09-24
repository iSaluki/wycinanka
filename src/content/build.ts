import { LEGACY_IDS } from './legacy-ids';
import type { DialogueLine, Drill, Item, Lesson, Level, Sentence, Spotlight, Unit, Gender } from './types';

type ItemOpts = { altPl?: string[]; altEn?: string[]; hint?: string; g?: Gender; ex?: string[]; key?: string };
/** `key`: keeps a sentence's id (and so learners' review cards) when its Polish is corrected. */
type SentenceOpts = { altPl?: string[]; altEn?: string[]; extra?: string[]; key?: string };

export type ItemSpec = [pl: string, en: string, opts?: ItemOpts];
export type SentenceSpec = [pl: string, en: string, opts?: SentenceOpts];
export type DrillSpec = [text: string, en: string, options: string[], answer: string, why?: string];

export function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function lesson(
  id: string,
  title: string,
  goal: string,
  spec: {
    items: ItemSpec[];
    sentences: SentenceSpec[];
    drills?: DrillSpec[];
    spotlight?: Spotlight;
    dialogue?: Array<[who: string, pl: string, en: string]>;
    phonics?: boolean;
  },
): Lesson {
  const items: Item[] = spec.items.map(([pl, en, o]) => {
    const { key, ...rest } = o ?? {};
    return { id: `${id}:${key ?? slug(pl)}`, pl, en, ...rest };
  });
  // Ids come from the text, so adding, removing or reordering sentences never moves a learner's review card
  // onto a different sentence. Older content keeps the numbered ids its cards were saved under.
  const legacy = LEGACY_IDS[id];
  const sentenceId = (pl: string, key?: string) => {
    if (key) return `${id}:${key}`;
    const n = legacy?.s.indexOf(pl) ?? -1;
    return n >= 0 ? `${id}:s${n + 1}` : `${id}:s-${slug(pl)}`;
  };
  const drillId = (text: string, answer: string) => {
    const n = legacy?.d.indexOf(`${text}|${answer}`) ?? -1;
    return n >= 0 ? `${id}:d${n + 1}` : `${id}:d-${slug(text.replace('___', answer))}`;
  };
  const sentences: Sentence[] = spec.sentences.map(([pl, en, o]) => {
    const { key, ...rest } = o ?? {};
    return { id: sentenceId(pl, key), pl, en, ...rest };
  });
  const drills: Drill[] = (spec.drills ?? []).map(([text, en, options, answer, why]) => ({
    id: drillId(text, answer),
    text,
    en,
    options,
    answer,
    why,
  }));
  const dialogue: DialogueLine[] | undefined = spec.dialogue?.map(([who, pl, en]) => ({ who, pl, en }));
  return { id, title, goal, items, sentences, drills, spotlight: spec.spotlight, dialogue, ...(spec.phonics ? { phonics: true } : {}) };
}

/** A unit. `key` fixes its id (u06) for good; where it sits in the course is decided by UNITS in course.ts. */
export function unit(key: number, level: Level, title: string, titlePl: string, summary: string, lessons: Lesson[]): Unit {
  return { id: `u${String(key).padStart(2, '0')}`, key, n: key, level, title, titlePl, summary, lessons };
}

import type { DialogueLine, Drill, Item, Lesson, Level, Sentence, Spotlight, Unit, Gender } from './types';

type ItemOpts = { altPl?: string[]; altEn?: string[]; hint?: string; g?: Gender; ex?: string[]; key?: string };
type SentenceOpts = { altPl?: string[]; altEn?: string[]; extra?: string[] };

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
  const sentences: Sentence[] = spec.sentences.map(([pl, en, o], i) => ({ id: `${id}:s${i + 1}`, pl, en, ...o }));
  const drills: Drill[] = (spec.drills ?? []).map(([text, en, options, answer, why], i) => ({
    id: `${id}:d${i + 1}`,
    text,
    en,
    options,
    answer,
    why,
  }));
  const dialogue: DialogueLine[] | undefined = spec.dialogue?.map(([who, pl, en]) => ({ who, pl, en }));
  return { id, title, goal, items, sentences, drills, spotlight: spec.spotlight, dialogue, ...(spec.phonics ? { phonics: true } : {}) };
}

export function unit(n: number, level: Level, title: string, titlePl: string, summary: string, lessons: Lesson[]): Unit {
  return { id: `u${String(n).padStart(2, '0')}`, n, level, title, titlePl, summary, lessons };
}

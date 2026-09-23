import type { DialogueLine, Drill, FrequencyWord, Item, Lesson, Sentence, Spotlight } from '../../content/types';
import { getCard, LESSONS, type CardSource } from '../../content/course';
import type { Picture } from '../../content/pictures';
import { normalise } from '../../shared/grade';
import { respell } from '../../shared/phonetics';

/** Exercise model and generators for lessons and reviews. */

export type Exercise =
  | { kind: 'meet'; items: Item[] }
  | { kind: 'spotlight'; spotlight: Spotlight }
  | { kind: 'dialogue'; lines: DialogueLine[] }
  | {
      kind: 'choose';
      cardId: string;
      prompt: string;
      promptLang: 'pl' | 'en';
      options: string[];
      answer: string;
      audio?: boolean;
      /** Override the default instruction line. */
      instruction?: string;
      /** How to set the options: Polish, English, or an English-style respelling. */
      optionStyle?: 'pl' | 'en' | 'say';
      /** Shown after a wrong answer. */
      hint?: string;
      /** Shown instead of audio when the device has no Polish voice. */
      fallback?: string;
      /** Show this picture in place of the prompt text (picture flashcards). */
      image?: string;
      tag?: 'warmup';
    }
  | { kind: 'type'; cardId: string; prompt: string; accepted: string[]; lang: 'pl' | 'en'; hint?: string; tag?: 'warmup' }
  | {
      kind: 'build';
      cardId: string;
      prompt: string;
      tiles: string[];
      accepted: string[];
      lang: 'pl' | 'en';
      audio?: string;
      /** English meaning, shown instead of audio when there is no Polish voice. */
      meaning?: string;
      tag?: 'warmup';
    }
  | { kind: 'match'; pairs: Array<{ cardId: string; pl: string; en: string }> }
  | { kind: 'gap'; cardId: string; text: string; en: string; options: string[]; answer: string; why?: string; tag?: 'warmup' };

export type GradedExercise = Exclude<Exercise, { kind: 'meet' } | { kind: 'spotlight' } | { kind: 'dialogue' }>;

export const isGraded = (e: Exercise): e is GradedExercise => !['meet', 'spotlight', 'dialogue'].includes(e.kind);

const PUNCT_EDGE = /^[„"“«(¿¡]+|[.,!?;:…"”»)]+$/g;

export function tokenise(s: string): string[] {
  return s
    .split(/\s+/)
    .map((t) => t.replace(PUNCT_EDGE, ''))
    .filter(Boolean);
}

export function shuffle<T>(xs: readonly T[], rand = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` distinct distractors whose normalised text differs from the answer. */
function distractors(answer: string, pool: string[], n: number): string[] {
  const seen = new Set([normalise(answer)]);
  const out: string[] = [];
  for (const p of shuffle(pool)) {
    const k = normalise(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length === n) break;
  }
  return out;
}

function nearbyLessons(lesson: Lesson): Lesson[] {
  const i = LESSONS.findIndex((l) => l.id === lesson.id);
  return LESSONS.slice(Math.max(0, i - 2), i + 3);
}

const accEn = (x: { en: string; altEn?: string[] }) => [x.en, ...(x.altEn ?? [])];
const accPl = (x: { pl: string; altPl?: string[] }) => [x.pl, ...(x.altPl ?? [])];

function chooseMeaning(item: Item, pool: string[], audio = false): Exercise {
  const opts = shuffle([item.en, ...distractors(item.en, pool, 3)]);
  return { kind: 'choose', cardId: item.id, prompt: item.pl, promptLang: 'pl', options: opts, answer: item.en, audio, hint: item.hint };
}

function choosePolish(item: Item, pool: string[]): Exercise {
  const opts = shuffle([item.pl, ...distractors(item.pl, pool, 3)]);
  return { kind: 'choose', cardId: item.id, prompt: item.en, promptLang: 'en', options: opts, answer: item.pl };
}

function typePolish(item: Item): Exercise {
  return { kind: 'type', cardId: item.id, prompt: item.en, accepted: accPl(item), lang: 'pl', hint: item.hint };
}

function buildPolish(s: Sentence, wordPool: string[]): Exercise {
  const tokens = tokenise(s.pl);
  const correct = new Set([s.pl, ...(s.altPl ?? [])].flatMap(tokenise).map(normalise));
  const extra = (s.extra?.length ? s.extra : distractors('', wordPool, 2)).filter((e) => !correct.has(normalise(e)));
  return { kind: 'build', cardId: s.id, prompt: s.en, tiles: shuffle([...tokens, ...extra]), accepted: accPl(s), lang: 'pl' };
}

function buildFromAudio(s: Sentence, wordPool: string[]): Exercise {
  const ex = buildPolish(s, wordPool) as Extract<Exercise, { kind: 'build' }>;
  return { ...ex, prompt: 'Listen and build what you hear.', audio: s.pl, meaning: s.en };
}

function gapFor(d: Drill): Exercise {
  return { kind: 'gap', cardId: d.id, text: d.text, en: d.en, options: shuffle(d.options), answer: d.answer, why: d.why };
}

function translateToEnglish(s: Sentence): Exercise {
  return { kind: 'type', cardId: s.id, prompt: s.pl, accepted: accEn(s), lang: 'en' };
}

const MASC_ENDINGS = ['łem', 'łeś', 'łbym', 'łbyś', 'liśmy', 'libyśmy'];
const FEM_ENDINGS = ['łam', 'łaś', 'łabym', 'łabyś', 'łyśmy', 'łybyśmy'];
const hasEnding = (s: string, endings: string[]) => tokenise(s.toLowerCase()).some((w) => endings.some((e) => w.endsWith(e)));

/**
 * Polish past and conditional forms depend on the speaker's gender. Content stores both
 * (e.g. byłem / byłam); show the learner the form that matches them. Both stay accepted.
 */
export function preferForm<T extends { pl: string; altPl?: string[] }>(x: T, speaker?: 'm' | 'f'): T {
  if (!speaker || !x.altPl?.length) return x;
  const [want, avoid] = speaker === 'f' ? [FEM_ENDINGS, MASC_ENDINGS] : [MASC_ENDINGS, FEM_ENDINGS];
  if (!hasEnding(x.pl, avoid) || hasEnding(x.pl, want)) return x;
  const alt = x.altPl.find((a) => hasEnding(a, want) && !hasEnding(a, avoid));
  return alt ? { ...x, pl: alt, altPl: [x.pl, ...x.altPl.filter((a) => a !== alt)] } : x;
}

export function lessonForSpeaker(lesson: Lesson, speaker?: 'm' | 'f'): Lesson {
  if (!speaker) return lesson;
  return {
    ...lesson,
    items: lesson.items.map((i) => preferForm(i, speaker)),
    sentences: lesson.sentences.map((x) => preferForm(x, speaker)),
  };
}

/**
 * Build the sequence for a lesson: meet the words, read the spotlight, then practise with
 * recognition before production, and finish with the dialogue.
 */
export function lessonExercises(lesson: Lesson): Exercise[] {
  if (lesson.phonics) return phonicsExercises(lesson);
  const near = nearbyLessons(lesson);
  const enPool = near.flatMap((l) => l.items.map((i) => i.en));
  const plPool = near.flatMap((l) => l.items.map((i) => i.pl));
  const wordPool = near.flatMap((l) => l.sentences.flatMap((s) => tokenise(s.pl)));
  const items = shuffle(lesson.items);
  const half = Math.ceil(items.length / 2);

  const recognise: Exercise[] = items.slice(0, half).map((i) => chooseMeaning(i, enPool));
  const matchItems = shuffle(lesson.items).slice(0, 5);
  const match: Exercise = { kind: 'match', pairs: matchItems.map((i) => ({ cardId: i.id, pl: i.pl, en: i.en })) };
  const listen: Exercise[] = items.slice(half, half + 2).map((i) => chooseMeaning(i, enPool, true));
  const pickPl: Exercise[] = items.slice(half + 2, half + 3).map((i) => choosePolish(i, plPool));
  const produce: Exercise[] = shuffle(lesson.items)
    .sort((a, b) => a.pl.length - b.pl.length)
    .slice(0, 4)
    .map(typePolish);
  const sentences = shuffle(lesson.sentences);
  const builds: Exercise[] = sentences.slice(0, -1).map((s) => buildPolish(s, wordPool));
  const last = sentences[sentences.length - 1];
  const finale: Exercise[] = last ? [Math.random() < 0.5 ? buildFromAudio(last, wordPool) : translateToEnglish(last)] : [];
  const gaps: Exercise[] = lesson.drills.map(gapFor);

  // Interleave grammar drills with sentence building so neither arrives as a block.
  const middle: Exercise[] = [];
  const a = [...builds];
  const b = [...gaps];
  while (a.length || b.length) {
    if (a.length) middle.push(a.shift()!);
    if (b.length) middle.push(b.shift()!);
  }

  return [
    { kind: 'meet', items: lesson.items },
    ...(lesson.spotlight ? [{ kind: 'spotlight', spotlight: lesson.spotlight } as Exercise] : []),
    ...recognise,
    match,
    ...listen,
    ...pickPl,
    ...middle,
    ...produce,
    ...finale,
    ...(lesson.dialogue ? [{ kind: 'dialogue', lines: lesson.dialogue } as Exercise] : []),
  ];
}

/** One exercise for a review card. Mature cards are asked productively (typed); young ones by recognition. */
export function reviewExercise(src: CardSource, reps: number, cardId: string, speaker?: 'm' | 'f'): Exercise {
  if (src.kind === 'drill') return gapFor(src.drill);
  if (src.kind === 'item' && src.lesson.phonics) {
    const pool = LESSONS.filter((l) => l.phonics).flatMap((l) => l.items);
    return reps % 2 === 0 ? soundOf(src.item, pool) : readWord(src.item, pool);
  }
  if (src.kind === 'item') {
    const near = nearbyLessons(src.lesson);
    const item = preferForm(src.item, speaker);
    if (reps >= 2) return typePolish(item);
    return chooseMeaning(item, near.flatMap((l) => l.items.map((i) => i.en)), reps === 1);
  }
  if (src.kind === 'sentence') {
    const pool = nearbyLessons(src.lesson).flatMap((l) => l.sentences.flatMap((s) => tokenise(s.pl)));
    const sentence = preferForm(src.sentence, speaker);
    if (reps >= 3) return translateToEnglish(sentence);
    return reps % 2 === 0 ? buildPolish(sentence, pool) : buildFromAudio(sentence, pool);
  }
  if (src.kind === 'picture') return pictureChoice(src.picture, src.deck.pictures.map((p) => p.pl));
  return wordExercise(src.word, reps, cardId);
}

/** "What is this in Polish?" — a picture and four Polish words, the wrong ones from the same deck. */
export function pictureChoice(p: Picture, pool: string[]): Exercise {
  return {
    kind: 'choose',
    cardId: p.id,
    prompt: p.en,
    promptLang: 'en',
    options: shuffle([p.pl, ...distractors(p.pl, pool, 3)]),
    answer: p.pl,
    image: p.img,
    instruction: 'What is this in Polish?',
  };
}

let wordPoolCache: string[] | undefined;
function wordExercise(w: FrequencyWord, reps: number, cardId: string): Exercise {
  if (reps >= 2) return { kind: 'type', cardId, prompt: w.en, accepted: [w.pl], lang: 'pl', hint: w.pos };
  wordPoolCache ??= LESSONS.flatMap((l) => l.items.map((i) => i.en));
  const opts = shuffle([w.en, ...distractors(w.en, wordPoolCache, 3)]);
  return { kind: 'choose', cardId, prompt: w.pl, promptLang: 'pl', options: opts, answer: w.en, audio: false };
}

/* ---------- Phonics ---------- */

// Spelling swaps a learner is likely to make. Used to build believable wrong answers.
const CONFUSIONS: Array<[string, string]> = [
  ['sz', 's'], ['sz', 'ś'], ['ś', 'sz'], ['si', 'szi'], ['cz', 'c'], ['cz', 'ć'], ['ć', 'cz'], ['ci', 'czi'],
  ['rz', 'r'], ['ż', 'z'], ['ź', 'ż'], ['dź', 'dż'], ['dzi', 'dżi'], ['dż', 'dz'], ['ł', 'l'], ['w', 'ł'],
  ['j', 'dż'], ['ch', 'cz'], ['c', 'k'], ['ó', 'o'], ['ą', 'o'], ['ę', 'e'], ['y', 'i'], ['ń', 'n'], ['ni', 'n'],
];

/** Misspellings of a word that sound different from it. */
export function soundAlikes(word: string): string[] {
  const target = respell(word);
  const seen = new Set([target]);
  const out: string[] = [];
  for (const [from, to] of CONFUSIONS) {
    const i = word.toLowerCase().indexOf(from);
    if (i < 0) continue;
    const variant = word.slice(0, i) + to + word.slice(i + from.length);
    const r = respell(variant);
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(variant);
  }
  return out;
}

const firstExample = (item: Item) => item.ex?.[0] ?? item.pl;

/** "How does it sound?" — spelling to sound. */
function soundOf(item: Item, pool: Item[]): Exercise {
  const opts = shuffle([item.en, ...distractors(item.en, pool.map((i) => i.en), 3)]);
  return {
    kind: 'choose',
    cardId: item.id,
    prompt: item.pl,
    promptLang: 'pl',
    options: opts,
    answer: item.en,
    instruction: 'How does it sound?',
    hint: item.hint,
  };
}

/** "Which spelling makes this sound?" — sound to spelling. */
function spellingOf(item: Item, pool: Item[]): Exercise {
  const opts = shuffle([item.pl, ...distractors(item.pl, pool.map((i) => i.pl), 3)]);
  return {
    kind: 'choose',
    cardId: item.id,
    prompt: item.en,
    promptLang: 'en',
    options: opts,
    answer: item.pl,
    instruction: 'Which spelling makes this sound?',
    hint: item.hint,
  };
}

/** "How do you say it?" — read a word and pick the right respelling from likely misreadings. */
function readWord(item: Item, pool: Item[], which = 0): Exercise {
  const word = item.ex?.[which] ?? firstExample(item);
  const answer = respell(word);
  let wrong = soundAlikes(word).map(respell);
  if (wrong.length < 2) wrong = [...wrong, ...pool.flatMap((i) => i.ex ?? []).map(respell)];
  const opts = shuffle([answer, ...distractors(answer, wrong, 2)]);
  return {
    kind: 'choose',
    cardId: item.id,
    prompt: word,
    promptLang: 'pl',
    options: opts,
    answer,
    instruction: 'How do you say it? (capitals show the stress)',
    optionStyle: 'say',
    hint: `${item.pl} sounds like ${item.en}.`,
  };
}

/** "Which word do you hear?" — listen and choose between near-identical spellings. */
function hearWord(item: Item, which = 1): Exercise {
  const word = item.ex?.[which] ?? firstExample(item);
  const opts = shuffle([word, ...soundAlikes(word).slice(0, 2)]);
  return {
    kind: 'choose',
    cardId: item.id,
    prompt: word,
    promptLang: 'pl',
    options: opts,
    answer: word,
    audio: true,
    instruction: 'Which word do you hear?',
    optionStyle: 'pl',
    fallback: `Sounds like: ${respell(word)}`,
    hint: `${item.pl} sounds like ${item.en}.`,
  };
}

/** A phonics lesson: meet each sound, then map spelling ↔ sound, read words and hear words. */
export function phonicsExercises(lesson: Lesson): Exercise[] {
  const pool = LESSONS.filter((l) => l.phonics).flatMap((l) => l.items);
  const items = shuffle(lesson.items);
  const hearable = items.filter((i) => (i.ex?.[1] ? soundAlikes(i.ex[1]).length : 0) > 0);
  return [
    { kind: 'meet', items: lesson.items },
    ...(lesson.spotlight ? [{ kind: 'spotlight', spotlight: lesson.spotlight } as Exercise] : []),
    ...items.map((i) => soundOf(i, pool)),
    { kind: 'match', pairs: shuffle(lesson.items).slice(0, 5).map((i) => ({ cardId: i.id, pl: i.pl, en: i.en })) },
    ...shuffle(items).slice(0, 3).map((i) => spellingOf(i, pool)),
    ...lesson.drills.map(gapFor),
    ...items.map((i) => readWord(i, pool)),
    ...hearable.slice(0, 3).map((i) => hearWord(i)),
  ];
}

/* ---------- Reinforcement ---------- */

/** Exercises for a set of cards (review, warm-ups, trouble spots, unit revision). */
export function practiceExercises(cards: Array<{ id: string; reps: number }>, speaker?: 'm' | 'f', tag?: 'warmup'): Exercise[] {
  return cards.flatMap(({ id, reps }) => {
    const src = getCard(id);
    if (!src) return [];
    const ex = reviewExercise(src, reps, id, speaker);
    return [tag && 'cardId' in ex ? ({ ...ex, tag } as Exercise) : ex];
  });
}

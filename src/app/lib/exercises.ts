import type { DialogueLine, Drill, FrequencyWord, Item, Lesson, Sentence, Spotlight } from '../../content/types';
import { getCard, LESSONS, type CardSource } from '../../content/course';
import { PICTURES, type Picture } from '../../content/pictures';
import { CHUNK_CORES, chunkCore, CHUNKS, type Chunk } from '../../content/chunks';
import { normalise } from '../../shared/grade';
import { respell } from '../../shared/phonetics';

/** Exercise model and generators for lessons and reviews. */

/**
 * Questions from earlier lessons mixed into a lesson: a warm-up opens it, and signed-in learners also get
 * personalised revision part-way through. Neither counts towards the lesson's score.
 */
export type ExtraTag = 'warmup' | 'revision' | 'picture';

export type Exercise =
  /** New material, a few at a time. `from` and `total` place this group within everything the session introduces. */
  | { kind: 'meet'; items: Item[]; from?: number; total?: number }
  | { kind: 'spotlight'; spotlight: Spotlight }
  | { kind: 'dialogue'; lines: DialogueLine[] }
  /** The lesson's conversation heard at natural speed, without the text: listening before reading. */
  | { kind: 'listen'; lines: DialogueLine[] }
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
      /** What to read aloud, when the Polish on screen is a spelling rather than a word (phonics). */
      say?: string;
      tag?: ExtraTag;
    }
  | {
      kind: 'type';
      cardId: string;
      prompt: string;
      accepted: string[];
      lang: 'pl' | 'en';
      hint?: string;
      tag?: ExtraTag;
      /** Other course words that also mean the prompt ("hello": cześć as well as dzień dobry). Accepted, and named as such. */
      also?: string[];
    }
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
      tag?: ExtraTag;
    }
  | { kind: 'match'; pairs: MatchPair[] }
  | { kind: 'gap'; cardId: string; text: string; en: string; options: string[]; answer: string; why?: string; tag?: ExtraTag }
  | SpeakExercise;

/**
 * Say something aloud. Checked by speech recognition where the device has it, or by listening back.
 * Speaking is practice on top of a lesson: it never counts towards the score or the review schedule, so a
 * recogniser that mishears a learner can't hold them back.
 */
export interface SpeakExercise {
  kind: 'speak';
  cardId: string;
  /**
   * repeat: hear it and say it back. translate: say the Polish for the English.
   * read: read the Polish aloud before hearing it. reply: say your line after the other speaker's.
   */
  mode: 'repeat' | 'translate' | 'read' | 'reply';
  /** The Polish to say, as shown and played afterwards. */
  pl: string;
  /** Every way of saying it that counts. */
  accepted: string[];
  en?: string;
  /** The other speaker's line before yours (reply). */
  cue?: DialogueLine;
}

export type MatchPair = { cardId: string; pl: string; en: string; say?: string };

export type GradedExercise = Exclude<Exercise, { kind: 'meet' } | { kind: 'spotlight' } | { kind: 'dialogue' } | { kind: 'listen' } | SpeakExercise>;

export const isGraded = (e: Exercise): e is GradedExercise => !['meet', 'spotlight', 'dialogue', 'listen', 'speak'].includes(e.kind);

/* ---------- Hints ---------- */

/** How many hints a question offers: rule out wrong options down to two, or reveal the start of the answer. */
export function hintLimit(ex: GradedExercise): number {
  switch (ex.kind) {
    case 'choose':
    case 'gap':
      return Math.max(0, ex.options.length - 2);
    case 'type':
      return 2;
    case 'build':
      return Math.max(0, Math.min(2, tokenise(ex.accepted[0]).length - 1));
    default:
      return 0;
  }
}

/** The wrong options `hints` hints have ruled out, always in the same order so each hint removes one more. */
export function ruledOut(options: readonly string[], answer: string, hints: number): string[] {
  return options.filter((o) => o !== answer).slice(0, hints);
}

/** The start of each word, the rest hidden: "Dzień dobry" → "D···· d····" after one hint, "Dzi·· dob··" after two. */
export function maskAnswer(answer: string, hints: number): string {
  return answer
    .split(/(\s+)/)
    .map((w) => {
      if (!w.trim()) return w;
      const letters = [...w];
      const show = hints <= 1 ? 1 : Math.max(2, Math.ceil(letters.length / 2));
      return letters.map((c, i) => (i < show || !/\p{L}/u.test(c) ? c : '·')).join('');
    })
    .join('');
}

/** The first `hints` words of a sentence to build. */
export const sentenceStart = (answer: string, hints: number) => tokenise(answer).slice(0, hints).join(' ');

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

let meaningIndex: Map<string, Item[]> | undefined;

/**
 * The Polish of other course words that can mean this English. Many English prompts have more than one right
 * answer ("hello": dzień dobry or cześć; "I read": czytam or czytałam), and a right answer must never be marked
 * wrong just because the lesson had a different word in mind.
 */
export function sameMeaning(en: string, pl: string): string[] {
  if (!meaningIndex) {
    meaningIndex = new Map();
    for (const l of LESSONS)
      if (!l.phonics)
        for (const i of l.items)
          for (const e of new Set(accEn(i).map(normalise))) meaningIndex.set(e, [...(meaningIndex.get(e) ?? []), i]);
  }
  const own = normalise(pl);
  const out = (meaningIndex.get(normalise(en)) ?? []).filter((i) => normalise(i.pl) !== own).flatMap(accPl);
  return [...new Set(out)];
}

const sameText = (a: string) => (b: string) => normalise(a) === normalise(b);

function chooseMeaning(item: Item, pool: string[], audio = false): Exercise {
  // Never offer another right meaning as a wrong option.
  const right = accEn(item);
  const opts = shuffle([item.en, ...distractors(item.en, pool.filter((e) => !right.some(sameText(e))), 3)]);
  return { kind: 'choose', cardId: item.id, prompt: item.pl, promptLang: 'pl', options: opts, answer: item.en, audio, hint: item.hint };
}

function choosePolish(item: Item, pool: string[]): Exercise {
  const right = sameMeaning(item.en, item.pl);
  const opts = shuffle([item.pl, ...distractors(item.pl, pool.filter((p) => !right.some(sameText(p))), 3)]);
  const ex: Exercise = { kind: 'choose', cardId: item.id, prompt: item.en, promptLang: 'en', options: opts, answer: item.pl };
  // A word with a picture is named from the picture, so it attaches to the thing rather than the English.
  return item.img ? { ...ex, image: item.img, instruction: 'What is this in Polish?' } : ex;
}

const PICTURE_OF = new Map(PICTURES.map((p) => [p.pl.toLocaleLowerCase('pl'), p.img]));

/** Lesson words that have a picture flashcard get its picture, on their intro card and when named. */
export function withPictures(items: Item[]): Item[] {
  return items.map((i) => {
    const img = !i.img && !i.ex ? PICTURE_OF.get(i.pl.toLocaleLowerCase('pl')) : undefined;
    return img ? { ...i, img } : i;
  });
}

/**
 * Picture flashcards mixed into a lesson: new pictures are met, then named straight away; known ones are
 * just named. Tagged, so they count as reviews rather than towards the lesson's score.
 */
export function pictureRound(fresh: Picture[], known: Array<{ id: string; reps: number }>): Exercise[][] {
  const quiz = (p: Picture): Exercise => ({ ...(pictureQuiz(p) as Extract<Exercise, { kind: 'choose' }>), tag: 'picture' });
  const meet: Exercise[][] = fresh.length
    ? [[{ kind: 'meet', items: fresh.map((p) => ({ id: p.id, pl: p.pl, en: p.en, g: p.g, img: p.img })) }, ...fresh.map(quiz)]]
    : [];
  const byId = new Map(PICTURES.map((p) => [p.id, p]));
  return [...meet, ...known.flatMap(({ id }) => (byId.has(id) ? [[quiz(byId.get(id)!)]] : []))];
}

/** A picture question with the wrong answers from its own deck. */
function pictureQuiz(p: Picture): Exercise {
  const src = getCard(p.id);
  return pictureChoice(p, src?.kind === 'picture' ? src.deck.pictures.map((x) => x.pl) : PICTURES.map((x) => x.pl));
}

function typePolish(item: Item): Exercise {
  const also = sameMeaning(item.en, item.pl).filter((p) => !accPl(item).some(sameText(p)));
  return { kind: 'type', cardId: item.id, prompt: item.en, accepted: [...accPl(item), ...also], lang: 'pl', hint: item.hint, ...(also.length ? { also } : {}) };
}

/**
 * Lexical chunking in sentence building: a known multi-word phrase ("nie ma sprawy", "czy mogę prosić o")
 * becomes one tile, so learners put sentences together from chunks as fluent speakers do.
 */
export function mergeChunks(tokens: string[], cores: Array<{ core: string[] }> = CHUNK_CORES): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const hit = cores.find(({ core }) => core.every((w, k) => tokens[i + k]?.toLocaleLowerCase('pl') === w));
    const len = hit ? hit.core.length : 1;
    out.push(tokens.slice(i, i + len).join(' '));
    i += len;
  }
  return out;
}

function buildPolish(s: Sentence, wordPool: string[]): Exercise {
  const tokens = mergeChunks(tokenise(s.pl));
  const correct = new Set([s.pl, ...(s.altPl ?? [])].flatMap(tokenise).map(normalise));
  const extra = (s.extra?.length ? s.extra : distractors('', wordPool, 2)).filter((e) => !correct.has(normalise(e)));
  const tiles = shuffle([...tokens, ...extra]);
  return { kind: 'build', cardId: s.id, prompt: s.en, tiles, accepted: accPl(s).filter((a) => buildable(a, tiles)), lang: 'pl' };
}

/**
 * Whether an answer can be put together from these tiles. Other right answers ("My jesteśmy tu." next to the
 * tiles' "tutaj") are left out of a build's answers, so the answer shown after a mistake is always one the
 * learner could have built.
 */
export function buildable(answer: string, tiles: string[]): boolean {
  const left = new Map<string, number>();
  for (const w of tiles.flatMap(tokenise).map(normalise)) left.set(w, (left.get(w) ?? 0) + 1);
  return tokenise(answer)
    .map(normalise)
    .every((w) => {
      const n = left.get(w) ?? 0;
      left.set(w, n - 1);
      return n > 0;
    });
}

function buildFromAudio(s: Sentence, wordPool: string[]): Exercise {
  const ex = buildPolish(s, wordPool) as Extract<Exercise, { kind: 'build' }>;
  return { ...ex, prompt: 'Listen and build what you hear.', audio: s.pl, meaning: s.en };
}

function gapFor(d: Drill): Exercise {
  return { kind: 'gap', cardId: d.id, text: d.text, en: d.en, options: shuffle(d.options), answer: d.answer, why: d.why };
}

/** Write a whole sentence in Polish from its English: the hardest form of a sentence card, for mature reviews. */
function typeSentence(s: Sentence): Exercise {
  return { kind: 'type', cardId: s.id, prompt: s.en, accepted: accPl(s), lang: 'pl' };
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

/** How many new things to meet before practising them. Working memory holds about four new items. */
export const GROUP_SIZE = 3;

/** Split new material into even groups of at most `size`: 8 → 3, 3, 2 rather than 3, 3, 1, 1. */
export function introGroups<T>(xs: readonly T[], size = GROUP_SIZE): T[][] {
  const n = Math.ceil(xs.length / size);
  const out: T[][] = [];
  for (let k = 0, at = 0; k < n; k++) {
    const len = Math.ceil((xs.length - at) / (n - k));
    out.push(xs.slice(at, at + len));
    at += len;
  }
  return out;
}

/**
 * Teach a few things at a time instead of all at once: meet a small group, answer a question on each straight
 * away, then meet the next group. From the second group on, a matching round mixes the new words with ones met
 * earlier, so older words are recalled again before they fade.
 */
export function stepwise(items: Item[], check: (item: Item) => Exercise, pair?: (item: Item) => MatchPair): Exercise[] {
  const out: Exercise[] = [];
  const seen: Item[] = [];
  introGroups(items).forEach((group, k) => {
    out.push({ kind: 'meet', items: group, from: seen.length, total: items.length });
    out.push(...shuffle(group).map(check));
    if (pair && k > 0) {
      const earlier = shuffle(seen).slice(0, Math.max(0, 5 - group.length));
      out.push({ kind: 'match', pairs: shuffle([...group, ...earlier]).map(pair) });
    }
    seen.push(...group);
  });
  return out;
}

const wordPair = (i: Item): MatchPair => ({ cardId: i.id, pl: i.pl, en: i.en });

/* ---------- Speaking ---------- */

/** Hear a word or sentence, then say it back. */
export function sayAfterMe(x: { id: string; pl: string; en: string; altPl?: string[] }): SpeakExercise {
  return { kind: 'speak', cardId: x.id, mode: 'repeat', pl: x.pl, accepted: accPl(x), en: x.en };
}

/** Say the Polish for the English: the hardest kind of recall, out loud. */
export function sayInPolish(x: { id: string; pl: string; en: string; altPl?: string[] }): SpeakExercise {
  const also = sameMeaning(x.en, x.pl);
  return { kind: 'speak', cardId: x.id, mode: 'translate', pl: x.pl, accepted: [...accPl(x), ...also], en: x.en };
}

/** Read a word aloud from its spelling, then hear it. */
export function readAloud(id: string, pl: string, en?: string): SpeakExercise {
  return { kind: 'speak', cardId: id, mode: 'read', pl, accepted: [pl], en };
}

/**
 * Role-play a dialogue: the learner takes one speaker's part and says each of their lines after hearing the
 * line before it. Lines are keyed by position, as dialogue lines have no card of their own.
 */
export function rolePlay(lines: DialogueLine[], lessonId: string, as = 1): SpeakExercise[] {
  const who = [...new Set(lines.map((l) => l.who))][as] ?? lines[0]?.who;
  return lines.flatMap((l, i) =>
    l.who === who
      ? [{ kind: 'speak', cardId: `${lessonId}:line-${i}`, mode: 'reply', pl: l.pl, accepted: [l.pl], en: l.en, cue: lines[i - 1] } satisfies SpeakExercise]
      : [],
  );
}

export interface PlanOptions {
  /** Include speaking exercises (on unless switched off or paused). */
  speaking?: boolean;
}

export interface LessonPlan {
  exercises: Exercise[];
  /** Index of the first exercise after the new material has been introduced and first practised. */
  introEnd: number;
  /** Index where the closing conversation begins: nothing else (retries, revision) belongs after it. */
  outroStart: number;
}

/** Every dialogue line in the course, for wrong replies in "what do you reply?". */
let allLines: DialogueLine[] | undefined;

/**
 * The lesson's conversation, three ways: heard at natural speed with no text, a question or two on what was
 * said (answered from the sound alone), then read along; finally the learner picks their own replies.
 */
export function conversation(lesson: Lesson, rand = Math.random): Exercise[] {
  const d = lesson.dialogue;
  if (!d || d.length < 2) return [];
  const speakers = [...new Set(d.map((l) => l.who))];
  const heard = shuffle(d.map((l, i) => ({ l, i })), rand)
    .filter(({ l }, k, xs) => xs.findIndex((x) => x.l.en === l.en) === k)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i);
  const questions: Exercise[] = heard.map(({ l, i }) => ({
    kind: 'choose',
    cardId: `${lesson.id}:heard-${i}`,
    prompt: l.pl,
    promptLang: 'pl',
    options: shuffle([l.en, ...shuffle(d.filter((x) => x.en !== l.en).map((x) => x.en), rand).slice(0, 2)], rand),
    answer: l.en,
    audio: true,
    instruction: 'From the conversation: what does this mean?',
  }));
  allLines ??= LESSONS.flatMap((x) => x.dialogue ?? []);
  // Wrong replies come from other conversations, leaving out short all-purpose lines ("Tak.", "Dziękuję!") that
  // could fit anywhere.
  const others = allLines.filter((x) => !d.some((y) => y.pl === x.pl) && x.pl.split(/\s+/).length >= 3);
  const mine = d.map((l, i) => ({ l, i })).filter(({ l, i }) => i > 0 && l.who === speakers[1] && d[i - 1].who !== l.who);
  const replies: Exercise[] = shuffle(mine, rand)
    .slice(0, 2)
    .sort((a, b) => a.i - b.i)
    .map(({ l, i }) => ({
      kind: 'choose',
      cardId: `${lesson.id}:reply-${i}`,
      prompt: d[i - 1].pl,
      promptLang: 'pl',
      options: shuffle([l.pl, ...shuffle(others, rand).slice(0, 2).map((x) => x.pl)], rand),
      answer: l.pl,
      optionStyle: 'pl',
      instruction: `Your turn as ${l.who}: what do you reply?`,
      hint: `${d[i - 1].who} said: "${d[i - 1].en}"`,
    }));
  return [{ kind: 'listen', lines: d }, ...questions, { kind: 'dialogue', lines: d }, ...replies];
}

/**
 * Build the sequence for a lesson in small steps: meet a few words and use them at once, group by group;
 * then the grammar spotlight, now that the words it explains are familiar; then listening, recall, sentences
 * and grammar drills, typed answers, and finally the dialogue.
 */
export function lessonPlan(lesson: Lesson, { speaking = true }: PlanOptions = {}): LessonPlan {
  if (lesson.phonics) return phonicsPlan(lesson, speaking);
  const near = nearbyLessons(lesson);
  const enPool = near.flatMap((l) => l.items.map((i) => i.en));
  const plPool = near.flatMap((l) => l.items.map((i) => i.pl));
  const wordPool = near.flatMap((l) => l.sentences.flatMap((s) => tokenise(s.pl)));

  const items = withPictures(lesson.items);
  const intro = stepwise(items, (i) => chooseMeaning(i, enPool), wordPair);
  // A second pass, mixed across the whole lesson: hear it, then find the Polish for the English (or the picture).
  const shuffled = shuffle(items);
  const plain = shuffled.filter((i) => !i.img);
  const mixed = [...plain.slice(0, 2), ...shuffled.filter((i) => i.img), ...plain.slice(2)];
  const listen: Exercise[] = mixed.slice(0, 2).map((i) => chooseMeaning(i, enPool, true));
  const pickPl: Exercise[] = mixed.slice(2, 4).map((i) => choosePolish(i, plPool));
  const produce: Exercise[] = shuffle(lesson.items)
    .sort((a, b) => a.pl.length - b.pl.length)
    .slice(0, 4)
    .map(typePolish);
  const sentences = shuffle(lesson.sentences);
  const builds: Exercise[] = sentences.slice(0, -1).map((s) => buildPolish(s, wordPool));
  const last = sentences[sentences.length - 1];
  const finale: Exercise[] = last ? [Math.random() < 0.5 ? buildFromAudio(last, wordPool) : translateToEnglish(last)] : [];
  const gaps: Exercise[] = lesson.drills.map(gapFor);
  // Speaking: say two of the new words after the voice, say one from its English, and say a sentence already built.
  const spoken = shuffle(lesson.items);
  const repeat: Exercise[] = speaking ? spoken.slice(0, 2).map(sayAfterMe) : [];
  const recall: Exercise[] = speaking ? spoken.slice(2, 3).map(sayInPolish) : [];
  const saySentence: Exercise[] = speaking && builds.length ? [sayAfterMe(sentences[0])] : [];

  // Interleave grammar drills with sentence building so neither arrives as a block.
  const middle: Exercise[] = [];
  const a = [...builds];
  const b = [...gaps];
  while (a.length || b.length) {
    if (a.length) middle.push(a.shift()!);
    if (b.length) middle.push(b.shift()!);
  }

  const outro = conversation(lesson);
  const body: Exercise[] = [
      ...intro,
      ...(lesson.spotlight ? [{ kind: 'spotlight', spotlight: lesson.spotlight } as Exercise] : []),
      ...listen,
      ...repeat,
      ...pickPl,
      ...middle,
      ...saySentence,
      ...produce,
      ...recall,
      ...finale,
  ];
  return { introEnd: intro.length, outroStart: body.length, exercises: [...body, ...outro] };
}

export const lessonExercises = (lesson: Lesson): Exercise[] => lessonPlan(lesson).exercises;

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
    // Harder as the memory grows: tiles first (read, then heard), then understanding it, then writing the whole
    // sentence from the English with no tiles to lean on. Writing from memory is what builds the recall
    // conversation needs, so mature cards come back that way every other time.
    if (reps >= 3) return reps % 2 === 1 ? typeSentence(sentence) : translateToEnglish(sentence);
    if (reps === 2) return translateToEnglish(sentence);
    return reps === 0 ? buildPolish(sentence, pool) : buildFromAudio(sentence, pool);
  }
  if (src.kind === 'picture') return pictureChoice(src.picture, src.deck.pictures.map((p) => p.pl));
  if (src.kind === 'chunk') return chunkExercise(src.chunk, reps);
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
  if (reps >= 2) {
    const also = sameMeaning(w.en, w.pl);
    return { kind: 'type', cardId, prompt: w.en, accepted: [w.pl, ...also], lang: 'pl', hint: w.pos, ...(also.length ? { also } : {}) };
  }
  wordPoolCache ??= LESSONS.flatMap((l) => l.items.map((i) => i.en));
  const opts = shuffle([w.en, ...distractors(w.en, wordPoolCache, 3)]);
  return { kind: 'choose', cardId, prompt: w.pl, promptLang: 'pl', options: opts, answer: w.en, audio: false };
}

/* ---------- Lexical chunks ---------- */

const litHint = (c: Chunk) => (c.lit ? `Word for word it's "${c.lit}", but it means "${c.en}". Learn it as one phrase.` : undefined);

/** "What does this phrase mean?" */
export function chunkMeaning(c: Chunk): Exercise {
  const opts = shuffle([c.en, ...distractors(c.en, CHUNKS.map((x) => x.en), 3)]);
  return { kind: 'choose', cardId: c.id, prompt: c.pl, promptLang: 'pl', options: opts, answer: c.en, instruction: 'What does this phrase mean?', hint: litHint(c) };
}

/** "Complete the phrase": one of its words blanked, with look-alike words from other phrases. */
export function completeChunk(c: Chunk, rand = Math.random): Exercise {
  const words = tokenise(chunkCore(c));
  // Never the capitalised first word: its capital letter would give the answer away.
  const inner = words.map((w, i) => ({ w, i })).filter(({ w, i }) => i > 0 && w.length >= 3);
  const candidates = inner.length ? inner : words.slice(1).map((w, i) => ({ w, i: i + 1 }));
  const { w: answer } = candidates[Math.floor(rand() * candidates.length)] ?? { w: words[0] };
  const pool = CHUNKS.filter((x) => x.id !== c.id).flatMap((x) => tokenise(chunkCore(x)));
  const re = new RegExp(`(^|[\\s„"])${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s,.?!…])`);
  return {
    kind: 'gap',
    cardId: c.id,
    text: c.pl.replace(re, '$1___'),
    en: c.en,
    options: shuffle([answer, ...distractors(answer, pool.filter((w) => w.length >= 3), 2)]),
    answer,
    why: litHint(c),
  };
}

/** Build a sentence around the phrase, with the phrase as a single tile. */
export function buildWithChunk(c: Chunk): Exercise | null {
  if (!c.ex) return null;
  const [pl, en] = c.ex;
  const tiles = mergeChunks(tokenise(pl), [{ core: tokenise(chunkCore(c)).map((w) => w.toLocaleLowerCase('pl')) }, ...CHUNK_CORES]);
  const inSentence = new Set(tokenise(pl).map(normalise));
  const extra = distractors('', CHUNKS.flatMap((x) => (x.ex ? tokenise(x.ex[0]) : [])).filter((w) => !inSentence.has(normalise(w))), 2);
  return { kind: 'build', cardId: c.id, prompt: en, tiles: shuffle([...tiles, ...extra]), accepted: [pl], lang: 'pl' };
}

function typeChunk(c: Chunk): Exercise {
  return { kind: 'type', cardId: c.id, prompt: c.en, accepted: [c.pl, chunkCore(c)], lang: 'pl', hint: litHint(c) };
}

/** Young phrases are recognised, then completed; mature ones are produced whole, typed or built into a sentence. */
export function chunkExercise(c: Chunk, reps: number): Exercise {
  if (reps === 0) return chunkMeaning(c);
  if (reps === 1) return completeChunk(c);
  return (reps % 2 === 0 && buildWithChunk(c)) || typeChunk(c);
}

/**
 * First meeting with a set of phrases: meet a few at a time with their literal meaning and recognise each one,
 * then complete and use them all.
 */
export function chunkLearnSession(chunks: Chunk[]): Exercise[] {
  const items: Item[] = chunks.map((c) => ({ id: c.id, pl: c.pl, en: c.en, hint: c.lit ? `Word for word: "${c.lit}"` : undefined, chunk: true }));
  const byId = new Map(chunks.map((c) => [c.id, c]));
  return [
    ...stepwise(items, (i) => chunkMeaning(byId.get(i.id)!)),
    ...shuffle(chunks).map((c) => completeChunk(c)),
    ...shuffle(chunks).flatMap((c) => buildWithChunk(c) ?? []),
  ];
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
/** Phonics items are spellings ("ch / h", "b → p at the end"): read their example words aloud instead. */
const sayExamples = (item: Item) => (item.ex?.length ? item.ex.join(', ') : undefined);
const phonicsPair = (i: Item): MatchPair => ({ cardId: i.id, pl: i.pl, en: i.en, say: sayExamples(i) });

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
    say: sayExamples(item),
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
    say: sayExamples(item),
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

/** A phonics lesson: meet a few sounds at a time and say what each sounds like, then map spelling ↔ sound, read words and hear words. */
function phonicsPlan(lesson: Lesson, speaking = true): LessonPlan {
  const pool = LESSONS.filter((l) => l.phonics).flatMap((l) => l.items);
  const items = shuffle(lesson.items);
  const hearable = items.filter((i) => (i.ex?.[1] ? soundAlikes(i.ex[1]).length : 0) > 0);
  const intro = stepwise(lesson.items, (i) => soundOf(i, pool), phonicsPair);
  const exercises: Exercise[] = [
    ...intro,
    ...(lesson.spotlight ? [{ kind: 'spotlight', spotlight: lesson.spotlight } as Exercise] : []),
    ...shuffle(items).slice(0, 3).map((i) => spellingOf(i, pool)),
    ...lesson.drills.map(gapFor),
    ...items.map((i) => readWord(i, pool)),
    // Now say them: read two of the example words aloud before hearing them.
    ...(speaking ? items.slice(0, 2).map((i) => readAloud(i.id, i.ex?.[2] ?? firstExample(i))) : []),
    ...hearable.slice(0, 3).map((i) => hearWord(i)),
  ];
  return { introEnd: intro.length, outroStart: exercises.length, exercises };
}

/* ---------- Reinforcement ---------- */

/** Exercises for a set of cards (review, warm-ups, trouble spots, unit revision). */
export function practiceExercises(cards: Array<{ id: string; reps: number }>, speaker?: 'm' | 'f', tag?: ExtraTag): Exercise[] {
  return cards.flatMap(({ id, reps }) => {
    const src = getCard(id);
    if (!src) return [];
    const ex = reviewExercise(src, reps, id, speaker);
    return [tag && 'cardId' in ex ? ({ ...ex, tag } as Exercise) : ex];
  });
}

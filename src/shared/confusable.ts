import { levenshtein, normalise, stripDiacritics } from './grade';
import { respell } from './phonetics';

/**
 * Picking wrong answers that are worth ruling out.
 *
 * A multiple-choice question is only as good as its wrong answers. Three unrelated words can be eliminated by
 * topic alone, so the learner passes without reading the Polish; the schedule then treats the card as stronger
 * than it is. Wrong answers that could really be mistaken for the right one (kot / kod, kawa / kawę,
 * proszę / prosze) force the discrimination that transfers to reading and listening.
 *
 * Confusability is measured on the Polish: spelling distance, how alike the two sound once the reading rules
 * are applied (rz and ż, ó and u, a final d heard as t), and how much of the start and end they share, since
 * Polish words differ from each other mostly in their endings.
 */

const ratio = (a: string, b: string) => {
  const n = Math.max(a.length, b.length);
  return n ? Math.max(0, 1 - levenshtein(a, b) / n) : 0;
};

/**
 * What each word is compared on, worked out once. Building one question weighs the answer against every word
 * the learner knows, so tidying up the text — and above all reading it aloud — is what costs the time.
 */
interface Profile {
  /** Case-folded, punctuation dropped. */
  n: string;
  /** Without its Polish letters, for spelling distance. */
  bare: string;
  /** How it is said, worked out only if it is needed. */
  sound?: string;
}

const profiles = new Map<string, Profile>();

function profileOf(s: string): Profile {
  let p = profiles.get(s);
  if (!p) {
    const n = normalise(s);
    p = { n, bare: stripDiacritics(n) };
    // A course's worth of words and phrases, with room to spare; beyond that, start again rather than grow.
    if (profiles.size > 20_000) profiles.clear();
    profiles.set(s, p);
  }
  return p;
}

const soundOf = (p: Profile) => (p.sound ??= respell(p.n).toLocaleLowerCase('pl'));

/** The form two texts are compared as, so callers can rule out repeats the same way this module does. */
export const comparableKey = (s: string) => profileOf(s).n;

/**
 * Whether two words are close enough to be worth comparing properly. Polish words are built on a stable stem
 * with a changing ending, so anything confusable either starts the same way or ends the same way, and is about
 * as long. Ruling the rest out first keeps a question with a thousand candidates cheap to build.
 */
export function couldConfuse(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 3) return false;
  return a[0] === b[0] || (a.length > 2 && b.length > 2 && a.slice(-2) === b.slice(-2));
}

function sharedPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function sharedSuffix(a: string, b: string): number {
  let i = 0;
  while (i < a.length - 1 && i < b.length - 1 && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return i;
}

/**
 * How easily two Polish words or phrases could be mistaken for each other, from 0 (nothing alike) to 1.
 * The same word scores 0: it is never a wrong answer.
 */
export function confusionScore(a: string, b: string): number {
  const p = profileOf(a);
  const q = profileOf(b);
  if (!p.n || !q.n || p.n === q.n) return 0;
  if (!couldConfuse(p.bare, q.bare)) return 0;
  const n = Math.max(p.bare.length, q.bare.length);
  const orth = ratio(p.bare, q.bare);
  const sound = ratio(soundOf(p), soundOf(q));
  const start = sharedPrefix(p.bare, q.bare) / n;
  const end = sharedSuffix(p.bare, q.bare) / n;
  return 0.4 * orth + 0.25 * sound + 0.2 * start + 0.15 * end;
}

/** The best confusion score between a candidate and any of several targets: for spare tiles in a sentence. */
export const confusionWithAny = (candidate: string, targets: readonly string[]) =>
  targets.reduce((best, t) => Math.max(best, confusionScore(candidate, t)), 0);

/** An index per pool, held against the pool array itself and forgotten with it. */
const indexes = new WeakMap<object, Map<string, unknown[]>>();

/**
 * How many of the hardest candidates to choose between, as a multiple of the number wanted. Sampling from a
 * shortlist rather than taking the top few keeps a question hard without asking the same one every time.
 */
const SHORTLIST = 3;

/** Pools smaller than this are quicker to scan than to file. */
const INDEX_FROM = 48;

/**
 * Candidates worth comparing with `answer` at all, from an index built once per pool.
 *
 * `couldConfuse` rules out all but a handful of a large pool, and building a question shouldn't walk every word
 * the learner knows to discover that. Words are filed under their first letter and their last two, which is
 * exactly what that rule asks about, so the shortlist comes back without touching the rest. What comes back is
 * always a superset of what could score above zero: the length check is left to the measure itself.
 */
function narrow<T>(answer: string, pool: readonly T[], key: (x: T) => string): readonly T[] {
  if (pool.length < INDEX_FROM) return pool;
  let index = indexes.get(pool as unknown as object) as Map<string, T[]> | undefined;
  if (!index) {
    index = new Map();
    for (const x of pool) {
      for (const b of buckets(profileOf(key(x)).bare)) {
        const at = index.get(b);
        if (at) at.push(x);
        else index.set(b, [x]);
      }
    }
    indexes.set(pool as unknown as object, index as Map<string, unknown[]>);
  }
  const out = new Set<T>();
  for (const b of buckets(profileOf(answer).bare)) for (const x of index.get(b) ?? []) out.add(x);
  return [...out];
}

/** Where a word is filed: under its first letter, and under its last two. */
function buckets(bare: string): string[] {
  const out: string[] = [];
  if (bare.length) out.push(`^${bare[0]}`);
  if (bare.length > 2) out.push(`$${bare.slice(-2)}`);
  return out;
}

export interface PickOptions<T> {
  /** The Polish of a candidate, which is what it is compared on. */
  key: (x: T) => string;
  /**
   * Candidates that must not be offered — usually because they would also be right. Given here rather than
   * filtered out beforehand so that the pool stays the same array from call to call, which is what lets its
   * index be built once and kept.
   */
  exclude?: (x: T) => boolean;
  /**
   * What the learner will actually read, when that isn't the text being compared: choosing the meaning of a
   * Polish word compares the Polish but shows the English. Two different Polish words can share one English
   * gloss, so the options have to be kept distinct by what is shown, not by what is compared.
   */
  label?: (x: T) => string;
  /** What the right answer will read as, so it can never be offered back under a different word. */
  answerLabel?: string;
  /** Added to a candidate's score for a reason the text doesn't show: the same gender or part of speech, or a wrong answer this learner has chosen before. */
  bonus?: (x: T) => number;
  /**
   * Whether the bonus can raise a candidate that isn't alike at all, in which case the whole pool has to be
   * weighed rather than the words the index offers. True for a wrong answer this learner picked before, which
   * may be nothing like the right one; false for a nudge (same gender) towards candidates already in the running.
   */
  bonusWidens?: boolean;
  /** How alike the answer and a candidate are. Defaults to `confusionScore`. */
  score?: (answer: string, candidate: string) => number;
  rand?: () => number;
}

/**
 * The `n` most confusable candidates from `pool`, sampled from a shortlist of the hardest so that the same
 * question isn't asked twice running. Anything matching the answer, or repeating another candidate, is left out.
 * Returns fewer than `n` only when the pool holds fewer usable candidates.
 */
export function hardDistractors<T>(answer: string, pool: readonly T[], n: number, o: PickOptions<T>): T[] {
  if (n <= 0) return [];
  const { key, exclude, label, answerLabel, bonus, bonusWidens = false, score = confusionScore, rand = Math.random } = o;
  const seen = new Set([comparableKey(answer)]);
  const shown = new Set(answerLabel === undefined ? [] : [comparableKey(answerLabel)]);
  const scored: Array<{ x: T; s: number }> = [];
  // Only the default measure lets the index shortlist candidates: another one (word overlap between lines of a
  // conversation) asks a different question, and a bonus can raise a candidate the index would never offer.
  const considered = score === confusionScore && !(bonus && bonusWidens) ? narrow(answer, pool, key) : pool;
  for (const x of considered) {
    if (exclude?.(x)) continue;
    const text = key(x);
    const k = comparableKey(text);
    if (!k || seen.has(k)) continue;
    if (label) {
      const l = comparableKey(label(x));
      if (!l || shown.has(l)) continue;
      shown.add(l);
    }
    seen.add(k);
    scored.push({ x, s: score(answer, text) + (bonus?.(x) ?? 0) });
  }
  if (scored.length <= n) return scored.map(({ x }) => x);
  // Shuffled before sorting, so that when nothing is especially confusable the choice is still a fresh one and
  // not always the first few of the pool. Sorting is stable, so equal scores keep the shuffled order.
  for (let i = scored.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [scored[i], scored[j]] = [scored[j], scored[i]];
  }
  scored.sort((a, b) => b.s - a.s);
  // Once there are enough candidates with something in common with the answer, only those are ever offered:
  // sampling among them keeps questions fresh, but it must never let through an option that gives itself away.
  const alike = scored.filter((c) => c.s > 0);
  const base = alike.length >= n ? alike : scored;
  const shortlist = base.slice(0, Math.max(n + 2, n * SHORTLIST));
  // Efraimidis–Spirakis weighted sampling, as used for revision: the hardest are likeliest, none is certain.
  return shortlist
    .map(({ x, s }) => ({ x, k: Math.pow(rand(), 1 / Math.max(0.05, s)) }))
    .sort((a, b) => b.k - a.k)
    .slice(0, n)
    .map(({ x }) => x);
}

const wordSets = new Map<string, Set<string>>();

function wordsOf(s: string): Set<string> {
  let w = wordSets.get(s);
  if (!w) {
    w = new Set(comparableKey(s).split(' ').filter(Boolean));
    if (wordSets.size > 20_000) wordSets.clear();
    wordSets.set(s, w);
  }
  return w;
}

/** How much two short texts overlap word for word, from 0 to 1: for telling apart lines of a conversation. */
export function overlap(a: string, b: string): number {
  const x = wordsOf(a);
  const y = wordsOf(b);
  if (!x.size || !y.size) return 0;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return shared / Math.min(x.size, y.size);
}

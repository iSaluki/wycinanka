import { levenshtein, normalise, stripDiacritics } from './grade';
import { numberToWords } from './numbers';

/**
 * Scoring for speaking practice: how closely what a speech recogniser heard matches what the learner was
 * asked to say. Recognisers write what they think was said, so a learner's accent turns into the nearest
 * real word rather than a misspelling. Scoring therefore works word by word and is forgiving of small
 * differences (a lost accent, one letter), while a missing or different word counts against the attempt.
 */

export type WordState = 'ok' | 'close' | 'miss';

export interface SpeechScore {
  pass: boolean;
  /** 0–1: the share of the expected words that were heard, with near misses counting partly. */
  score: number;
  /** The accepted answer the attempt was closest to, as written in the course. */
  expected: string;
  /** What the recogniser heard (its best guess that matched most closely). */
  heard: string;
  /** Each word of `expected` as written, with how well it was heard. */
  words: Array<{ text: string; state: WordState }>;
}

/** The share of words that has to be heard for an attempt to pass. */
export const PASS_SCORE = 0.75;

/** Numbers a recogniser writes as digits ("5 kotów") are compared as words. */
function spellDigits(word: string): string[] {
  if (!/^\d{1,6}$/.test(word)) return [word];
  return numberToWords(Number(word)).split(' ');
}

/** Forms of a number that change only for gender, heard as the same word. */
const SAME_NUMBER: Record<string, string> = { jedna: 'jeden', jedno: 'jeden', dwie: 'dwa', obie: 'oba' };
const baseForm = (w: string) => SAME_NUMBER[w] ?? w;

export const speechWords = (s: string): string[] => normalise(s).split(' ').filter(Boolean).flatMap(spellDigits);

/** 1 for the same word; less for the same word without its Polish letters or one letter out; 0 otherwise. */
export function wordSimilarity(expected: string, heard: string): number {
  if (baseForm(expected) === baseForm(heard)) return 1;
  const e = stripDiacritics(expected);
  const h = stripDiacritics(heard);
  if (e === h) return 0.8;
  // Short words are too easily confused (kot / kod) for one letter to be forgiven.
  if (e.length >= 4 && levenshtein(e, h) <= 1) return 0.6;
  return 0;
}

const stateOf = (sim: number): WordState => (sim === 1 ? 'ok' : sim > 0 ? 'close' : 'miss');

/**
 * Line up expected and heard words (an alignment that keeps their order and makes the most matches), and
 * return how well each expected word was heard. Extra words in what was heard don't count against it:
 * recognisers often add a filler word or split one word into two.
 */
export function alignWords(expected: string[], heard: string[]): number[] {
  const n = expected.length;
  const m = heard.length;
  const best: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      best[i][j] = Math.max(best[i + 1][j], best[i][j + 1], wordSimilarity(expected[i], heard[j]) + best[i + 1][j + 1]);
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < n) {
    const sim = j < m ? wordSimilarity(expected[i], heard[j]) : 0;
    if (j < m && sim > 0 && best[i][j] === sim + best[i + 1][j + 1]) {
      out.push(sim);
      i++;
      j++;
    } else if (j < m && best[i][j] === best[i][j + 1]) {
      j++;
    } else {
      out.push(0);
      i++;
    }
  }
  return out;
}

function scoreOne(expected: string, heard: string): SpeechScore {
  const tokens = expected.split(/\s+/).filter((t) => speechWords(t).length > 0);
  const perToken = tokens.map((t) => speechWords(t));
  const sims = alignWords(perToken.flat(), speechWords(heard));
  let k = 0;
  const words = tokens.map((text, t) => {
    const part = sims.slice(k, (k += perToken[t].length));
    return { text, state: stateOf(Math.min(...part)) };
  });
  const score = sims.length ? sims.reduce((a, b) => a + b, 0) / sims.length : 0;
  // A single word has to be heard as that word, or nearly: one word can't be "mostly" right.
  const pass = score >= PASS_SCORE && (sims.length > 1 || sims[0] >= 0.8);
  return { pass, score, expected, heard, words };
}

/**
 * Score an attempt: the recogniser's guesses (best first) against every accepted way of saying it.
 * Returns the closest pairing; a pass on any guess counts.
 */
export function scoreSpeech(heard: readonly string[], accepted: readonly string[]): SpeechScore {
  if (!accepted.length) throw new Error('scoreSpeech: nothing to compare with');
  let best: SpeechScore | null = null;
  for (const a of accepted)
    for (const h of heard.length ? heard : ['']) {
      const s = scoreOne(a, h);
      if (!best || Number(s.pass) - Number(best.pass) > 0 || (s.pass === best.pass && s.score > best.score)) best = s;
    }
  return best!;
}

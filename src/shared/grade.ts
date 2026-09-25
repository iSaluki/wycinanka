/**
 * Answer grading for typed answers.
 *
 * Distinguishes a wrong answer from the right word with missing Polish letters
 * (common on UK keyboards), a one-letter slip, and the right word with the wrong ending (a grammar
 * mistake, never forgiven as a slip), so feedback can name the problem.
 */

/** 'form': the right word with the wrong ending (case, person, gender), which is a grammar mistake. */
export type Verdict = 'correct' | 'accent' | 'typo' | 'form' | 'wrong';

export interface GradeResult {
  verdict: Verdict;
  /** The accepted answer closest to what was typed (display form). */
  expected: string;
  /** For 'accent': the Polish letters that were typed without their marks, e.g. [['ł','l']]. */
  accents: Array<[string, string]>;
  /** For 'form': each word typed in another form, with the form expected. */
  endings: Array<[typed: string, expected: string]>;
}

const DIACRITIC_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

export const POLISH_LETTERS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'] as const;

const PUNCT = /[.,!?;:¿¡"„”“«»()…–—-]/g;

/** Case-fold, unify quotes/spaces and strip punctuation. Keeps diacritics. */
export function normalise(s: string): string {
  return s
    .normalize('NFC')
    .toLocaleLowerCase('pl')
    .replace(/[’‘`´]/g, "'")
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripDiacritics(s: string): string {
  return s.replace(/[ąćęłńóśźż]/g, (c) => DIACRITIC_MAP[c] ?? c);
}

/** English answers ignore articles and a few contractions. */
function normaliseEnglish(s: string): string {
  return normalise(s)
    .replace(/\b(the|a|an)\b/g, ' ')
    .replace(/\b(i'm)\b/g, 'i am')
    .replace(/\b(it's)\b/g, 'it is')
    .replace(/\b(you're)\b/g, 'you are')
    .replace(/\b(don't)\b/g, 'do not')
    .replace(/\b(isn't)\b/g, 'is not')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function accentPairs(expected: string, typed: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (let i = 0; i < expected.length && i < typed.length; i++) {
    const e = expected[i];
    const t = typed[i];
    if (e !== t && DIACRITIC_MAP[e] === t && !seen.has(e)) {
      seen.add(e);
      out.push([e, t]);
    }
  }
  return out;
}

/** Words are the same up to their last few letters: the typed word is another form of the expected one. */
function endingOnly(typed: string, expected: string, minStem: number): boolean {
  let p = 0;
  while (p < typed.length && p < expected.length && typed[p] === expected[p]) p++;
  return p >= minStem && expected.length - p <= 2 && typed.length - p <= 3;
}

const FINAL_VOWELS = /^[aąeęioóuy]$/;

interface Analysis {
  answer: { display: string; n: string };
  /** Words given in another form: wrong case, person or gender ending. */
  endings: Array<[typed: string, expected: string]>;
  accents: Array<[string, string]>;
  /** Remaining spelling distance, ignoring Polish letters. */
  dist: number;
}

/**
 * Compares a typed Polish answer with one accepted answer word by word. An ending that differs is a grammar
 * mistake (kawa for kawę, koty for kota), not a slip of the finger, so it is never forgiven as a typo. With a
 * `known` word list, an ending only counts as a grammar mistake when the typed word is itself a real form, so a
 * real typo at the end of a word (mieszkm) is still just a typo. The same goes for missing Polish letters that
 * turn one form into another (mama for mamą, pracuje for pracuję).
 */
function analysePolish(typed: string, answer: { display: string; n: string }, known?: (w: string) => boolean): Analysis {
  const tw = typed.split(' ');
  const ew = answer.n.split(' ');
  const out: Analysis = { answer, endings: [], accents: [], dist: 0 };
  if (tw.length !== ew.length) {
    out.dist = levenshtein(stripDiacritics(answer.n), stripDiacritics(typed));
    return out;
  }
  for (let i = 0; i < tw.length; i++) {
    const t = tw[i];
    const e = ew[i];
    if (t === e) continue;
    // Swapping only the final vowel (psy for psa, kawy for kawę) is always an ending, whatever the word list says.
    const vowelSwap = t.length === e.length && t.slice(0, -1) === e.slice(0, -1) && FINAL_VOWELS.test(t.slice(-1)) && FINAL_VOWELS.test(e.slice(-1));
    const isForm = vowelSwap || (known ? known(t) : true);
    if (stripDiacritics(t) === stripDiacritics(e)) {
      if (known?.(t)) out.endings.push([t, e]);
      else out.accents.push(...accentPairs(e, t).filter(([a]) => !out.accents.some(([b]) => a === b)));
      continue;
    }
    // A known real form may have a short stem (psy / psa); without a word list, ask for a longer one.
    if (isForm && endingOnly(stripDiacritics(t), stripDiacritics(e), known ? 2 : 3)) {
      out.endings.push([t, e]);
      continue;
    }
    out.dist += levenshtein(stripDiacritics(e), stripDiacritics(t));
  }
  return out;
}

/**
 * Grade a typed answer against one or more accepted answers.
 * `lang` decides the normalisation: Polish keeps diacritics significant, English ignores articles.
 * `known`, for Polish, says whether a word is a real Polish form (see analysePolish).
 */
export function grade(input: string, accepted: readonly string[], lang: 'pl' | 'en', known?: (word: string) => boolean): GradeResult {
  if (accepted.length === 0) throw new Error('grade: no accepted answers');
  const norm = lang === 'en' ? normaliseEnglish : normalise;
  const typed = norm(input);
  const answers = accepted.map((a) => ({ display: a, n: norm(a) }));

  const exact = answers.find((a) => a.n === typed);
  if (exact) return { verdict: 'correct', expected: exact.display, accents: [], endings: [] };
  if (!typed) return { verdict: 'wrong', expected: answers[0].display, accents: [], endings: [] };

  // One slip is forgiven in longer answers (two in long sentences), but never in short words
  // where a single letter changes the meaning (kot / kod).
  const allowance = (n: string) => (n.length >= 20 ? 2 : n.length >= 6 ? 1 : 0);

  if (lang === 'pl') {
    const all = answers.map((a) => analysePolish(typed, a, known));
    const accent = all.find((a) => !a.endings.length && !a.dist && a.accents.length);
    if (accent) return { verdict: 'accent', expected: accent.answer.display, accents: accent.accents, endings: [] };
    const typo = all.find((a) => !a.endings.length && a.dist <= allowance(a.answer.n));
    if (typo) return { verdict: 'typo', expected: typo.answer.display, accents: [], endings: [] };
    const form = all
      .filter((a) => a.endings.length && a.dist <= allowance(a.answer.n))
      .sort((a, b) => a.endings.length - b.endings.length)[0];
    if (form) return { verdict: 'form', expected: form.answer.display, accents: [], endings: form.endings };
    const best = [...all].sort((a, b) => a.dist + 2 * a.endings.length - (b.dist + 2 * b.endings.length))[0];
    return { verdict: 'wrong', expected: best.answer.display, accents: [], endings: [] };
  }

  let best = answers[0];
  let bestDist = Infinity;
  for (const a of answers) {
    const d = levenshtein(a.n, typed);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  if (bestDist <= allowance(best.n)) return { verdict: 'typo', expected: best.display, accents: [], endings: [] };
  return { verdict: 'wrong', expected: best.display, accents: [], endings: [] };
}

/** Whether a verdict counts as a pass in a lesson. */
export const passes = (v: Verdict) => v !== 'wrong' && v !== 'form';

/**
 * Answer grading for typed answers.
 *
 * Distinguishes a wrong answer from the right word with missing Polish letters
 * (common on UK keyboards) or a one-letter slip, so feedback can name the problem.
 */

export type Verdict = 'correct' | 'accent' | 'typo' | 'wrong';

export interface GradeResult {
  verdict: Verdict;
  /** The accepted answer closest to what was typed (display form). */
  expected: string;
  /** For 'accent': the Polish letters that were typed without their marks, e.g. [['ł','l']]. */
  accents: Array<[string, string]>;
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

/**
 * Grade a typed answer against one or more accepted answers.
 * `lang` decides the normalisation: Polish keeps diacritics significant, English ignores articles.
 */
export function grade(input: string, accepted: readonly string[], lang: 'pl' | 'en'): GradeResult {
  if (accepted.length === 0) throw new Error('grade: no accepted answers');
  const norm = lang === 'en' ? normaliseEnglish : normalise;
  const typed = norm(input);
  const answers = accepted.map((a) => ({ display: a, n: norm(a) }));

  const exact = answers.find((a) => a.n === typed);
  if (exact) return { verdict: 'correct', expected: exact.display, accents: [] };
  if (!typed) return { verdict: 'wrong', expected: answers[0].display, accents: [] };

  if (lang === 'pl') {
    const bare = stripDiacritics(typed);
    const accent = answers.find((a) => stripDiacritics(a.n) === bare);
    if (accent) return { verdict: 'accent', expected: accent.display, accents: accentPairs(accent.n, typed) };
  }

  // One slip is forgiven in longer answers (two in long sentences), but never in short words
  // where a single letter changes the meaning (kot / kod).
  let best = answers[0];
  let bestDist = Infinity;
  for (const a of answers) {
    const d = levenshtein(lang === 'pl' ? stripDiacritics(a.n) : a.n, lang === 'pl' ? stripDiacritics(typed) : typed);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  const allowance = best.n.length >= 20 ? 2 : best.n.length >= 6 ? 1 : 0;
  if (bestDist <= allowance) return { verdict: 'typo', expected: best.display, accents: [] };
  return { verdict: 'wrong', expected: best.display, accents: [] };
}

/** Whether a verdict counts as a pass in a lesson. */
export const passes = (v: Verdict) => v !== 'wrong';

/**
 * Polish pronunciation engine: spelling → sounds → an English-friendly respelling.
 *
 * Polish spelling is regular enough to convert with rules: multi-letter graphemes, softening by
 * "i", nasal vowels that change with the next consonant, voicing assimilation (including final
 * devoicing), and stress on the second-to-last syllable. Used by the pronouncer tool and the
 * phonics lessons. Aimed at learners: it gives standard pronunciation, not every regional variant.
 */

export interface Phone {
  /** Letters this sound comes from, as written. */
  spelling: string;
  ipa: string;
  /** English-friendly respelling of this sound. */
  say: string;
  vowel: boolean;
  /** Alveolo-palatal "soft" sound with no English equivalent (ś ć ź dź ń). */
  soft?: boolean;
  /** Sound changed by a rule (devoicing, nasal before a consonant…), with a short explanation. */
  rule?: string;
}

export interface Syllable {
  phones: Phone[];
  stressed: boolean;
}

export interface WordReading {
  word: string;
  syllables: Syllable[];
  /** e.g. "SHCHEN-shcheh" — stressed syllable in capitals. */
  respelling: string;
  ipa: string;
}

interface Consonant {
  ipa: string;
  say: string;
  soft?: boolean;
  /** Voicing pair for assimilation. */
  voiced?: boolean;
  pair?: string;
  sonorant?: boolean;
}

// Consonant sounds keyed by a canonical spelling.
const C: Record<string, Consonant> = {
  b: { ipa: 'b', say: 'b', voiced: true, pair: 'p' },
  p: { ipa: 'p', say: 'p', voiced: false, pair: 'b' },
  d: { ipa: 'd', say: 'd', voiced: true, pair: 't' },
  t: { ipa: 't', say: 't', voiced: false, pair: 'd' },
  g: { ipa: 'ɡ', say: 'g', voiced: true, pair: 'k' },
  k: { ipa: 'k', say: 'k', voiced: false, pair: 'g' },
  w: { ipa: 'v', say: 'v', voiced: true, pair: 'f' },
  f: { ipa: 'f', say: 'f', voiced: false, pair: 'w' },
  z: { ipa: 'z', say: 'z', voiced: true, pair: 's' },
  s: { ipa: 's', say: 's', voiced: false, pair: 'z' },
  ż: { ipa: 'ʐ', say: 'zh', voiced: true, pair: 'sz' },
  sz: { ipa: 'ʂ', say: 'sh', voiced: false, pair: 'ż' },
  ź: { ipa: 'ʑ', say: 'zh', soft: true, voiced: true, pair: 'ś' },
  ś: { ipa: 'ɕ', say: 'sh', soft: true, voiced: false, pair: 'ź' },
  dz: { ipa: 'd͡z', say: 'dz', voiced: true, pair: 'c' },
  c: { ipa: 't͡s', say: 'ts', voiced: false, pair: 'dz' },
  dż: { ipa: 'd͡ʐ', say: 'j', voiced: true, pair: 'cz' },
  cz: { ipa: 't͡ʂ', say: 'ch', voiced: false, pair: 'dż' },
  dź: { ipa: 'd͡ʑ', say: 'j', soft: true, voiced: true, pair: 'ć' },
  ć: { ipa: 't͡ɕ', say: 'ch', soft: true, voiced: false, pair: 'dź' },
  ch: { ipa: 'x', say: 'kh', voiced: false },
  m: { ipa: 'm', say: 'm', sonorant: true },
  n: { ipa: 'n', say: 'n', sonorant: true },
  ń: { ipa: 'ɲ', say: 'ny', soft: true, sonorant: true },
  l: { ipa: 'l', say: 'l', sonorant: true },
  ł: { ipa: 'w', say: 'w', sonorant: true },
  r: { ipa: 'r', say: 'r', sonorant: true },
  j: { ipa: 'j', say: 'y', sonorant: true },
};

const VOWELS: Record<string, { ipa: string; say: string }> = {
  a: { ipa: 'a', say: 'a' },
  e: { ipa: 'ɛ', say: 'e' },
  i: { ipa: 'i', say: 'ee' },
  o: { ipa: 'ɔ', say: 'o' },
  u: { ipa: 'u', say: 'oo' },
  ó: { ipa: 'u', say: 'oo' },
  y: { ipa: 'ɨ', say: 'i' },
  ą: { ipa: 'ɔ̃', say: 'on' },
  ę: { ipa: 'ɛ̃', say: 'en' },
};

// What a letter becomes before a softening "i".
const SOFTENS: Record<string, string> = { s: 'ś', z: 'ź', c: 'ć', dz: 'dź', n: 'ń' };
// Letters that are only palatalised (b → bʲ) before "i".
const PALATALISABLE = new Set(['b', 'p', 'm', 'w', 'f', 'k', 'g', 'ch', 'l']);

const MULTI = ['dż', 'dź', 'dz', 'ch', 'cz', 'rz', 'sz'];
const isVowelLetter = (ch: string) => ch in VOWELS;

interface Token {
  spelling: string;
  key: string; // canonical key into C or VOWELS
  vowel: boolean;
  palatal?: boolean;
}

/** Split a lowercase word into grapheme tokens, applying "i" softening. */
function tokenize(word: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < word.length) {
    const ch = word[i];
    if (isVowelLetter(ch)) {
      out.push({ spelling: ch, key: ch, vowel: true });
      i++;
      continue;
    }
    const g = MULTI.find((m) => word.startsWith(m, i)) ?? ch;
    let key = g === 'rz' ? 'ż' : g === 'h' ? 'ch' : g;
    i += g.length;

    if (word[i] === 'i' && (SOFTENS[key] || PALATALISABLE.has(key))) {
      // Before another vowel the "i" only softens the consonant and is not pronounced itself.
      const silent = i + 1 < word.length && isVowelLetter(word[i + 1]);
      if (SOFTENS[key]) {
        out.push({ spelling: g + (silent ? 'i' : ''), key: SOFTENS[key], vowel: false });
      } else {
        out.push({ spelling: g + (silent ? 'i' : ''), key, vowel: false, palatal: silent });
      }
      if (silent) i++;
      continue;
    }

    if (!(key in C)) {
      // Letters outside native Polish spelling (q, v, x) or stray symbols.
      if (key === 'v') key = 'w';
      else if (key === 'q') key = 'k';
      else if (key === 'x') {
        out.push({ spelling: 'x', key: 'k', vowel: false }, { spelling: '', key: 's', vowel: false });
        continue;
      } else continue;
    }
    out.push({ spelling: g, key, vowel: false });
  }
  return out;
}

const OBSTRUENT = (k: string) => C[k]?.pair !== undefined || k === 'ch';

/** Voicing assimilation and final devoicing, applied right to left. */
function assimilate(tokens: Token[]): Array<Token & { rule?: string }> {
  const t = tokens.map((x) => ({ ...x })) as Array<Token & { rule?: string }>;
  const voiceless = (k: string) => (C[k] ? C[k].voiced === false || k === 'ch' : false);
  for (let i = t.length - 1; i >= 0; i--) {
    const tok = t[i];
    if (tok.vowel || !OBSTRUENT(tok.key)) continue;
    const next = t[i + 1];
    const c = C[tok.key];
    if (!next && c.voiced && c.pair) {
      tok.key = c.pair;
      tok.rule = 'At the end of a word this sound loses its voice.';
    } else if (next && !next.vowel && OBSTRUENT(next.key)) {
      if (voiceless(next.key) && c.voiced && c.pair) {
        tok.key = c.pair;
        tok.rule = 'Loses its voice before a voiceless consonant.';
      } else if (!voiceless(next.key) && c.voiced === false && c.pair && next.key !== 'w' && next.key !== 'ż') {
        tok.key = c.pair;
        tok.rule = 'Becomes voiced before a voiced consonant.';
      }
    }
  }
  // Progressive: w and rz after a voiceless consonant are devoiced (twój → tfuj, przez → pshes).
  for (let i = 1; i < t.length; i++) {
    const prev = t[i - 1];
    const tok = t[i];
    if (tok.vowel || prev.vowel) continue;
    if ((tok.key === 'w' || (tok.key === 'ż' && tok.spelling === 'rz')) && voiceless(prev.key)) {
      tok.key = C[tok.key].pair!;
      tok.rule = `After a voiceless consonant, ${tok.spelling} is said without voice.`;
    }
  }
  return t;
}

function nasal(vowel: 'ą' | 'ę', next: string | undefined, isLast: boolean): Phone {
  const base = vowel === 'ą' ? { ipa: 'ɔ', say: 'o' } : { ipa: 'ɛ', say: 'e' };
  const spelling = vowel;
  if (isLast) {
    return vowel === 'ę'
      ? { spelling, ipa: 'ɛ', say: 'e', vowel: true, rule: 'At the end of a word, ę is usually said as a plain e.' }
      : { spelling, ipa: 'ɔ̃', say: 'on', vowel: true, rule: 'Nasal: let air through your nose, as in French "bon".' };
  }
  if (next && ['p', 'b'].includes(next)) return { spelling, ipa: `${base.ipa}m`, say: `${base.say}m`, vowel: true, rule: 'Before p or b it sounds like "-om/-em".' };
  if (next && ['t', 'd', 'c', 'dz', 'cz', 'dż'].includes(next))
    return { spelling, ipa: `${base.ipa}n`, say: `${base.say}n`, vowel: true, rule: 'Before t, d or c it sounds like "-on/-en".' };
  if (next && ['ć', 'dź'].includes(next)) return { spelling, ipa: `${base.ipa}ɲ`, say: `${base.say}n`, vowel: true, rule: 'Before ć or dź it sounds like a soft "-on/-en".' };
  if (next && ['k', 'g'].includes(next)) return { spelling, ipa: `${base.ipa}ŋ`, say: `${base.say}ng`, vowel: true, rule: 'Before k or g it sounds like "-ong/-eng".' };
  if (next && ['l', 'ł'].includes(next)) return { spelling, ipa: base.ipa, say: base.say, vowel: true, rule: 'Before l or ł the nasal sound disappears.' };
  return { spelling, ipa: vowel === 'ą' ? 'ɔ̃' : 'ɛ̃', say: vowel === 'ą' ? 'on' : 'en', vowel: true, rule: 'Nasal vowel: let air through your nose.' };
}

function toPhones(word: string): Phone[] {
  const tokens = assimilate(tokenize(word));
  return tokens.map((t, i) => {
    if (t.vowel) {
      if (t.key === 'ą' || t.key === 'ę') {
        const next = tokens.slice(i + 1).find(() => true);
        return nasal(t.key, next && !next.vowel ? next.key : undefined, i === tokens.length - 1);
      }
      const v = VOWELS[t.key];
      return { spelling: t.spelling, ipa: v.ipa, say: v.say, vowel: true };
    }
    const c = C[t.key];
    const beforeVowel = tokens[i + 1]?.vowel ?? false;
    // A soft n not followed by a vowel has no "y" glide: dzień is "jen'", not "jenny".
    const say = t.key === 'ń' && !beforeVowel ? "n'" : c.say + (t.palatal ? 'y' : '');
    const phone: Phone = { spelling: t.spelling, ipa: c.ipa + (t.palatal ? 'ʲ' : ''), say, vowel: false, soft: c.soft };
    if (t.rule) phone.rule = t.rule;
    return phone;
  });
}

const SONORANT_SAY = new Set(['m', 'n', 'ny', 'l', 'w', 'r', 'y']);

function syllabify(phones: Phone[]): Syllable[] {
  const nuclei = phones.map((p, i) => (p.vowel ? i : -1)).filter((i) => i >= 0);
  if (nuclei.length === 0) return [{ phones, stressed: true }];
  const bounds: number[] = [0];
  for (let k = 1; k < nuclei.length; k++) {
    const prevV = nuclei[k - 1];
    const nextV = nuclei[k];
    const between = nextV - prevV - 1;
    let start = prevV + 1; // a single consonant starts the next syllable
    if (between >= 2) {
      const first = phones[prevV + 1];
      const second = phones[prevV + 2];
      // Keep good onsets together (pr, kł, st, szk); otherwise the first consonant closes the syllable
      // before it (Pol-ska, dziec-ko), which is also easier to read in the respelling.
      const liquidNext = ['r', 'l', 'w'].includes(second.ipa) || second.spelling === 'rz';
      const sibilantFirst = ['s', 'z', 'ɕ', 'ʑ', 'ʂ', 'ʐ'].includes(first.ipa);
      const firstIsSonorant = SONORANT_SAY.has(first.say) || first.ipa === 'j';
      if (firstIsSonorant || !(liquidNext || sibilantFirst)) start = prevV + 2;
    }
    bounds.push(start);
  }
  const syls: Syllable[] = bounds.map((b, k) => ({ phones: phones.slice(b, bounds[k + 1] ?? phones.length), stressed: false }));
  const stressIdx = syls.length === 1 ? 0 : syls.length - 2;
  syls[stressIdx].stressed = true;
  return syls;
}

function readWord(word: string): WordReading {
  const lower = word.toLocaleLowerCase('pl');
  const syllables = syllabify(toPhones(lower));
  const respelling = syllables
    .map((s) => {
      const txt = s.phones.map((p) => p.say).join('');
      return s.stressed && syllables.length > 1 ? txt.toUpperCase() : txt;
    })
    .join('-');
  const ipa = syllables
    .map((s) => (s.stressed && syllables.length > 1 ? 'ˈ' : '') + s.phones.map((p) => p.ipa).join(''))
    .join('.');
  return { word, syllables, respelling, ipa };
}

/** Read a phrase aloud, word by word. */
export function pronounce(text: string): WordReading[] {
  return text
    .normalize('NFC')
    .split(/[^a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻqvxQVX]+/)
    .filter(Boolean)
    .map(readWord);
}

export const respell = (text: string) => pronounce(text).map((w) => w.respelling).join(' ');

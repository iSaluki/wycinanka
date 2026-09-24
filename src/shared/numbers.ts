/** Polish numbers, prices and clock times, spelt out in words. */

const ONES = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const TEENS = [
  'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście',
  'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście',
];
const TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];

export type Gender = 'm' | 'f' | 'n';

/** Which noun form follows a number: 1 → one, 2–4 (not 12–14) → few, otherwise many. */
export function pluralForm(n: number): 'one' | 'few' | 'many' {
  const abs = Math.abs(Math.trunc(n));
  if (abs === 1) return 'one';
  const last = abs % 10;
  const lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'few';
  return 'many';
}

export function agree(n: number, forms: { one: string; few: string; many: string }): string {
  return forms[pluralForm(n)];
}

/** 0–999, with the gender of "one" and "two" set by the noun that follows (jedna kawa, dwie kawy). */
function below1000(n: number, gender: Gender): string[] {
  const words: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) words.push(HUNDREDS[h]);
  if (rest >= 10 && rest < 20) words.push(TEENS[rest - 10]);
  else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) words.push(TENS[t]);
    if (o) {
      // Only a bare "one" agrees in gender; in compounds (21, 101) it stays "jeden".
      if (o === 1 && n === 1) words.push(gender === 'f' ? 'jedna' : gender === 'n' ? 'jedno' : 'jeden');
      else if (o === 2 && gender === 'f') words.push('dwie');
      else words.push(ONES[o]);
    }
  }
  return words;
}

/** Spell out an integer from 0 to 999,999. */
export function numberToWords(n: number, gender: Gender = 'm'): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new RangeError('Supported range is 0 to 999,999');
  if (n === 0) return 'zero';
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const words: string[] = [];
  if (thousands === 1) words.push('tysiąc');
  else if (thousands > 1) {
    words.push(...below1000(thousands, 'm'), agree(thousands, { one: 'tysiąc', few: 'tysiące', many: 'tysięcy' }));
  }
  if (rest) words.push(...below1000(rest, gender));
  return words.join(' ');
}

const ZLOTY = { one: 'złoty', few: 'złote', many: 'złotych' };
const GROSZ = { one: 'grosz', few: 'grosze', many: 'groszy' };

/** e.g. 12.50 → "dwanaście złotych pięćdziesiąt groszy". */
export function priceToWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0 || amount >= 1_000_000) throw new RangeError('Supported range is 0 to 999,999.99');
  const totalGrosze = Math.round(amount * 100);
  const zl = Math.floor(totalGrosze / 100);
  const gr = totalGrosze % 100;
  const parts: string[] = [];
  if (zl || !gr) parts.push(`${numberToWords(zl)} ${agree(zl, ZLOTY)}`);
  if (gr) parts.push(`${numberToWords(gr)} ${agree(gr, GROSZ)}`);
  return parts.join(' ');
}

// Hours are feminine ordinals, agreeing with "godzina".
const HOUR_NOM = [
  'dwunasta', 'pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta', 'szósta', 'siódma', 'ósma', 'dziewiąta', 'dziesiąta', 'jedenasta', 'dwunasta',
  'trzynasta', 'czternasta', 'piętnasta', 'szesnasta', 'siedemnasta', 'osiemnasta', 'dziewiętnasta', 'dwudziesta',
  'dwudziesta pierwsza', 'dwudziesta druga', 'dwudziesta trzecia',
];
const HOUR_LOC = [
  'dwunastej', 'pierwszej', 'drugiej', 'trzeciej', 'czwartej', 'piątej', 'szóstej', 'siódmej', 'ósmej', 'dziewiątej', 'dziesiątej', 'jedenastej', 'dwunastej',
  'trzynastej', 'czternastej', 'piętnastej', 'szesnastej', 'siedemnastej', 'osiemnastej', 'dziewiętnastej', 'dwudziestej',
  'dwudziestej pierwszej', 'dwudziestej drugiej', 'dwudziestej trzeciej',
];

export interface TimeInWords {
  /** Timetable style: "Jest siódma trzydzieści." */
  formal: string;
  /** Everyday speech: "Jest wpół do ósmej." */
  everyday: string;
  /** "At …": "o siódmej trzydzieści". */
  at: string;
}

const h12 = (h: number) => h % 12;

/**
 * Minutes agree with the feminine "minuta": dwie (not dwa), and a single minute is "minuta" itself
 * ("minuta po ósmej", "za minutę dziewiąta"). Formal times read the digits, so 8:01 stays "zero jeden".
 */
const minutesFem = (n: number) => numberToWords(n).replace(/(^| )dwa$/, '$1dwie');

export function timeToWords(hours: number, minutes: number): TimeInWords {
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new RangeError('Use a time between 00:00 and 23:59');
  }
  const formalMins = minutes === 1 ? 'jeden' : minutesFem(minutes);
  const mins = minutes === 0 ? '' : minutes < 10 ? ` zero ${formalMins}` : ` ${formalMins}`;
  const midnight = hours === 0 && minutes === 0;
  const formalHour = hours === 0 ? 'zero' : HOUR_NOM[hours];
  const atHour = hours === 0 ? 'zero' : HOUR_LOC[hours];
  const formal = midnight ? 'Jest północ.' : `Jest ${formalHour}${mins}.`;
  const at = midnight ? 'o północy' : `o ${atHour}${mins}`;

  const cur = h12(hours);
  const next = h12(hours + 1);
  let everyday: string;
  if (midnight) everyday = 'Jest północ.';
  else if (minutes === 0) everyday = `Jest ${HOUR_NOM[cur]}.`;
  else if (minutes === 1) everyday = `Jest minuta po ${HOUR_LOC[cur]}.`;
  else if (minutes === 15) everyday = `Jest kwadrans po ${HOUR_LOC[cur]}.`;
  else if (minutes === 30) everyday = `Jest wpół do ${HOUR_LOC[next]}.`;
  else if (minutes === 45) everyday = `Jest za kwadrans ${HOUR_NOM[next]}.`;
  else if (minutes === 59) everyday = `Jest za minutę ${HOUR_NOM[next]}.`;
  else if (minutes < 30) everyday = `Jest ${minutesFem(minutes)} po ${HOUR_LOC[cur]}.`;
  else everyday = `Jest za ${minutesFem(60 - minutes)} ${HOUR_NOM[next]}.`;
  return { formal, everyday, at };
}

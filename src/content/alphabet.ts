/** The 32 letters of the Polish alphabet, with their Polish names, sounds and an example word. */

export interface Letter {
  upper: string;
  lower: string;
  /** How the letter is named when spelling aloud. */
  name: string;
  sound: string;
  example: [pl: string, en: string];
  /** Letter with a diacritic, not found in English. */
  special?: boolean;
}

export const ALPHABET: Letter[] = [
  { upper: 'A', lower: 'a', name: 'a', sound: 'a in "father"', example: ['auto', 'car'] },
  { upper: 'Ą', lower: 'ą', name: 'ą', sound: 'nasal "on"', example: ['są', 'they are'], special: true },
  { upper: 'B', lower: 'b', name: 'be', sound: 'b', example: ['bank', 'bank'] },
  { upper: 'C', lower: 'c', name: 'ce', sound: 'ts in "cats"', example: ['co', 'what'] },
  { upper: 'Ć', lower: 'ć', name: 'cie', sound: 'soft "ch"', example: ['pić', 'to drink'], special: true },
  { upper: 'D', lower: 'd', name: 'de', sound: 'd', example: ['dom', 'house'] },
  { upper: 'E', lower: 'e', name: 'e', sound: 'e in "bed"', example: ['ekran', 'screen'] },
  { upper: 'Ę', lower: 'ę', name: 'ę', sound: 'nasal "en"', example: ['ręka', 'hand'], special: true },
  { upper: 'F', lower: 'f', name: 'ef', sound: 'f', example: ['film', 'film'] },
  { upper: 'G', lower: 'g', name: 'gie', sound: 'g in "go"', example: ['gra', 'game'] },
  { upper: 'H', lower: 'h', name: 'ha', sound: 'ch in "loch"', example: ['herbata', 'tea'] },
  { upper: 'I', lower: 'i', name: 'i', sound: 'ee in "see"', example: ['imię', 'first name'] },
  { upper: 'J', lower: 'j', name: 'jot', sound: 'y in "yes"', example: ['ja', 'I'] },
  { upper: 'K', lower: 'k', name: 'ka', sound: 'k', example: ['kot', 'cat'] },
  { upper: 'L', lower: 'l', name: 'el', sound: 'l', example: ['lato', 'summer'] },
  { upper: 'Ł', lower: 'ł', name: 'eł', sound: 'w in "wet"', example: ['łóżko', 'bed'], special: true },
  { upper: 'M', lower: 'm', name: 'em', sound: 'm', example: ['mama', 'mum'] },
  { upper: 'N', lower: 'n', name: 'en', sound: 'n', example: ['noc', 'night'] },
  { upper: 'Ń', lower: 'ń', name: 'eń', sound: 'ny in "canyon"', example: ['koń', 'horse'], special: true },
  { upper: 'O', lower: 'o', name: 'o', sound: 'o in "hot"', example: ['okno', 'window'] },
  { upper: 'Ó', lower: 'ó', name: 'o z kreską', sound: 'same as u', example: ['mój', 'my'], special: true },
  { upper: 'P', lower: 'p', name: 'pe', sound: 'p', example: ['piwo', 'beer'] },
  { upper: 'R', lower: 'r', name: 'er', sound: 'tapped r', example: ['ryba', 'fish'] },
  { upper: 'S', lower: 's', name: 'es', sound: 's', example: ['sok', 'juice'] },
  { upper: 'Ś', lower: 'ś', name: 'eś', sound: 'soft "sh"', example: ['świat', 'world'], special: true },
  { upper: 'T', lower: 't', name: 'te', sound: 't', example: ['tak', 'yes'] },
  { upper: 'U', lower: 'u', name: 'u', sound: 'oo in "book"', example: ['ucho', 'ear'] },
  { upper: 'W', lower: 'w', name: 'wu', sound: 'v in "van"', example: ['woda', 'water'] },
  { upper: 'Y', lower: 'y', name: 'igrek', sound: 'i in "bit"', example: ['ryba', 'fish'] },
  { upper: 'Z', lower: 'z', name: 'zet', sound: 'z', example: ['zupa', 'soup'] },
  { upper: 'Ź', lower: 'ź', name: 'ziet', sound: 'soft "zh"', example: ['źle', 'badly'], special: true },
  { upper: 'Ż', lower: 'ż', name: 'żet', sound: 's in "pleasure"', example: ['żaba', 'frog'], special: true },
];

/** Letter pairs that make one sound. */
export const DIGRAPHS: Array<{ spelling: string; sound: string; example: [string, string] }> = [
  { spelling: 'ch', sound: 'ch in "loch" (same as h)', example: ['chleb', 'bread'] },
  { spelling: 'cz', sound: 'ch in "church"', example: ['czas', 'time'] },
  { spelling: 'sz', sound: 'sh in "shop"', example: ['szkoła', 'school'] },
  { spelling: 'rz', sound: 's in "pleasure" (same as ż)', example: ['rzeka', 'river'] },
  { spelling: 'dz', sound: 'ds in "roads"', example: ['dzwon', 'bell'] },
  { spelling: 'dż', sound: 'j in "jam"', example: ['dżem', 'jam'] },
  { spelling: 'dź / dzi', sound: 'soft j, as in "jeep"', example: ['dzień', 'day'] },
  { spelling: 'ci', sound: 'soft ch (= ć)', example: ['ciocia', 'aunt'] },
  { spelling: 'si', sound: 'soft sh (= ś)', example: ['siedem', 'seven'] },
  { spelling: 'zi', sound: 'soft zh (= ź)', example: ['zima', 'winter'] },
  { spelling: 'ni', sound: 'ny (= ń)', example: ['nie', 'no'] },
];

export const NOT_NATIVE = 'Q, V and X appear only in foreign words and names (ku, fau, iks).';

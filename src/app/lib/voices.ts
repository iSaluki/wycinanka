/**
 * Which of the two recorded voices reads a text: the course's main (male) voice, or the second (female) one.
 *
 * - A woman's line in a conversation is read by the female voice.
 * - So is anything in a woman's first-person forms (byłam, poszłabym): a man saying them sounds wrong.
 * - Listening practice (hear it and choose, build what you hear, dictation) uses either, half and half by text,
 *   so learners get used to more than one voice. Hearing a language from several speakers makes it easier to
 *   understand new ones (high-variability phonetic training). A text always gets the same voice.
 */

export type VoiceName = 'm' | 'f';

/**
 * Men's names and roles that end in -a like most women's: tata, turysta, sprzedawca, kolega… Polish has a whole
 * group of these, so any new speaker's name is checked by test/unit/voices.test.ts.
 */
const MEN_IN_A = new Set([
  'Tata', 'Turysta', 'Sprzedawca', 'Kierowca', 'Kolega', 'Dentysta', 'Artysta', 'Poeta', 'Mężczyzna', 'Taksówkarz',
  'Kuba', 'Barnaba', 'Kosma', 'Bonawentura',
]);

/**
 * Whether a speaker in a dialogue is a woman: Pani…, a role in -yni (sprzedawczyni), or a name or role ending
 * in -a (Ola, Kelnerka, Mama) that isn't one of the men's.
 */
export function isWoman(who: string): boolean {
  const name = who.trim();
  return /^Pani\b/.test(name) || /yni$/.test(name) || (/a$/.test(name) && !MEN_IN_A.has(name));
}

/** First-person feminine past and conditional forms: byłam, zrobiłabym, poszłyśmy. */
const WOMANS_FORMS = /(łam|łabym|łyśmy|łybyśmy)(?![\p{L}])/u;

export const inWomansVoice = (text: string) => WOMANS_FORMS.test(text);

/** Half of all texts, always the same half: a small, stable hash of the text. */
export function heardInSecondVoice(text: string): boolean {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return (h & 1) === 1;
}

/** The voice for a text: a woman's forms always get the female voice; listening practice gets either. */
export function voiceFor(text: string, listening = false): VoiceName {
  return inWomansVoice(text) || (listening && heardInSecondVoice(text)) ? 'f' : 'm';
}

export const voiceOfSpeaker = (who: string): VoiceName => (isWoman(who) ? 'f' : 'm');

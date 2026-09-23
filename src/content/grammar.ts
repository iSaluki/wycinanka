export interface CaseInfo {
  id: string;
  name: string;
  polish: string;
  questions: string;
  job: string;
  triggers: string[];
  example: [pl: string, en: string];
}

export const CASES: CaseInfo[] = [
  {
    id: 'nom',
    name: 'Nominative',
    polish: 'mianownik',
    questions: 'kto? co?',
    job: 'The subject — who or what does the action. The dictionary form.',
    triggers: ['the subject of a sentence', 'after "to jest"'],
    example: ['Kot śpi.', 'The cat is sleeping.'],
  },
  {
    id: 'gen',
    name: 'Genitive',
    polish: 'dopełniacz',
    questions: 'kogo? czego?',
    job: 'Absence, possession ("of"), quantities and many prepositions. The most common case after the nominative.',
    triggers: ['negation: nie mam…', 'nie ma…', 'do, z (from), od, bez, dla, u', 'numbers 5+, dużo, trochę, kilka', 'szukać, słuchać, uczyć się'],
    example: ['Nie mam kota.', "I don't have a cat."],
  },
  {
    id: 'dat',
    name: 'Dative',
    polish: 'celownik',
    questions: 'komu? czemu?',
    job: 'The person something is given to, or who experiences something.',
    triggers: ['dać, kupić (komuś)', 'pomagać, dziękować', 'podobać się, smakować', 'zimno mi, przykro mi'],
    example: ['Daję kotu mleko.', "I'm giving the cat some milk."],
  },
  {
    id: 'acc',
    name: 'Accusative',
    polish: 'biernik',
    questions: 'kogo? co?',
    job: 'The direct object — what you have, want, see, order.',
    triggers: ['mieć, chcieć, lubić, widzieć', 'poproszę…', 'na + destination (na pocztę)', 'w + day (w sobotę)'],
    example: ['Mam kota.', 'I have a cat.'],
  },
  {
    id: 'ins',
    name: 'Instrumental',
    polish: 'narzędnik',
    questions: 'kim? czym?',
    job: '"With", "by means of", and what someone is.',
    triggers: ['z (with)', 'transport: autobusem', 'być + job: jestem lekarzem', 'interesować się'],
    example: ['Mieszkam z kotem.', 'I live with a cat.'],
  },
  {
    id: 'loc',
    name: 'Locative',
    polish: 'miejscownik',
    questions: 'o kim? o czym?',
    job: 'Location and topic. Only ever used after a preposition.',
    triggers: ['w, na (where?)', 'o (about)', 'przy, po'],
    example: ['Myślę o kocie.', "I'm thinking about the cat."],
  },
  {
    id: 'voc',
    name: 'Vocative',
    polish: 'wołacz',
    questions: '—',
    job: 'Calling or addressing someone directly.',
    triggers: ['Mamo!', 'Panie Tomku!', 'Kasiu!'],
    example: ['Kocie, chodź tu!', 'Come here, cat!'],
  },
];

export interface Declension {
  id: string;
  word: string;
  en: string;
  gender: string;
  /** Forms in CASES order: nom, gen, dat, acc, ins, loc, voc. */
  singular: [string, string, string, string, string, string, string];
  plural: [string, string, string, string, string, string, string];
  note?: string;
}

export const DECLENSIONS: Declension[] = [
  {
    id: 'kot',
    word: 'kot',
    en: 'cat',
    gender: 'masculine, animate',
    singular: ['kot', 'kota', 'kotu', 'kota', 'kotem', 'kocie', 'kocie'],
    plural: ['koty', 'kotów', 'kotom', 'koty', 'kotami', 'kotach', 'koty'],
    note: 'Animate masculine: the accusative looks like the genitive (kota). In the locative, t softens to ci.',
  },
  {
    id: 'dom',
    word: 'dom',
    en: 'house',
    gender: 'masculine, inanimate',
    singular: ['dom', 'domu', 'domowi', 'dom', 'domem', 'domu', 'domu'],
    plural: ['domy', 'domów', 'domom', 'domy', 'domami', 'domach', 'domy'],
    note: 'Inanimate masculine: the accusative is the same as the nominative.',
  },
  {
    id: 'brat',
    word: 'brat',
    en: 'brother',
    gender: 'masculine, personal',
    singular: ['brat', 'brata', 'bratu', 'brata', 'bratem', 'bracie', 'bracie'],
    plural: ['bracia', 'braci', 'braciom', 'braci', 'braćmi', 'braciach', 'bracia'],
    note: 'Masculine personal nouns have their own plural forms. Brat is a little irregular in the plural.',
  },
  {
    id: 'kawa',
    word: 'kawa',
    en: 'coffee',
    gender: 'feminine',
    singular: ['kawa', 'kawy', 'kawie', 'kawę', 'kawą', 'kawie', 'kawo'],
    plural: ['kawy', 'kaw', 'kawom', 'kawy', 'kawami', 'kawach', 'kawy'],
    note: 'The genitive plural of many feminine nouns simply drops the -a: kaw.',
  },
  {
    id: 'okno',
    word: 'okno',
    en: 'window',
    gender: 'neuter',
    singular: ['okno', 'okna', 'oknu', 'okno', 'oknem', 'oknie', 'okno'],
    plural: ['okna', 'okien', 'oknom', 'okna', 'oknami', 'oknach', 'okna'],
    note: 'Neuter nominative, accusative and vocative are always identical. An e can appear in the genitive plural: okien.',
  },
];

export const PRONOUNS: { head: string[]; rows: string[][] } = {
  head: ['', 'ja', 'ty', 'on', 'ona', 'my', 'wy', 'oni'],
  rows: [
    ['nom', 'ja', 'ty', 'on', 'ona', 'my', 'wy', 'oni'],
    ['gen', 'mnie', 'cię / ciebie', 'go / jego / niego', 'jej / niej', 'nas', 'was', 'ich / nich'],
    ['dat', 'mi / mnie', 'ci / tobie', 'mu / jemu / niemu', 'jej / niej', 'nam', 'wam', 'im / nim'],
    ['acc', 'mnie', 'cię / ciebie', 'go / jego / niego', 'ją / nią', 'nas', 'was', 'ich / nich'],
    ['ins', 'mną', 'tobą', 'nim', 'nią', 'nami', 'wami', 'nimi'],
    ['loc', 'mnie', 'tobie', 'nim', 'niej', 'nas', 'was', 'nich'],
  ],
};

export interface Sound {
  /** How it is written. */
  spelling: string;
  ipa: string;
  /** Nearest English approximation for a British speaker. */
  like: string;
  examples: Array<[pl: string, en: string]>;
}

export interface SoundGroup {
  id: string;
  title: string;
  note: string;
  sounds: Sound[];
}

export const SOUND_GROUPS: SoundGroup[] = [
  {
    id: 'vowels',
    title: 'Vowels',
    note: 'Short and pure — no gliding like English "go" or "day". Every vowel is pronounced.',
    sounds: [
      { spelling: 'a', ipa: 'a', like: 'a in "father", but shorter', examples: [['tak', 'yes'], ['mama', 'mum']] },
      { spelling: 'e', ipa: 'ɛ', like: 'e in "bed"', examples: [['ser', 'cheese'], ['nie', 'no']] },
      { spelling: 'i', ipa: 'i', like: 'ee in "see", short', examples: [['pić', 'to drink'], ['kino', 'cinema']] },
      { spelling: 'o', ipa: 'ɔ', like: 'o in "hot"', examples: [['dom', 'house'], ['kot', 'cat']] },
      { spelling: 'u / ó', ipa: 'u', like: 'oo in "book"', examples: [['tu', 'here'], ['ósmy', 'eighth']] },
      { spelling: 'y', ipa: 'ɨ', like: 'i in "bit", said further back', examples: [['ty', 'you'], ['być', 'to be']] },
    ],
  },
  {
    id: 'nasal',
    title: 'Nasal vowels',
    note: 'Let air through your nose. Before b/p they sound like "om/em"; before t/d/c like "on/en"; at the end of a word ę is usually plain e.',
    sounds: [
      { spelling: 'ą', ipa: 'ɔ̃', like: 'French "on" in "bon"', examples: [['są', 'they are'], ['mąż', 'husband']] },
      { spelling: 'ę', ipa: 'ɛ̃', like: 'the nasal "in" of French "vin"', examples: [['ręka', 'hand'], ['mięso', 'meat']] },
    ],
  },
  {
    id: 'surprises',
    title: 'Letters that surprise',
    note: 'Familiar letters with unfamiliar sounds.',
    sounds: [
      { spelling: 'w', ipa: 'v', like: 'v in "van"', examples: [['woda', 'water'], ['wino', 'wine']] },
      { spelling: 'ł', ipa: 'w', like: 'w in "wet"', examples: [['mały', 'small'], ['łódź', 'boat']] },
      { spelling: 'j', ipa: 'j', like: 'y in "yes"', examples: [['jajko', 'egg'], ['ja', 'I']] },
      { spelling: 'c', ipa: 't͡s', like: 'ts in "cats"', examples: [['noc', 'night'], ['ulica', 'street']] },
      { spelling: 'ch / h', ipa: 'x', like: 'ch in Scottish "loch"', examples: [['chleb', 'bread'], ['herbata', 'tea']] },
      { spelling: 'r', ipa: 'r', like: 'a tapped or rolled r', examples: [['rok', 'year'], ['ser', 'cheese']] },
    ],
  },
  {
    id: 'hard',
    title: 'Hard hissing sounds',
    note: 'Tongue tip up, lips slightly rounded. These are close to English sounds.',
    sounds: [
      { spelling: 'sz', ipa: 'ʂ', like: 'sh in "shop"', examples: [['szkoła', 'school'], ['kasza', 'buckwheat']] },
      { spelling: 'cz', ipa: 't͡ʂ', like: 'ch in "church"', examples: [['czas', 'time'], ['czy', 'whether']] },
      { spelling: 'ż / rz', ipa: 'ʐ', like: 's in "pleasure"', examples: [['żaba', 'frog'], ['rzeka', 'river']] },
      { spelling: 'dż', ipa: 'd͡ʐ', like: 'j in "jam"', examples: [['dżem', 'jam'], ['dżungla', 'jungle']] },
    ],
  },
  {
    id: 'soft',
    title: 'Soft hissing sounds',
    note: 'The sounds English lacks. Tongue tip down behind the lower teeth, middle of the tongue raised, lips spread as if smiling. Before a vowel they are written with i.',
    sounds: [
      { spelling: 'ś / si', ipa: 'ɕ', like: 'a soft "sh", as in "sheep" said smiling', examples: [['Kasia', 'Kasia'], ['siedem', 'seven']] },
      { spelling: 'ć / ci', ipa: 't͡ɕ', like: 'a soft "ch", as in "cheap" said smiling', examples: [['ciocia', 'aunt'], ['pić', 'to drink']] },
      { spelling: 'ź / zi', ipa: 'ʑ', like: 'a soft "zh"', examples: [['źle', 'badly'], ['zima', 'winter']] },
      { spelling: 'dź / dzi', ipa: 'd͡ʑ', like: 'a soft "j", as in "jeep" said smiling', examples: [['dzień', 'day'], ['dziecko', 'child']] },
      { spelling: 'ń / ni', ipa: 'ɲ', like: 'ny in "canyon"', examples: [['koń', 'horse'], ['nie', 'no']] },
    ],
  },
  {
    id: 'plain',
    title: 'Plain hissing sounds',
    note: 'Tongue tip behind the upper teeth, like English.',
    sounds: [
      { spelling: 's', ipa: 's', like: 's in "sun"', examples: [['sok', 'juice'], ['sto', 'hundred']] },
      { spelling: 'z', ipa: 'z', like: 'z in "zoo"', examples: [['zupa', 'soup'], ['zero', 'zero']] },
      { spelling: 'dz', ipa: 'd͡z', like: 'ds in "roads"', examples: [['dzwonić', 'to ring'], ['bardzo', 'very']] },
    ],
  },
];

export interface MinimalPair {
  id: string;
  contrast: string;
  a: [pl: string, en: string];
  b: [pl: string, en: string];
  /** True when the two are spelt differently but pronounced identically. */
  same?: boolean;
}

export const MINIMAL_PAIRS: MinimalPair[] = [
  { id: 'wies-wiesz', contrast: 'ś vs sz', a: ['wieś', 'village'], b: ['wiesz', 'you know'] },
  { id: 'prosie-prosze', contrast: 'ś vs sz', a: ['prosię', 'piglet'], b: ['proszę', 'please'] },
  { id: 'kasia-kasza', contrast: 'si vs sz', a: ['Kasia', 'Kasia (name)'], b: ['kasza', 'buckwheat'] },
  { id: 'kos-kosz', contrast: 's vs sz', a: ['kos', 'blackbird'], b: ['kosz', 'basket'] },
  { id: 'ci-czy', contrast: 'ci vs cz', a: ['ci', 'to you'], b: ['czy', 'whether'] },
  { id: 'bic-byc', contrast: 'i vs y', a: ['bić', 'to beat'], b: ['być', 'to be'] },
  { id: 'czesc-czesc', contrast: 'e vs ę', a: ['cześć', 'hi'], b: ['część', 'part'] },
  { id: 'was-was', contrast: 'a vs ą', a: ['was', 'you (plural)'], b: ['wąs', 'moustache'] },
  { id: 'lata-lata', contrast: 'l vs ł', a: ['lata', 'years'], b: ['łata', 'patch'] },
  { id: 'morze-moze', contrast: 'rz = ż', a: ['morze', 'sea'], b: ['może', 'maybe'], same: true },
];

export const TONGUE_TWISTERS: Array<[pl: string, en: string]> = [
  ['W Szczebrzeszynie chrząszcz brzmi w trzcinie.', 'In Szczebrzeszyn a beetle buzzes in the reeds.'],
  ['Stół z powyłamywanymi nogami.', 'A table with broken-off legs.'],
  ['Król Karol kupił królowej Karolinie korale koloru koralowego.', 'King Karol bought Queen Karolina coral-coloured beads.'],
];

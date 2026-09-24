import { IconCulture, IconDiscover, IconPhrases, IconGrammar, IconPictures, IconPractise, IconSounds, IconTools, IconWords } from '../components/icons';

/**
 * The app's sections outside the course, grouped so the phone tab bar stays at four tabs:
 * the desktop rail lists every section, the tab bar shows the two groups.
 */
export interface Section {
  to: string;
  pl: string;
  en: string;
  icon: typeof IconWords;
  blurb: string;
}

export interface SectionGroup {
  to: string;
  pl: string;
  en: string;
  icon: typeof IconWords;
  lead: string;
  sections: Section[];
}

export const PRACTISE: SectionGroup = {
  to: '/study',
  pl: 'Ćwiczenia',
  en: 'Practise',
  icon: IconPractise,
  lead: 'Extra practice outside the lessons: words, phrases, pictures and sounds.',
  sections: [
    { to: '/words', pl: 'Słowa', en: 'Words', icon: IconWords, blurb: 'The 500 most frequent words, learnt in batches of eight.' },
    { to: '/phrases', pl: 'Zwroty', en: 'Phrases', icon: IconPhrases, blurb: 'Everyday phrases learnt whole, like "nie ma sprawy", the way fluent speakers use them.' },
    { to: '/pictures', pl: 'Obrazki', en: 'Pictures', icon: IconPictures, blurb: 'Everyday things named from a picture, with no English in between.' },
    { to: '/sounds', pl: 'Wymowa', en: 'Sounds', icon: IconSounds, blurb: 'The alphabet, how to say every letter, and a listening game.' },
  ],
};

export const DISCOVER: SectionGroup = {
  to: '/discover',
  pl: 'Odkrywaj',
  en: 'Discover',
  icon: IconDiscover,
  lead: 'Reference and background to dip into whenever you like.',
  sections: [
    { to: '/grammar', pl: 'Gramatyka', en: 'Grammar', icon: IconGrammar, blurb: 'The seven cases, a declension explorer and every lesson\'s grammar notes.' },
    { to: '/culture', pl: 'Kultura', en: 'Culture', icon: IconCulture, blurb: 'Polish traditions, festivals and manners, in English.' },
    { to: '/tools', pl: 'Narzędzia', en: 'Tools', icon: IconTools, blurb: 'A pronouncer, numbers and prices, the clock and a phrasebook.' },
  ],
};

export const inGroup = (g: SectionGroup, path: string) => path === g.to || g.sections.some((s) => path === s.to || path.startsWith(`${s.to}/`));

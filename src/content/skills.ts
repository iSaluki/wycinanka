/**
 * Skills group lessons by the thing a learner can struggle with (a case, aspect, a set of sounds),
 * so the app can find someone's weakest area and drill it with the rule shown first.
 */

export interface Skill {
  id: string;
  name: string;
  namePl: string;
  /** Lesson ids, or unit prefixes like "u09" for every lesson in a unit. */
  lessons: string[];
}

export const SKILLS: Skill[] = [
  { id: 'letters', name: 'Letters and sounds', namePl: 'Litery i dźwięki', lessons: ['u00', 'u01'] },
  { id: 'politeness', name: 'Greetings and formal "you"', namePl: 'Grzeczność', lessons: ['u02'] },
  { id: 'byc', name: 'Być and introductions', namePl: 'Być', lessons: ['u03'] },
  { id: 'gender', name: 'Gender and agreement', namePl: 'Rodzaj', lessons: ['u04', 'u08-l1'] },
  { id: 'numbers', name: 'Numbers and money', namePl: 'Liczby', lessons: ['u05', 'u18-l1', 'u18-l3'] },
  { id: 'accusative', name: 'The accusative (objects)', namePl: 'Biernik', lessons: ['u06-l1', 'u06-l2', 'u08-l2'] },
  { id: 'present', name: 'Present-tense verbs', namePl: 'Czas teraźniejszy', lessons: ['u07'] },
  { id: 'genitive', name: 'The genitive (not, of, to)', namePl: 'Dopełniacz', lessons: ['u08-l3', 'u15-l2', 'u18-l2'] },
  { id: 'locative', name: 'The locative (where)', namePl: 'Miejscownik', lessons: ['u09'] },
  { id: 'time', name: 'Days and telling the time', namePl: 'Czas i dni', lessons: ['u10', 'u21-l3'] },
  { id: 'past', name: 'The past tense', namePl: 'Czas przeszły', lessons: ['u11'] },
  { id: 'aspect', name: 'Aspect', namePl: 'Aspekt', lessons: ['u12', 'u13-l2'] },
  { id: 'future', name: 'The future', namePl: 'Czas przyszły', lessons: ['u13-l1', 'u13-l3'] },
  { id: 'instrumental', name: 'The instrumental (with, as)', namePl: 'Narzędnik', lessons: ['u14'] },
  { id: 'motion', name: 'Verbs of motion', namePl: 'Czasowniki ruchu', lessons: ['u15-l1', 'u15-l3', 'u30'] },
  { id: 'dative', name: 'The dative (to, for)', namePl: 'Celownik', lessons: ['u16'] },
  { id: 'conditional', name: 'The conditional', namePl: 'Tryb przypuszczający', lessons: ['u17'] },
  { id: 'cafe', name: 'Food and ordering', namePl: 'Jedzenie', lessons: ['u06-l3'] },
  { id: 'smalltalk', name: 'Small talk', namePl: 'Rozmowa', lessons: ['u19', 'u22-l2', 'u22-l3'] },
  { id: 'people', name: 'Family and people', namePl: 'Ludzie', lessons: ['u20-l1', 'u20-l2'] },
  { id: 'plural', name: 'Plurals', namePl: 'Liczba mnoga', lessons: ['u20-l3', 'u27'] },
  { id: 'weather', name: 'Weather and seasons', namePl: 'Pogoda', lessons: ['u21-l1', 'u21-l2'] },
  { id: 'hobbies', name: 'Free time', namePl: 'Czas wolny', lessons: ['u22-l1'] },
  { id: 'imperative', name: 'Commands', namePl: 'Tryb rozkazujący', lessons: ['u23'] },
  { id: 'health', name: 'Health', namePl: 'Zdrowie', lessons: ['u24'] },
  { id: 'comparison', name: 'Comparing', namePl: 'Stopniowanie', lessons: ['u25'] },
  { id: 'modals', name: 'Should, must, can', namePl: 'Trzeba i można', lessons: ['u26'] },
  { id: 'relative', name: 'Który, swój and reported speech', namePl: 'Który i swój', lessons: ['u28'] },
  { id: 'work', name: 'Work, phone and home', namePl: 'Praca i dom', lessons: ['u29'] },
];

const lessonSkill = new Map<string, string>();

/** The skill a lesson belongs to. Exact lesson matches win over unit prefixes. */
export function skillOfLesson(lessonId: string): string | undefined {
  if (lessonSkill.has(lessonId)) return lessonSkill.get(lessonId);
  const exact = SKILLS.find((s) => s.lessons.includes(lessonId));
  const unit = SKILLS.find((s) => s.lessons.includes(lessonId.slice(0, 3)));
  const id = (exact ?? unit)?.id;
  if (id) lessonSkill.set(lessonId, id);
  return id;
}

export const getSkill = (id: string) => SKILLS.find((s) => s.id === id);

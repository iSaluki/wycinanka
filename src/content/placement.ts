import { normalise, stripDiacritics } from '../shared/grade';

export interface PlacementQuestion {
  id: string;
  band: number;
  prompt: string;
  /** Polish text to show, with ___ for a gap. */
  text?: string;
  /** Choices to pick from. Absent: the learner types the answer, so it can't be guessed. */
  options?: string[];
  answer: string;
  /** Other typed answers that are also right. */
  accepted?: string[];
}

export interface PlacementBand {
  band: number;
  label: string;
  /** Key of the first unit to study if this band is not yet secure (the units this band's questions cover). */
  startUnit: number;
}

/** Each band checks a stretch of the course, in course order, so failing one starts the learner where it begins. */
export const BANDS: PlacementBand[] = [
  { band: 0, label: 'Sounds and first words', startUnit: 0 },
  { band: 1, label: 'Greetings and introductions (A1)', startUnit: 2 },
  { band: 2, label: 'This and that, numbers, the café (A1)', startUnit: 4 },
  { band: 3, label: 'Everyday verbs, family, places and time (A1)', startUnit: 7 },
  { band: 4, label: 'Past, aspect, future and "with" (A2)', startUnit: 11 },
  { band: 5, label: 'Getting around, commands, likes, health, comparing (A2)', startUnit: 15 },
  { band: 6, label: 'Independent (B1)', startUnit: 17 },
];

/**
 * Five questions a band, two of them typed. Passing a band takes four right, so guessing through one is unlikely
 * (about one in forty with every choice question guessed and both typed ones known, and next to none otherwise).
 */
export const PLACEMENT: PlacementQuestion[] = [
  { id: 'p1', band: 0, prompt: 'What does "dziękuję" mean?', options: ['thank you', 'please', 'sorry', 'hello'], answer: 'thank you' },
  { id: 'p2', band: 0, prompt: 'How is the w in "woda" (water) pronounced?', options: ['like English v', 'like English w', 'it is silent'], answer: 'like English v' },
  { id: 'p37', band: 0, prompt: 'Write in Polish: "no".', answer: 'nie' },
  { id: 'p21', band: 0, prompt: 'How is the "sz" in "szkoła" (school) pronounced?', options: ['like sh in "shop"', 'like s in "sun"', 'like ch in "cheese"'], answer: 'like sh in "shop"' },
  { id: 'p22', band: 0, prompt: 'Write in Polish: "Good morning" (the everyday polite greeting).', answer: 'dzień dobry' },

  { id: 'p4', band: 1, prompt: "Complete: I'm from England.", text: 'Ja ___ z Anglii.', options: ['jestem', 'jest', 'są'], answer: 'jestem' },
  { id: 'p23', band: 1, prompt: 'Who is asked "Jak się pan nazywa?"', options: ['a man, politely', 'a woman, politely', 'a friend'], answer: 'a man, politely' },
  { id: 'p24', band: 1, prompt: 'Complete: Where are you from? (to a friend)', text: 'Skąd ___?', options: ['jesteś', 'jest', 'jestem'], answer: 'jesteś' },
  { id: 'p25', band: 1, prompt: 'Type the missing word: My name is Anna.', text: '___ na imię Anna.', answer: 'Mam' },
  { id: 'p26', band: 1, prompt: 'Type the missing word: She is from Poland.', text: 'Ona ___ z Polski.', answer: 'jest' },

  { id: 'p5', band: 2, prompt: 'Complete: this book', text: '___ książka', options: ['ta', 'ten', 'to'], answer: 'ta' },
  { id: 'p6', band: 2, prompt: 'Complete: five złoty', text: 'pięć ___', options: ['złotych', 'złote', 'złoty'], answer: 'złotych' },
  { id: 'p7', band: 2, prompt: 'Complete: A coffee, please.', text: 'Poproszę ___.', options: ['kawę', 'kawa', 'kawy'], answer: 'kawę' },
  { id: 'p27', band: 2, prompt: 'Type the missing word: This is a big house.', text: 'To jest ___ dom.', answer: 'duży' },
  { id: 'p28', band: 2, prompt: 'Type the missing word: It costs three złoty.', text: 'Kosztuje ___ złote.', answer: 'trzy' },

  { id: 'p8', band: 3, prompt: 'Complete: They speak English.', text: 'Oni ___ po angielsku.', options: ['mówią', 'mówi', 'mówię'], answer: 'mówią' },
  { id: 'p9', band: 3, prompt: "Complete: I don't have a car.", text: 'Nie mam ___.', options: ['samochodu', 'samochód', 'samochodem'], answer: 'samochodu' },
  { id: 'p10', band: 3, prompt: 'Complete: I live in Poland.', text: 'Mieszkam w ___.', options: ['Polsce', 'Polska', 'Polski'], answer: 'Polsce' },
  { id: 'p29', band: 3, prompt: 'Type the missing word: I read a lot.', text: 'Dużo ___.', answer: 'czytam' },
  { id: 'p11', band: 3, prompt: 'Type the missing word: The meeting is at five.', text: 'Spotkanie jest o ___.', answer: 'piątej' },

  { id: 'p13', band: 4, prompt: 'Complete: Yesterday Anna was at the cinema.', text: 'Wczoraj Anna ___ w kinie.', options: ['była', 'był', 'byli'], answer: 'była' },
  { id: 'p14', band: 4, prompt: "Complete: I've finished reading this book (a man speaking).", text: '___ tę książkę.', options: ['Przeczytałem', 'Czytałem', 'Czytam'], answer: 'Przeczytałem' },
  { id: 'p15', band: 4, prompt: "Complete: I'm a teacher (a man speaking).", text: 'Jestem ___.', options: ['nauczycielem', 'nauczyciel', 'nauczyciela'], answer: 'nauczycielem' },
  { id: 'p30', band: 4, prompt: 'Type the missing word: Tomorrow I will be at home.', text: 'Jutro ___ w domu.', answer: 'będę' },
  { id: 'p31', band: 4, prompt: 'Type the missing word: I drink coffee with milk.', text: 'Piję kawę z ___.', answer: 'mlekiem' },

  { id: 'p16', band: 5, prompt: 'Complete: I bought Mum a present.', text: 'Kupiłem ___ prezent.', options: ['mamie', 'mamę', 'mamy'], answer: 'mamie' },
  { id: 'p19', band: 5, prompt: 'Complete: This coffee is better.', text: 'Ta kawa jest ___.', options: ['lepsza', 'lepszy', 'najlepsza'], answer: 'lepsza' },
  { id: 'p32', band: 5, prompt: 'Complete: I have a headache (my head hurts).', text: 'Boli mnie ___.', options: ['głowa', 'głowę', 'głowy'], answer: 'głowa' },
  { id: 'p33', band: 5, prompt: "Type the missing word: I'm going to Poland.", text: 'Jadę do ___.', answer: 'Polski' },
  { id: 'p34', band: 5, prompt: 'Type the missing word: I should go home (a woman speaking).', text: '___ iść do domu.', answer: 'Powinnam' },

  { id: 'p17', band: 6, prompt: "Complete: If I had time, I'd go to Poland.", text: 'Gdybym miał czas, ___ do Polski.', options: ['pojechałbym', 'pojadę', 'jechałem'], answer: 'pojechałbym' },
  { id: 'p20', band: 6, prompt: 'Complete: I have three brothers.', text: 'Mam ___ braci.', options: ['trzech', 'trzy', 'troje'], answer: 'trzech' },
  { id: 'p18', band: 6, prompt: "Complete: I'm twenty-five.", text: 'Mam dwadzieścia pięć ___.', options: ['lat', 'lata', 'roku'], answer: 'lat' },
  { id: 'p35', band: 6, prompt: 'Type the missing word: The man who lives here is a doctor.', text: 'Mężczyzna, ___ tu mieszka, jest lekarzem.', answer: 'który' },
  { id: 'p36', band: 6, prompt: 'Type the missing word: I have five cats.', text: 'Mam pięć ___.', answer: 'kotów' },
];

/** Share of a band's questions to get right: four out of five. */
const PASS_SHARE = 0.8;
const needed = (n: number) => Math.ceil(n * PASS_SHARE);

/**
 * Whether an answer is right. Typed answers ignore capitals and punctuation, and missing Polish letters: this
 * checks grammar, and a learner on an English keyboard shouldn't be marked down for "bede".
 */
export function isRight(q: PlacementQuestion, given: string | undefined): boolean {
  if (given === undefined) return false;
  if (q.options) return given === q.answer;
  const g = stripDiacritics(normalise(given));
  return !!g && [q.answer, ...(q.accepted ?? [])].some((a) => stripDiacritics(normalise(a)) === g);
}

/**
 * Work through bands in order; the first band where fewer than four in five answers are right is where the
 * learner should start. Returns the unit key to start from.
 */
export function placementResult(answers: Record<string, string>): { band: number; startUnit: number } {
  for (const b of BANDS) {
    const qs = PLACEMENT.filter((q) => q.band === b.band);
    const right = qs.filter((q) => isRight(q, answers[q.id])).length;
    if (right < needed(qs.length)) return { band: b.band, startUnit: b.startUnit };
  }
  const last = BANDS[BANDS.length - 1];
  return { band: last.band + 1, startUnit: last.startUnit };
}

/** A band is failed as soon as too many answers in it are wrong to reach four in five. */
export function bandFailed(band: number, answers: Record<string, string>): boolean {
  const qs = PLACEMENT.filter((q) => q.band === band);
  const wrong = qs.filter((q) => q.id in answers && !isRight(q, answers[q.id])).length;
  return qs.length - wrong < needed(qs.length);
}

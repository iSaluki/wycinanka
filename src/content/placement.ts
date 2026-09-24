export interface PlacementQuestion {
  id: string;
  band: number;
  prompt: string;
  /** Polish text to show, with ___ for a gap. */
  text?: string;
  options: string[];
  answer: string;
}

export interface PlacementBand {
  band: number;
  label: string;
  /** First unit to study if this band is not yet secure. */
  startUnit: number;
}

export const BANDS: PlacementBand[] = [
  { band: 0, label: 'Complete beginner', startUnit: 0 },
  { band: 1, label: 'First steps (A1)', startUnit: 3 },
  { band: 2, label: 'Everyday basics (A1)', startUnit: 6 },
  { band: 3, label: 'Getting around (A1)', startUnit: 9 },
  { band: 4, label: 'Past, future and aspect (A2)', startUnit: 11 },
  { band: 5, label: 'Independent (B1)', startUnit: 17 },
];

export const PLACEMENT: PlacementQuestion[] = [
  { id: 'p1', band: 0, prompt: 'What does "dziękuję" mean?', options: ['thank you', 'please', 'sorry', 'hello'], answer: 'thank you' },
  { id: 'p2', band: 0, prompt: 'How is the w in "woda" (water) pronounced?', options: ['like English v', 'like English w', 'it is silent'], answer: 'like English v' },
  { id: 'p3', band: 0, prompt: 'Who would you greet with "cześć"?', options: ['a friend', 'a shop assistant you have never met', 'an elderly neighbour'], answer: 'a friend' },
  { id: 'p4', band: 1, prompt: "Complete: I'm from England.", text: 'Ja ___ z Anglii.', options: ['jestem', 'jest', 'są'], answer: 'jestem' },
  { id: 'p5', band: 1, prompt: 'Complete: this book', text: '___ książka', options: ['ta', 'ten', 'to'], answer: 'ta' },
  { id: 'p6', band: 1, prompt: 'Complete: five złoty', text: 'pięć ___', options: ['złotych', 'złote', 'złoty'], answer: 'złotych' },
  { id: 'p7', band: 2, prompt: 'Complete: A coffee, please.', text: 'Poproszę ___.', options: ['kawę', 'kawa', 'kawy'], answer: 'kawę' },
  { id: 'p8', band: 2, prompt: 'Complete: They speak English.', text: 'Oni ___ po angielsku.', options: ['mówią', 'mówi', 'mówię'], answer: 'mówią' },
  { id: 'p9', band: 2, prompt: "Complete: I don't have a car.", text: 'Nie mam ___.', options: ['samochodu', 'samochód', 'samochodem'], answer: 'samochodu' },
  { id: 'p10', band: 3, prompt: 'Complete: I live in Poland.', text: 'Mieszkam w ___.', options: ['Polsce', 'Polska', 'Polski'], answer: 'Polsce' },
  { id: 'p11', band: 3, prompt: 'Complete: The meeting is at five.', text: 'Spotkanie jest o ___.', options: ['piątej', 'piąta', 'pięć'], answer: 'piątej' },
  { id: 'p12', band: 3, prompt: 'Complete: The bank is next to the post office.', text: 'Bank jest obok ___.', options: ['poczty', 'poczta', 'poczcie'], answer: 'poczty' },
  { id: 'p13', band: 4, prompt: 'Complete: Yesterday Anna was at the cinema.', text: 'Wczoraj Anna ___ w kinie.', options: ['była', 'był', 'byli'], answer: 'była' },
  { id: 'p14', band: 4, prompt: "Complete: I've finished reading this book.", text: '___ tę książkę.', options: ['Przeczytałem', 'Czytałem', 'Czytam'], answer: 'Przeczytałem' },
  { id: 'p15', band: 4, prompt: "Complete: I'm a teacher (a man speaking).", text: 'Jestem ___.', options: ['nauczycielem', 'nauczyciel', 'nauczyciela'], answer: 'nauczycielem' },
  { id: 'p16', band: 4, prompt: 'Complete: I bought Mum a present.', text: 'Kupiłem ___ prezent.', options: ['mamie', 'mamę', 'mamy'], answer: 'mamie' },
  { id: 'p17', band: 5, prompt: "Complete: If I had time, I'd go to Poland.", text: 'Gdybym miał czas, ___ do Polski.', options: ['pojechałbym', 'pojadę', 'jechałem'], answer: 'pojechałbym' },
  { id: 'p19', band: 4, prompt: 'Complete: This coffee is better.', text: 'Ta kawa jest ___.', options: ['lepsza', 'lepszy', 'najlepsza'], answer: 'lepsza' },
  { id: 'p20', band: 5, prompt: 'Complete: I have three brothers.', text: 'Mam ___ braci.', options: ['trzech', 'trzy', 'troje'], answer: 'trzech' },
  { id: 'p18', band: 5, prompt: "Complete: I'm twenty-five.", text: 'Mam dwadzieścia pięć ___.', options: ['lat', 'lata', 'roku'], answer: 'lat' },
];

/**
 * Work through bands in order; the first band where fewer than two thirds of answers are correct
 * is where the learner should start. Returns the unit number to start from.
 */
export function placementResult(answers: Record<string, string>): { band: number; startUnit: number } {
  for (const b of BANDS) {
    const qs = PLACEMENT.filter((q) => q.band === b.band);
    const right = qs.filter((q) => answers[q.id] === q.answer).length;
    if (right < Math.ceil((qs.length * 2) / 3)) return { band: b.band, startUnit: b.startUnit };
  }
  const last = BANDS[BANDS.length - 1];
  return { band: last.band + 1, startUnit: last.startUnit };
}

/** A band is failed as soon as too many answers in it are wrong to reach two thirds. */
export function bandFailed(band: number, answers: Record<string, string>): boolean {
  const qs = PLACEMENT.filter((q) => q.band === band);
  const wrong = qs.filter((q) => q.id in answers && answers[q.id] !== q.answer).length;
  return qs.length - wrong < Math.ceil((qs.length * 2) / 3);
}

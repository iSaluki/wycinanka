import { slug } from './build';

/**
 * Lexical chunks: fixed multi-word phrases that fluent speakers store and retrieve whole. Learning
 * "Nie ma sprawy" as one unit is faster and more natural than building it from nie + ma + sprawa, and the
 * word-for-word gloss shows why translating word by word goes wrong.
 *
 * `…` marks an open slot ("Dla mnie…"). Examples use the chunk inside a sentence; in sentence building the
 * chunk is one tile, so learners assemble sentences from chunks rather than single words.
 */

export interface Chunk {
  id: string;
  pl: string;
  en: string;
  /** Word-for-word English, when it differs from the meaning. */
  lit?: string;
  /** A sentence using the chunk, with its English. */
  ex?: [pl: string, en: string];
}

export interface ChunkDeck {
  id: string;
  pl: string;
  en: string;
  chunks: Chunk[];
}

type Row = [pl: string, en: string, lit?: string, ex?: [string, string]];

const deck = (id: string, pl: string, en: string, rows: Row[]): ChunkDeck => ({
  id,
  pl,
  en,
  chunks: rows.map(([p, e, lit, ex]) => ({ id: `chunk-${slug(p)}`, pl: p, en: e, ...(lit ? { lit } : {}), ...(ex ? { ex } : {}) })),
});

export const CHUNK_DECKS: ChunkDeck[] = [
  deck('social', 'Rozmowa', 'Small talk', [
    ['Co słychać?', "How's it going?", "What's heard?", ['Cześć, co słychać?', "Hi, how's it going?"]],
    ['Miło mi.', 'Nice to meet you.', "It's pleasant to me.", ['Miło mi cię poznać.', 'Nice to meet you.']],
    ['Nie ma sprawy.', 'No problem.', "There's no matter.", ['Nie ma sprawy, pomogę ci.', "No problem, I'll help you."]],
    ['Nie ma za co.', "You're welcome.", "There's nothing to thank for."],
    ['Wszystko w porządku?', 'Is everything OK?', 'Everything in order?'],
    ['Do zobaczenia!', 'See you!', 'Until seeing!', ['Do zobaczenia jutro!', 'See you tomorrow!']],
  ]),
  deck('requests', 'Prośby', 'Asking for things', [
    ['Dla mnie…', "I'll have… (ordering)", 'For me…', ['Dla mnie herbata, proszę.', "I'll have tea, please."]],
    ['Czy mogę prosić o…?', 'Could I have…?', 'May I ask for…?', ['Czy mogę prosić o rachunek?', 'Could I have the bill?']],
    ['Ile to kosztuje?', 'How much is it?', 'How much does this cost?'],
    ['Gdzie jest…?', 'Where is…?', undefined, ['Gdzie jest dworzec?', 'Where is the station?']],
    ['Czy jest…?', 'Is there…?', undefined, ['Czy jest tu apteka?', 'Is there a chemist here?']],
    ['Nie ma…', "There isn't…; there's no…", 'Has not…', ['Nie ma mleka.', "There's no milk."]],
  ]),
  deck('opinions', 'Zdanie', 'Giving opinions', [
    ['Moim zdaniem…', 'In my opinion…', 'With my opinion…', ['Moim zdaniem to dobry pomysł.', "In my opinion it's a good idea."]],
    ['Wydaje mi się, że…', 'I think that…', 'It seems to me that…', ['Wydaje mi się, że pada.', "I think it's raining."]],
    ['Szczerze mówiąc…', 'To be honest…', 'Speaking sincerely…', ['Szczerze mówiąc, nie lubię kawy.', "To be honest, I don't like coffee."]],
    ['Nie mam pojęcia.', 'I have no idea.', "I don't have a notion.", ['Nie mam pojęcia, gdzie on jest.', 'I have no idea where he is.']],
    ['To zależy.', 'It depends.', undefined, ['To zależy od pogody.', 'It depends on the weather.']],
    ['Mam nadzieję, że…', 'I hope that…', 'I have hope that…', ['Mam nadzieję, że wszystko w porządku.', 'I hope everything is OK.']],
  ]),
  deck('feelings', 'Samopoczucie', 'Wants and feelings', [
    ['Mam ochotę na…', 'I fancy…', 'I have an appetite for…', ['Mam ochotę na pizzę.', 'I fancy a pizza.']],
    ['Chce mi się pić.', "I'm thirsty.", 'It wants itself to me to drink.'],
    ['Nie chce mi się.', "I can't be bothered.", "It doesn't want itself to me."],
    ['Jest mi zimno.', "I'm cold.", 'It is cold to me.', ['Dzisiaj jest mi zimno.', "I'm cold today."]],
    ['Boli mnie głowa.', 'I have a headache.', 'The head hurts me.', ['Dzisiaj boli mnie głowa.', 'I have a headache today.']],
    ['Mam dość.', "I've had enough.", 'I have enough.'],
  ]),
  deck('time', 'Czas', 'Time and plans', [
    ['Nie mam czasu.', "I don't have time.", undefined, ['Dzisiaj nie mam czasu.', "I don't have time today."]],
    ['Muszę już iść.', 'I have to go now.', 'I must already go.', ['Przepraszam, muszę już iść.', 'Sorry, I have to go now.']],
    ['za chwilę', 'in a moment', 'behind a moment', ['Wracam za chwilę.', "I'll be back in a moment."]],
    ['od czasu do czasu', 'from time to time', undefined, ['Od czasu do czasu gram w tenisa.', 'I play tennis from time to time.']],
    ['Dam ci znać.', "I'll let you know.", "I'll give you to know.", ['Dam ci znać jutro.', "I'll let you know tomorrow."]],
    ['Nie mogę się doczekać.', "I can't wait.", "I can't wait myself through.", ['Nie mogę się doczekać weekendu.', "I can't wait for the weekend."]],
  ]),
  deck('classroom', 'Na lekcji', 'Learning Polish', [
    ['Nie rozumiem.', "I don't understand.", undefined, ['Przepraszam, nie rozumiem.', "Sorry, I don't understand."]],
    ['Co to znaczy?', 'What does it mean?', 'What does this mean?'],
    ['Jak się mówi…?', 'How do you say…?', 'How does one say…?'],
    ['Jak to się pisze?', 'How do you spell it?', 'How does this write itself?'],
    ['Proszę mówić wolniej.', 'Please speak more slowly.'],
    ['Mówię trochę po polsku.', 'I speak a little Polish.', 'I speak a little in Polish.'],
  ]),
];

export const CHUNKS: Chunk[] = CHUNK_DECKS.flatMap((d) => d.chunks);

/** The chunk's words without punctuation or the open slot: what appears inside a sentence. */
export const chunkCore = (c: Pick<Chunk, 'pl'>) =>
  c.pl
    .replace(/[…?!.,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Chunks keyed by their lower-case core words, longest first, for spotting them in sentences. */
export const CHUNK_CORES: Array<{ core: string[]; chunk: Chunk }> = CHUNKS.map((chunk) => ({
  core: chunkCore(chunk).toLocaleLowerCase('pl').split(' '),
  chunk,
}))
  .filter((c) => c.core.length >= 2)
  .sort((a, b) => b.core.length - a.core.length);

export const chunkById = (id: string) => CHUNKS.find((c) => c.id === id);

/** A phrase's chunk entry from its words, e.g. a lesson item "nie ma za co" → the chunk with its literal gloss. */
export function chunkFor(pl: string): Chunk | undefined {
  const words = chunkCore({ pl }).toLocaleLowerCase('pl');
  return CHUNKS.find((c) => chunkCore(c).toLocaleLowerCase('pl') === words);
}

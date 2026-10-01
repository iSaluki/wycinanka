import { slug } from './build';
import type { Level } from './types';

/**
 * Texts to read and listen to: the first connected Polish in the course.
 *
 * Everything else a learner meets here is a fragment. The lessons hold 351 sentences averaging four words and
 * 367 conversation lines averaging five, and barely one utterance in thirteen contains a clause connector, so a
 * learner can finish all 96 lessons without ever having held a thread across two sentences. Understanding
 * connected speech and writing — carrying a subject from one sentence to the next, hearing where a clause ends,
 * meeting a word in the third of four sentences that explain it — is its own skill, and it is the distance
 * between a strong A2 and B1.
 *
 * Each text is built from words the course has already taught, with a handful of new ones glossed underneath
 * (comprehensible input: nearly all known, a little beyond). It is heard once at natural speed with no text at
 * all and answered for the gist, then read with the English hidden a line at a time, then answered for detail.
 * Hiding the English by default is the whole point: a translation on the page turns reading into decoding.
 *
 * A line is one sentence — or, in a couple of places, a short run of them that belong together, like a line of
 * speech and who said it — so that each can be played on its own and the whole text heard by playing them in
 * order. Every line is recorded by `npm run voice`, like the rest of the course.
 */

export interface ReadingLine {
  pl: string;
  en: string;
}

/** A comprehension question: asked in English, answered from the Polish. */
export interface ReadingQuestion {
  q: string;
  options: string[];
  answer: string;
  /**
   * gist: asked after listening once, with the text still hidden — answered from the sound alone.
   * detail: asked after reading, about something only the words can tell you.
   */
  stage: 'gist' | 'detail';
}

export interface ReadingText {
  id: string;
  /** English title, and the Polish one the text carries. */
  title: string;
  titlePl: string;
  level: Level;
  /** What it is about, in English: enough to listen with something in mind, never enough to answer the questions. */
  blurb: string;
  /**
   * The unit (by the number in its id) after which it can be read comfortably, so the list can say which texts
   * are within reach. Nothing is ever locked.
   */
  after: number;
  lines: ReadingLine[];
  /** Words in the text the course hasn't taught, glossed rather than tested. */
  words: Array<[pl: string, en: string]>;
  questions: ReadingQuestion[];
  /**
   * Who reads it. Understanding a new speaker is its own difficulty, so the texts are shared between the two
   * recorded voices — but only a text with no gendered forms can go either way: a woman cannot read {pojechałem}.
   */
  voice?: 'm' | 'f';
}

const text = (
  titlePl: string,
  title: string,
  level: Level,
  after: number,
  blurb: string,
  lines: Array<[pl: string, en: string]>,
  words: Array<[pl: string, en: string]>,
  questions: ReadingQuestion[],
  voice?: 'm' | 'f',
): ReadingText => ({
  id: slug(titlePl),
  title,
  titlePl,
  level,
  after,
  blurb,
  lines: lines.map(([pl, en]) => ({ pl, en })),
  words,
  questions,
  ...(voice ? { voice } : {}),
});

export const READING: ReadingText[] = [
  text(
    'Mój dzień',
    'My day',
    'A1',
    10,
    'Someone takes you through an ordinary weekday, from getting up to going to bed.',
    [
      ['Zwykle wstaję o siódmej rano.', 'I usually get up at seven in the morning.'],
      ['Najpierw myję się, a potem jem śniadanie.', 'First I wash, and then I have breakfast.'],
      ['Rano piję kawę z mlekiem, ale bez cukru.', 'In the morning I drink coffee with milk, but without sugar.'],
      ['O ósmej idę do pracy.', 'At eight I go to work.'],
      ['Pracuję w biurze w centrum, gdzie czytam i piszę przez cały dzień.', 'I work in an office in the centre, where I read and write all day.'],
      ['Po południu jem obiad z kolegą z pracy.', 'In the afternoon I have lunch with a colleague from work.'],
      ['Zwykle jem zupę i sałatkę, a w piątek frytki.', 'I usually have soup and salad, and on Friday, chips.'],
      ['O piątej wracam do domu.', 'At five I come home.'],
      ['Wieczorem gotuję albo oglądam telewizję.', 'In the evening I cook or watch TV.'],
      ['Kiedy jest ciepło, idę na spacer.', "When it's warm, I go for a walk."],
      ['O jedenastej idę spać, bo rano wstaję wcześnie.', 'At eleven I go to bed, because I get up early in the morning.'],
    ],
    [
      ['najpierw', 'first (of all)'],
      ['potem', 'then, afterwards'],
      ['przez cały dzień', 'all day long'],
      ['albo', 'or'],
      ['spacer', 'a walk'],
      ['wcześnie', 'early'],
    ],
    [
      { stage: 'gist', q: 'What is this about?', options: ['One ordinary day', 'A holiday abroad', 'A day at school'], answer: 'One ordinary day' },
      { stage: 'gist', q: 'Where does this person work?', options: ['In an office', 'In a café', 'At home'], answer: 'In an office' },
      {
        stage: 'detail',
        q: 'How does the speaker take their coffee?',
        options: ['With milk, no sugar', 'With milk and sugar', 'Black, with sugar'],
        answer: 'With milk, no sugar',
      },
      { stage: 'detail', q: 'What is different about Friday lunch?', options: ['Chips', 'Soup', 'Nothing at all'], answer: 'Chips' },
      {
        stage: 'detail',
        q: 'Why does the speaker go to bed at eleven?',
        options: ['They get up early', 'There is nothing on TV', 'They are always ill'],
        answer: 'They get up early',
      },
    ],
  ),
  text(
    'W kawiarni',
    'In the café',
    'A1',
    7,
    'A Saturday morning in a small café: ordering, waiting, paying.',
    [
      ['Jest sobota, więc idę do kawiarni.', "It's Saturday, so I'm going to a café."],
      ['Kawiarnia jest mała, ale bardzo miła.', 'The café is small, but very nice.'],
      ['Kelnerka pyta: „Co podać?”', 'The waitress asks, "What can I get you?"'],
      ['„Poproszę kawę z mlekiem i ciasto.”', '"I\'d like a coffee with milk and some cake."'],
      ['Kelnerka daje mi kawę i mówi: „Smacznego!”', 'The waitress gives me the coffee and says, "Enjoy!"'],
      ['Kawa jest dobra, ale za gorąca.', 'The coffee is good, but too hot.'],
      ['Obok mnie siedzi pan i czyta gazetę.', 'Next to me a man is sitting and reading a newspaper.'],
      ['On pije herbatę i je kanapkę.', "He's drinking tea and eating a sandwich."],
      ['Potem proszę o rachunek.', 'Then I ask for the bill.'],
      ['„Dwadzieścia złotych” — mówi kelnerka.', '"Twenty złoty," says the waitress.'],
      ['Płacę i idę do domu.', 'I pay and go home.'],
    ],
    [
      ['więc', 'so'],
      ['pyta', 'asks'],
      ['za gorąca', 'too hot'],
      ['obok mnie', 'next to me'],
      ['siedzi', 'is sitting'],
      ['gazeta', 'a newspaper'],
      ['płacę', 'I pay'],
    ],
    [
      { stage: 'gist', q: 'Where is the speaker?', options: ['In a café', 'At work', 'At the doctor'], answer: 'In a café' },
      { stage: 'gist', q: 'What day is it?', options: ['Saturday', 'Monday', 'Sunday'], answer: 'Saturday' },
      { stage: 'detail', q: 'What does the speaker order?', options: ['Coffee and cake', 'Tea and a sandwich', 'Juice and soup'], answer: 'Coffee and cake' },
      { stage: 'detail', q: 'What is wrong with the coffee?', options: ['It is too hot', 'It is cold', 'It is too sweet'], answer: 'It is too hot' },
      {
        stage: 'detail',
        q: 'What is the man next to the speaker doing?',
        options: ['Reading a newspaper', 'Talking on the phone', 'Paying the bill'],
        answer: 'Reading a newspaper',
      },
    ],
    'f',
    ),
  text(
    'Weekend w Krakowie',
    'A weekend in Kraków',
    'A2',
    12,
    'A trip to Kraków with a brother, told afterwards: what they did, and what went wrong.',
    [
      ['W sobotę pojechałem z bratem do Krakowa.', 'On Saturday I went to Kraków with my brother.'],
      ['Wstaliśmy bardzo wcześnie, bo pociąg był o szóstej.', 'We got up very early, because the train was at six.'],
      ['Wziąłem tylko mały bagaż.', 'I took only a small bag.'],
      ['Rano było pochmurno, a po południu była burza.', 'In the morning it was cloudy, and in the afternoon there was a storm.'],
      ['Najpierw zobaczyliśmy Rynek i Wawel.', 'First we saw the Main Square and Wawel.'],
      ['Potem chcieliśmy wypić kawę, ale wszystkie kawiarnie były pełne.', 'Then we wanted to drink a coffee, but all the cafés were full.'],
      ['W końcu znaleźliśmy małą kawiarnię blisko Rynku.', 'In the end we found a small café near the Main Square.'],
      ['Zjedliśmy pierogi i wypiliśmy herbatę.', 'We ate pierogi and drank tea.'],
      ['Wieczorem wróciliśmy do domu.', 'In the evening we came back home.'],
      ['Byliśmy bardzo zmęczeni, ale weekend był świetny.', 'We were very tired, but the weekend was great.'],
    ],
    [
      ['wstaliśmy', 'we got up'],
      ['pociąg', 'a train'],
      ['pełne', 'full'],
      ['znaleźliśmy', 'we found'],
      ['zmęczeni', 'tired (of a group)'],
      ['świetny', 'great'],
    ],
    [
      { stage: 'gist', q: 'When did this happen?', options: ['Last Saturday', 'Tomorrow', 'Every day'], answer: 'Last Saturday' },
      { stage: 'gist', q: 'Who went to Kraków?', options: ['The speaker and their brother', 'The speaker alone', 'A whole class'], answer: 'The speaker and their brother' },
      { stage: 'detail', q: 'What was the weather like in the afternoon?', options: ['There was a storm', 'The sun was shining', 'It was snowing'], answer: 'There was a storm' },
      {
        stage: 'detail',
        q: 'Why did they not drink coffee straight away?',
        options: ['The cafés were full', 'They had no money', 'They do not like coffee'],
        answer: 'The cafés were full',
      },
      { stage: 'detail', q: 'How did they feel at the end?', options: ['Tired, but pleased', 'Bored', 'Angry'], answer: 'Tired, but pleased' },
    ],
  ),
  text(
    'Moja rodzina',
    'My family',
    'A1',
    20,
    'Someone introduces their family: where they live, what they are like.',
    [
      ['Mam dużą rodzinę.', 'I have a big family.'],
      ['Rodzice mieszkają w Gdańsku, a ja mieszkam w Warszawie.', 'My parents live in Gdańsk, and I live in Warsaw.'],
      ['Mój tata jest wysoki, a mama jest niska.', 'My dad is tall, and my mum is short.'],
      ['Babcia i dziadek mieszkają blisko rodziców.', 'Grandma and grandad live near my parents.'],
      ['Dziadek ma siedemdziesiąt lat, ale jest bardzo zabawny.', 'Grandad is seventy, but he is very funny.'],
      ['Mam brata, więc babcia ma dwóch wnuków.', 'I have a brother, so grandma has two grandsons.'],
      ['Mam też młodszą siostrę.', 'I also have a younger sister.'],
      ['Ona jest jeszcze młoda i bardzo nieśmiała.', 'She is still young and very shy.'],
      ['Ma długie włosy i zielone oczy.', 'She has long hair and green eyes.'],
      ['Latem zawsze jedziemy razem nad morze.', 'In summer we always go to the seaside together.'],
      ['Lubię, kiedy jesteśmy wszyscy razem.', 'I like it when we are all together.'],
    ],
    [
      ['lat', 'years (old)'],
      ['młodsza', 'younger'],
      ['długie', 'long'],
      ['zielone', 'green'],
      ['nad morze', 'to the seaside'],
      ['razem', 'together'],
      ['wszyscy', 'everyone'],
    ],
    [
      { stage: 'gist', q: 'What is this about?', options: ["The speaker's family", 'A holiday by the sea', 'Moving house'], answer: "The speaker's family" },
      { stage: 'gist', q: 'Where do the parents live?', options: ['In Gdańsk', 'In Warsaw', 'By the sea'], answer: 'In Gdańsk' },
      { stage: 'detail', q: 'How many grandsons does grandma have?', options: ['Two', 'One', 'Three'], answer: 'Two' },
      { stage: 'detail', q: 'What is the sister like?', options: ['Young and shy', 'Tall and funny', 'Old and quiet'], answer: 'Young and shy' },
      { stage: 'detail', q: 'What does the family do in summer?', options: ['Go to the seaside', 'Stay in Warsaw', 'Visit Gdańsk at Christmas'], answer: 'Go to the seaside' },
    ],
    'f',
    ),
  text(
    'Szukam mieszkania',
    'Looking for a flat',
    'B1',
    29,
    'A month of flat-hunting in Warsaw, a phone call, and a decision still to make.',
    [
      ['Od miesiąca szukam mieszkania w Warszawie.', 'I have been looking for a flat in Warsaw for a month.'],
      ['To nie jest łatwe, bo czynsz w centrum jest bardzo wysoki.', 'It is not easy, because rent in the centre is very high.'],
      ['Wczoraj zadzwoniłem w sprawie pokoju blisko centrum.', 'Yesterday I called about a room near the centre.'],
      ['Nikt nie odpowiedział, więc zostawiłem wiadomość.', 'Nobody answered, so I left a message.'],
      ['Wieczorem właściciel oddzwonił.', 'In the evening the landlord called back.'],
      ['Powiedział, że mieszkanie ma dwa pokoje, kuchnię i łazienkę.', 'He said the flat has two rooms, a kitchen and a bathroom.'],
      ['Zapytałem, ile wynosi kaucja.', 'I asked how much the deposit is.'],
      ['Kaucja to tysiąc złotych, a to dużo pieniędzy.', 'The deposit is a thousand złoty, and that is a lot of money.'],
      ['Powinienem zobaczyć mieszkanie, zanim podpiszę umowę.', 'I should see the flat before I sign the contract.'],
      ['Jeśli wszystko będzie w porządku, wprowadzę się w maju.', 'If everything is all right, I will move in in May.'],
    ],
    [
      ['od miesiąca', 'for a month'],
      ['łatwe', 'easy'],
      ['odpowiedział', 'answered'],
      ['zostawiłem', 'I left'],
      ['ile wynosi', 'how much is'],
      ['zanim', 'before'],
      ['umowa', 'a contract'],
      ['wprowadzę się', 'I will move in'],
    ],
    [
      { stage: 'gist', q: 'What is the speaker doing?', options: ['Looking for a flat', 'Selling a house', 'Moving to Gdańsk'], answer: 'Looking for a flat' },
      { stage: 'gist', q: 'Who called them back?', options: ['The landlord', 'Their boss', 'Their brother'], answer: 'The landlord' },
      { stage: 'detail', q: 'Why is finding a flat hard?', options: ['Rent in the centre is high', 'There are no flats at all', 'They have no phone'], answer: 'Rent in the centre is high' },
      { stage: 'detail', q: 'How much is the deposit?', options: ['A thousand złoty', 'A hundred złoty', 'Two thousand złoty'], answer: 'A thousand złoty' },
      {
        stage: 'detail',
        q: 'What does the speaker want to do before signing?',
        options: ['See the flat', 'Call the boss', 'Pay the deposit'],
        answer: 'See the flat',
      },
    ],
  ),
  text(
    'Na lotnisku',
    'At the airport',
    'B1',
    30,
    'An early flight to London: check-in, the gate, and luggage that did not arrive.',
    [
      ['Mój lot do Londynu był o szóstej rano, więc przyjechałem na lotnisko o czwartej.', 'My flight to London was at six in the morning, so I arrived at the airport at four.'],
      ['Na tablicy odlotów zobaczyłem, że mój samolot odlatuje punktualnie.', 'On the departures board I saw that my plane was leaving on time.'],
      ['Odprawa była szybka, bo miałem tylko bagaż podręczny.', 'Check-in was quick, because I only had hand luggage.'],
      ['Czekałem przy bramce numer dwanaście z kolegą z pracy.', 'I waited at gate number twelve with a colleague from work.'],
      ['On kupił kawę i powiedział: „Idź pierwszy, ja jeszcze piję.”', 'He bought a coffee and said, "You go first, I am still drinking."'],
      ['Zadzwoniła moja siostra. „Weź parasol” — powiedziała. „W Londynie pada deszcz.”', 'My sister called. "Take an umbrella," she said. "It is raining in London."'],
      ['O wpół do szóstej weszliśmy do samolotu.', 'At half past five we boarded the plane.'],
      ['Lot trwał dwie godziny.', 'The flight lasted two hours.'],
      ['W Londynie przylot był punktualny, ale mój bagaż nie przyjechał.', 'In London the arrival was on time, but my luggage did not arrive.'],
      ['Musiałem iść do biura i zostawić wiadomość.', 'I had to go to an office and leave a message.'],
      ['Nie martwiłem się, bo w bagażu podręcznym miałem wszystko, co ważne.', 'I was not worried, because I had everything important in my hand luggage.'],
    ],
    [
      ['tablica', 'a board'],
      ['szybka', 'quick'],
      ['pierwszy', 'first'],
      ['parasol', 'an umbrella'],
      ['odlatuje', 'is leaving (of a plane)'],
      ['samolot', 'a plane'],
      ['punktualny', 'on time, punctual'],
      ['trwał', 'lasted'],
      ['ważne', 'important'],
    ],
    [
      { stage: 'gist', q: 'Where is the speaker going?', options: ['To London', 'To Kraków', 'To Gdańsk'], answer: 'To London' },
      { stage: 'gist', q: 'What went wrong?', options: ['The luggage did not arrive', 'The flight was cancelled', 'They missed the plane'], answer: 'The luggage did not arrive' },
      {
        stage: 'detail',
        q: 'Why was check-in quick?',
        options: ['Only hand luggage', 'The airport was empty', 'They had paid extra'],
        answer: 'Only hand luggage',
      },
      { stage: 'detail', q: 'What did the sister tell them to take?', options: ['An umbrella', 'A coffee', 'A newspaper'], answer: 'An umbrella' },
      {
        stage: 'detail',
        q: 'Why was the speaker not worried?',
        options: ['Everything important was in the hand luggage', 'The luggage came later', 'They had no luggage at all'],
        answer: 'Everything important was in the hand luggage',
      },
    ],
  ),
];

READING.push(
  text(
    'W sklepie',
    'At the shop',
    'B1',
    18,
    'A Saturday shop: a list, a queue, and paying at the till.',
    [
      ['W sobotę rano idę do małego sklepu blisko domu.', 'On Saturday morning I go to a small shop near my house.'],
      ['Mam listę: mleko, chleb, mięso i dwa kilo jabłek.', 'I have a list: milk, bread, meat and two kilos of apples.'],
      ['Jabłka kosztują siedem złotych za kilo.', 'The apples cost seven złoty a kilo.'],
      ['Kupuję też litr soku i puszkę piwa.', 'I also buy a litre of juice and a can of beer.'],
      ['Przy kasie jest długa kolejka.', 'There is a long queue at the till.'],
      ['Pani przede mną płaci gotówką i długo szuka drobnych.', 'The woman in front of me pays cash and spends a long time looking for change.'],
      ['Ja płacę kartą, bo to szybciej.', 'I pay by card, because it is quicker.'],
      ['Wszystko razem kosztuje czterdzieści dwa złote i pięćdziesiąt groszy.', 'Altogether it comes to forty-two złoty and fifty groszy.'],
      ['Sprzedawca pyta: „Czy potrzebuje pan torby?”', 'The shop assistant asks, "Do you need a bag?"'],
      ['„Nie, dziękuję, mam swoją.”', '"No, thank you, I have my own."'],
      ['Wracam do domu i kładę wszystko na stół.', 'I come home and put everything on the table.'],
    ],
    [
      ['lista', 'a list'],
      ['kilo', 'a kilo'],
      ['kasa', 'the till'],
      ['kolejka', 'a queue'],
      ['przede mną', 'in front of me'],
      ['drobne', 'small change'],
      ['kartą', 'by card'],
      ['sprzedawca', 'a shop assistant'],
      ['torba', 'a bag'],
      ['kładę', 'I put'],
    ],
    [
      { stage: 'gist', q: 'Where is the speaker?', options: ['In a shop', 'In a café', 'At the airport'], answer: 'In a shop' },
      { stage: 'gist', q: 'How does the speaker pay?', options: ['By card', 'In cash', 'They do not pay'], answer: 'By card' },
      { stage: 'detail', q: 'How much fruit is on the list?', options: ['Two kilos of apples', 'A litre of juice', 'No fruit at all'], answer: 'Two kilos of apples' },
      {
        stage: 'detail',
        q: 'Why does the woman in front take so long?',
        options: ['She is looking for change', 'Her card does not work', 'She forgot her list'],
        answer: 'She is looking for change',
      },
      { stage: 'detail', q: 'Does the speaker take a bag?', options: ['No, they have their own', 'Yes, one bag', 'Yes, two bags'], answer: 'No, they have their own' },
    ],
  ),
  text(
    'Dlaczego uczę się polskiego',
    'Why I am learning Polish',
    'B1',
    26,
    'Someone explains why they started, what was hardest, and what they still want.',
    [
      ['Ludzie często pytają mnie, dlaczego uczę się polskiego.', 'People often ask me why I am learning Polish.'],
      ['Moja żona jest Polką, a jej rodzice nie mówią po angielsku.', 'My wife is Polish, and her parents do not speak English.'],
      ['Obiecałem im, że w końcu się nauczę.', 'I promised them that I would learn in the end.'],
      ['Na początku było bardzo trudno.', 'At the beginning it was very hard.'],
      ['Nie rozumiałem ich, kiedy mówili szybko.', 'I did not understand them when they spoke quickly.'],
      ['Najgorszy był dla mnie dopełniacz.', 'The worst thing for me was the genitive.'],
      ['Teraz jest lepiej, bo częściej słucham polskiego radia.', 'Now it is better, because I listen to Polish radio more often.'],
      ['Kiedy czegoś nie rozumiem, proszę żonę, żeby mi to wyjaśniła.', 'When I do not understand something, I ask my wife to explain it to me.'],
      ['Czasem jest gorzej niż tydzień temu, ale to normalne.', 'Sometimes it is worse than a week ago, but that is normal.'],
      ['Człowiek uczy się całe życie.', 'A person learns all their life.'],
      ['Za rok chcę rozmawiać z teściami bez problemu.', 'In a year I want to talk to my parents-in-law without any trouble.'],
    ],
    [
      ['ludzie', 'people'],
      ['obiecałem', 'I promised'],
      ['na początku', 'at the beginning'],
      ['trudno', 'hard, difficult'],
      ['dopełniacz', 'the genitive'],
      ['radio', 'radio'],
      ['żeby', 'so that, to'],
      ['tydzień temu', 'a week ago'],
      ['całe życie', 'all your life'],
      ['za rok', 'in a year'],
    ],
    [
      { stage: 'gist', q: 'Why is the speaker learning Polish?', options: ['Because of family', 'For work', 'For a holiday'], answer: 'Because of family' },
      { stage: 'gist', q: 'How do they feel about their progress?', options: ['It is better than it was', 'They have given up', 'It was easy from the start'], answer: 'It is better than it was' },
      { stage: 'detail', q: 'What did the speaker find hardest?', options: ['The genitive', 'The alphabet', 'Counting'], answer: 'The genitive' },
      {
        stage: 'detail',
        q: 'What does the speaker do to understand more?',
        options: ['Listens to Polish radio', 'Reads the newspaper', 'Watches English films'],
        answer: 'Listens to Polish radio',
      },
      {
        stage: 'detail',
        q: 'What do they want to be able to do in a year?',
        options: ['Talk to their parents-in-law', 'Move to Poland', 'Read a whole book'],
        answer: 'Talk to their parents-in-law',
      },
    ],
  ),
);

export const getText = (id: string) => READING.find((t) => t.id === id);

/** Every sentence of every text: what needs a recording. */
export const readingLines = (): string[] => READING.flatMap((t) => t.lines.map((l) => l.pl));

/** How many running words of Polish a text holds: what makes it more than a fragment. */
export const wordCount = (t: ReadingText) => t.lines.reduce((n, l) => n + l.pl.split(/\s+/).length, 0);

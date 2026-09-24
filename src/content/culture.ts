/**
 * Culture notes: short English articles on Polish traditions, each with a handful of Polish words and
 * phrases to go with it. Written for British learners visiting, living in or marrying into Poland.
 * Body text uses the lesson markup: **bold**, and {Polish} in the Polish face.
 */

export type CultureTheme = 'calendar' | 'everyday' | 'food' | 'arts';

export interface CultureTopic {
  id: string;
  title: string;
  /** The Polish name of the tradition. */
  pl: string;
  theme: CultureTheme;
  /** When it happens, for calendar customs. */
  when?: string;
  summary: string;
  body: string[];
  words: Array<[pl: string, en: string]>;
}

export const CULTURE_THEMES: Array<{ id: CultureTheme; pl: string; en: string }> = [
  { id: 'calendar', pl: 'Święta i zwyczaje', en: 'Festivals through the year' },
  { id: 'everyday', pl: 'Na co dzień', en: 'Everyday life and manners' },
  { id: 'food', pl: 'Kuchnia', en: 'Food and drink' },
  { id: 'arts', pl: 'Historia i sztuka', en: 'History, music and folk art' },
];

export const CULTURE: CultureTopic[] = [
  {
    id: 'wigilia',
    title: 'Christmas Eve',
    pl: 'Wigilia',
    theme: 'calendar',
    when: '24 December',
    summary: 'The most important evening of the Polish year: a meatless supper that starts with the first star.',
    body: [
      'For most Polish families Christmas is celebrated on the evening of 24 December, **Wigilia**. Children watch the sky, because supper traditionally begins when the first star appears: {pierwsza gwiazdka}.',
      'Before anyone eats, the family shares **opłatek**, a thin wafer blessed in church. Everyone breaks off a piece of each other\'s wafer and exchanges personal wishes for the year ahead. It is often the most emotional moment of the evening.',
      'The supper itself is meatless. Many homes aim for twelve dishes: beetroot soup ({barszcz}) with tiny mushroom dumplings ({uszka}), carp ({karp}) or other fish, pierogi with sauerkraut and mushrooms, and poppy-seed cake ({makowiec}). A little hay may be tucked under the white tablecloth, a reminder of the manger.',
      'An extra place is laid at the table for an unexpected guest, so that no traveller is turned away. Presents are opened after supper, and many families go to midnight Mass, **Pasterka**.',
    ],
    words: [
      ['Wigilia', 'Christmas Eve'],
      ['opłatek', 'Christmas wafer'],
      ['pierwsza gwiazdka', 'the first star'],
      ['barszcz', 'beetroot soup'],
      ['karp', 'carp'],
      ['Wesołych Świąt!', 'Happy Christmas!'],
    ],
  },
  {
    id: 'wielkanoc',
    title: 'Easter',
    pl: 'Wielkanoc',
    theme: 'calendar',
    when: 'March or April',
    summary: 'Blessed baskets on Saturday, a feast on Sunday and a water fight on Monday.',
    body: [
      'On Holy Saturday families carry small wicker baskets to church to be blessed. The basket, **święconka**, holds a little of everything for Easter breakfast: eggs, bread, salt, pepper, sausage, horseradish and a lamb made of sugar or butter.',
      'Decorated eggs are called **pisanki**. Some are simply dyed (traditionally in onion skins), others covered in patterns drawn with hot wax.',
      'Easter Sunday starts with a big breakfast. The blessed eggs are shared with wishes, much like the Christmas wafer, and many families eat sour rye soup ({żurek}) with white sausage ({biała kiełbasa}).',
      'Easter Monday is **Śmigus-dyngus**, or {lany poniedziałek}: "wet Monday". People soak each other with water, from a polite sprinkle to buckets and water pistols. Visitors should expect to get wet.',
    ],
    words: [
      ['Wielkanoc', 'Easter'],
      ['święconka', 'the Easter basket blessed on Saturday'],
      ['pisanki', 'decorated Easter eggs'],
      ['jajko', 'egg'],
      ['Śmigus-dyngus', 'Easter Monday water fight'],
      ['Wesołego Alleluja!', 'Happy Easter!'],
    ],
  },
  {
    id: 'tlusty-czwartek',
    title: 'Fat Thursday',
    pl: 'Tłusty czwartek',
    theme: 'calendar',
    when: 'The last Thursday before Lent',
    summary: 'The day the whole country queues for doughnuts.',
    body: [
      'Before the fasting of Lent, Poland has one last indulgence. On **Tłusty czwartek** bakeries open early and the queues stretch down the street for **pączki**: round, deep-fried doughnuts, traditionally filled with rose-petal jam and glazed or dusted with sugar.',
      'Eating none at all is said to bring bad luck for the rest of the year, so offices fill with boxes of them. Alongside pączki come **faworki** (also called {chruściki}): thin twists of fried pastry covered in icing sugar.',
    ],
    words: [
      ['Tłusty czwartek', 'Fat Thursday'],
      ['pączek', 'a doughnut'],
      ['pączki', 'doughnuts'],
      ['faworki', 'fried pastry ribbons'],
      ['Smacznego!', 'Enjoy your meal!'],
    ],
  },
  {
    id: 'marzanna',
    title: 'Drowning winter',
    pl: 'Topienie Marzanny',
    theme: 'calendar',
    when: '21 March, the first day of spring',
    summary: 'Children say goodbye to winter by throwing a straw doll into the river.',
    body: [
      'On the first day of spring, schoolchildren make **Marzanna**: a doll of straw dressed in rags, standing for winter. They carry her to a river or pond, singing, and throw her in (or burn her) so that winter goes and spring can come.',
      'The custom is far older than Christianity. Tradition says you must not look back at Marzanna once she is in the water, or winter might follow you home.',
    ],
    words: [
      ['wiosna', 'spring'],
      ['zima', 'winter'],
      ['Marzanna', 'the straw doll of winter'],
      ['rzeka', 'river'],
    ],
  },
  {
    id: 'noc-kupaly',
    title: 'Midsummer night',
    pl: 'Noc Kupały',
    theme: 'calendar',
    when: 'The shortest night, around 23–24 June',
    summary: 'Floating wreaths, bonfires and the search for a flower that does not exist.',
    body: [
      'On the shortest night of the year, young women traditionally float wreaths of flowers and candles, **wianki**, down the river. Where a wreath drifted, and who caught it, was said to foretell marriage. Many towns still hold Wianki festivals with concerts and fireworks.',
      'Legend says that on this one night the fern blooms. Whoever finds the **kwiat paproci** will have luck and riches, but may not share them. Ferns never flower, which is rather the point.',
    ],
    words: [
      ['wianek', 'wreath'],
      ['wianki', 'wreaths; the midsummer festival'],
      ['kwiat paproci', 'fern flower'],
      ['ognisko', 'bonfire'],
    ],
  },
  {
    id: 'wszystkich-swietych',
    title: "All Saints' Day",
    pl: 'Wszystkich Świętych',
    theme: 'calendar',
    when: '1 November',
    summary: 'Cemeteries glowing with thousands of candles as families remember their dead.',
    body: [
      'On 1 November, a public holiday, families travel across the country to visit the graves of their relatives. They tidy the graves, lay flowers (often chrysanthemums) and light candles in glass holders called **znicze**.',
      'After dark, cemeteries glow with thousands of small flames. It is quiet and reflective rather than sad, and for many people it is as important as Christmas. The next day, **Zaduszki** (All Souls\' Day), continues the remembrance.',
    ],
    words: [
      ['cmentarz', 'cemetery'],
      ['grób', 'grave'],
      ['znicz', 'grave candle'],
      ['chryzantemy', 'chrysanthemums'],
      ['Zaduszki', "All Souls' Day"],
    ],
  },
  {
    id: 'andrzejki',
    title: "St Andrew's Eve",
    pl: 'Andrzejki',
    theme: 'calendar',
    when: '29 November',
    summary: 'A night of party fortune-telling with hot wax and a key.',
    body: [
      'The evening before St Andrew\'s Day is for **wróżby**: fortune-telling games, played today mostly for fun at parties and in schools.',
      'The best known: pour melted wax through the hole of a large old key into cold water. Hold the set shape up to a candle and read your future in its shadow on the wall. Another game lines up everyone\'s shoes from the back of the room to the door; whoever\'s shoe reaches the threshold first will be the first to marry.',
    ],
    words: [
      ['Andrzejki', "St Andrew's Eve"],
      ['wróżba', 'a fortune, a prediction'],
      ['wosk', 'wax'],
      ['klucz', 'key'],
      ['cień', 'shadow'],
    ],
  },
  {
    id: 'imieniny',
    title: 'Name days',
    pl: 'Imieniny',
    theme: 'everyday',
    summary: 'A second birthday, shared with everyone who has the same name.',
    body: [
      'Every day of the calendar belongs to a few first names, taken from saints\' days: 30 November is for Andrzej, 24 June for Jan, 26 July for Anna. Your name day, **imieniny**, is celebrated much like a birthday, and in older generations often more than one.',
      'Colleagues bring cake to the office, friends call, and flowers are given. Calendars and even the weather forecast mention whose name day it is, so there is no excuse for forgetting.',
      'At any celebration you will hear **Sto lat**, "a hundred years", sung as the Polish version of "Happy Birthday": may you live a hundred years.',
    ],
    words: [
      ['imieniny', 'name day'],
      ['urodziny', 'birthday'],
      ['Sto lat!', 'A hundred years! (the celebration song)'],
      ['Wszystkiego najlepszego!', 'All the best!'],
      ['kwiaty', 'flowers'],
    ],
  },
  {
    id: 'goscinnosc',
    title: 'Being a guest',
    pl: 'Gościnność',
    theme: 'everyday',
    summary: 'Shoes off, flowers in odd numbers, and never leave hungry.',
    body: [
      'Poles take hospitality seriously; an old saying goes {Gość w dom, Bóg w dom}: "a guest in the house is God in the house". Expect to be fed more than you can eat, and to be offered seconds more than once.',
      'Take your shoes off at the door. Hosts often keep slippers, **kapcie**, for visitors.',
      'Bring something small: a box of chocolates, a bottle of wine, or flowers. Give flowers in an **odd number**; even numbers are for funerals. Yellow chrysanthemums are for graves, so choose something else.',
      'Before eating, wish everyone **Smacznego!** ("enjoy your meal"). When raising a glass, the toast is **Na zdrowie!**, "to health", and it is also what you say when someone sneezes.',
      'Use {Pan} (to a man) and {Pani} (to a woman) with people you don\'t know well, until they suggest first names.',
    ],
    words: [
      ['Smacznego!', 'Enjoy your meal!'],
      ['Na zdrowie!', 'Cheers! (literally: to health)'],
      ['kapcie', 'slippers'],
      ['Gość w dom, Bóg w dom.', 'A guest in the house is God in the house.'],
      ['Proszę bardzo.', "Here you are; you're welcome."],
    ],
  },
  {
    id: 'kuchnia',
    title: 'What Poles eat',
    pl: 'Kuchnia polska',
    theme: 'food',
    summary: 'Pierogi, soups for every season and a very serious Sunday lunch.',
    body: [
      '**Pierogi** are filled dumplings, boiled and sometimes fried afterwards with onion. {Pierogi ruskie} are filled with potato and white cheese. "Ruskie" refers to Ruthenia, a historical region, not Russia.',
      'Soup starts most proper meals. Sunday lunch ({obiad}, eaten early in the afternoon) very often begins with **rosół**, a clear chicken broth with thin noodles. There is also sour rye soup ({żurek}), beetroot soup ({barszcz}) and cucumber soup ({ogórkowa}).',
      'Among main courses, **bigos** is a hunter\'s stew of sauerkraut, cabbage and several kinds of meat, better on the second or third day. {Gołąbki} are cabbage leaves rolled round minced meat and rice, and {kotlet schabowy} is a breaded pork cutlet, the everyday favourite.',
      'In the Tatra mountains, look for **oscypek**, a smoked sheep\'s cheese pressed into decorated wooden moulds and often grilled with cranberry jam.',
    ],
    words: [
      ['pierogi', 'filled dumplings'],
      ['rosół', 'chicken broth'],
      ['bigos', "hunter's stew"],
      ['gołąbki', 'stuffed cabbage rolls'],
      ['obiad', 'the main (lunchtime) meal'],
      ['Poproszę…', "I'd like… please"],
    ],
  },
  {
    id: 'wycinanki',
    title: 'Paper cutting',
    pl: 'Wycinanki',
    theme: 'arts',
    summary: 'The folk art this app is named after: colourful paper cut-outs from the Polish countryside.',
    body: [
      'In the 1800s, country families began decorating their whitewashed cottages with paper cut-outs, **wycinanki**, pasted on walls and ceiling beams and renewed before Easter and Christmas.',
      'Each region has its own style. Around **Łowicz**, in central Poland, cut-outs are bright and built up in many layers of coloured paper: roosters, flowers and round rosettes ({gwiazdy}, "stars"). The **Kurpie** region in the north-east is known for single-colour, perfectly symmetrical designs, such as the tall tree-like {leluja}, traditionally cut with sheep-shearing scissors.',
      'The rosette you build as you learn is a nod to the Łowicz style: every lesson adds another layer of colour.',
    ],
    words: [
      ['wycinanka', 'a paper cut-out'],
      ['nożyczki', 'scissors'],
      ['papier', 'paper'],
      ['kogut', 'rooster'],
      ['gwiazda', 'star'],
    ],
  },
  {
    id: 'swieta-narodowe',
    title: 'National days',
    pl: 'Święta narodowe',
    theme: 'arts',
    summary: 'A constitution to be proud of, and independence regained after 123 years.',
    body: [
      '**3 May** is Constitution Day. The Constitution of 3 May 1791 was Europe\'s first modern written constitution, and the second in the world after the United States. Just days before, **2 May** is Flag Day: the flag is white over red.',
      'Within a few years of that constitution, Poland had been carved up between Russia, Prussia and Austria. For 123 years it did not exist on the map. On **11 November 1918** it regained its independence, and 11 November is now Independence Day, {Święto Niepodległości}, marked with flags, parades and marches.',
      'The national anthem, **Mazurek Dąbrowskiego**, begins {Jeszcze Polska nie zginęła}: "Poland has not yet perished". It was written in 1797, while Poland was partitioned.',
    ],
    words: [
      ['Święto Niepodległości', 'Independence Day'],
      ['konstytucja', 'constitution'],
      ['flaga', 'flag'],
      ['hymn', 'national anthem'],
      ['Jeszcze Polska nie zginęła.', 'Poland has not yet perished.'],
    ],
  },
  {
    id: 'muzyka',
    title: 'Chopin and the polonaise',
    pl: 'Chopin i polonez',
    theme: 'arts',
    summary: 'Two national dances, one great composer, and a school ball 100 days before exams.',
    body: [
      '**Fryderyk Chopin** was born in 1810 in Żelazowa Wola, near Warsaw, and left Poland at twenty, never to return. His music was full of Polish dances, above all the lively **mazurka** ({mazurek}) and the stately **polonaise** ({polonez}).',
      'His heart was brought back to Warsaw, as he wished, and rests in a pillar of the Holy Cross Church. Every five years Warsaw hosts the International Chopin Piano Competition, and in summer there are free concerts by his monument in Łazienki Park.',
      'The polonaise is still danced today. About a hundred days before their final school exams, the {matura}, students hold a ball called **studniówka** ("the hundred-day"), and it always opens with a polonaise.',
    ],
    words: [
      ['polonez', 'polonaise'],
      ['mazurek', 'mazurka'],
      ['studniówka', 'the school-leavers\' ball'],
      ['matura', 'school-leaving exams'],
      ['fortepian', 'piano'],
    ],
  },
];

export const cultureTopic = (id: string) => CULTURE.find((c) => c.id === id);

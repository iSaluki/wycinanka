/**
 * Culture notes: short English articles on Polish traditions, each with a handful of Polish words and
 * phrases to go with it. Written for British learners visiting, living in or marrying into Poland.
 * Body text uses the lesson markup: **bold**, {Polish} in the Polish face, and **{a key Polish term}** in bold.
 * Every Polish word marked this way can be tapped to hear it, so mark all of them.
 */

export type CultureTheme = 'calendar' | 'everyday' | 'food' | 'history' | 'arts';

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
  /** One video that shows the tradition better than words can, from the performer's or institution's own channel. */
  video?: CultureVideo;
  image?: CultureImage;
}

/** A picture for the article, self-hosted in public/culture from Wikimedia Commons, with its credit. */
export interface CultureImage {
  /** Path under public/. */
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Who made it. */
  author: string;
  license: 'Public domain' | 'CC0' | 'CC BY 2.0' | 'CC BY 3.0' | 'CC BY 4.0' | 'CC BY-SA 3.0 PL' | 'CC BY-SA 4.0';
  /** Its page on Wikimedia Commons. */
  source: string;
}

export interface CultureVideo {
  /** YouTube video id. */
  youtube: string;
  /** What it is, in a few words. */
  title: string;
  /** Who published it. */
  channel: string;
  /** Why it's worth watching: one or two sentences, with the same markup as the body. */
  caption: string;
}

export const CULTURE_THEMES: Array<{ id: CultureTheme; pl: string; en: string }> = [
  { id: 'calendar', pl: 'Święta i zwyczaje', en: 'Festivals through the year' },
  { id: 'everyday', pl: 'Na co dzień', en: 'Everyday life and manners' },
  { id: 'food', pl: 'Kuchnia', en: 'Food and drink' },
  { id: 'history', pl: 'Historia', en: 'A thousand years of history' },
  { id: 'arts', pl: 'Sztuka', en: 'Music and folk art' },
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
      'For most Polish families Christmas is celebrated on the evening of 24 December, **{Wigilia}**. Children watch the sky, because supper traditionally begins when the first star appears: {pierwsza gwiazdka}.',
      'Before anyone eats, the family shares **{opłatek}**, a thin wafer blessed in church. Everyone breaks off a piece of each other\'s wafer and exchanges personal wishes for the year ahead. It is often the most emotional moment of the evening.',
      'The supper itself is meatless. Many homes aim for twelve dishes: beetroot soup ({barszcz}) with tiny mushroom dumplings ({uszka}), carp ({karp}) or other fish, pierogi with sauerkraut and mushrooms, and poppy-seed cake ({makowiec}). A little hay may be tucked under the white tablecloth, a reminder of the manger.',
      'An extra place is laid at the table for an unexpected guest, so that no traveller is turned away. Presents are opened after supper, and many families go to midnight Mass, **{Pasterka}**.',
    ],
    words: [
      ['Wigilia', 'Christmas Eve'],
      ['opłatek', 'Christmas wafer'],
      ['pierwsza gwiazdka', 'the first star'],
      ['barszcz', 'beetroot soup'],
      ['karp', 'carp'],
      ['Wesołych Świąt!', 'Happy Christmas!'],
    ],
    image: {
      src: '/culture/wigilia.jpg',
      width: 798,
      height: 720,
      alt: 'White rectangular wafers embossed with nativity scenes, in a basket.',
      caption: '{Opłatek}, the Christmas wafer, embossed with scenes of the nativity.',
      author: 'Julo',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Oplatki.w.koszyczku.jpg',
    },
    video: {
      youtube: 'scg9txOWa5U',
      title: 'Why Wigilia has twelve dishes',
      channel: 'DW Food',
      caption: 'In English, from Deutsche Welle: the dishes of a Polish Christmas Eve, from {barszcz} with {uszka} onwards.',
    },
  },
  {
    id: 'wielkanoc',
    title: 'Easter',
    pl: 'Wielkanoc',
    theme: 'calendar',
    when: 'March or April',
    summary: 'Blessed baskets on Saturday, a feast on Sunday and a water fight on Monday.',
    body: [
      'On Holy Saturday families carry small wicker baskets to church to be blessed. The basket, **{święconka}**, holds a little of everything for Easter breakfast: eggs, bread, salt, pepper, sausage, horseradish and a lamb made of sugar or butter.',
      'Decorated eggs are called **{pisanki}**. Some are simply dyed (traditionally in onion skins), others covered in patterns drawn with hot wax.',
      'Easter Sunday starts with a big breakfast. The blessed eggs are shared with wishes, much like the Christmas wafer, and many families eat sour rye soup ({żurek}) with white sausage ({biała kiełbasa}).',
      'Easter Monday is **{Śmigus-dyngus}**, or {lany poniedziałek}: "wet Monday". People soak each other with water, from a polite sprinkle to buckets and water pistols. Visitors should expect to get wet.',
    ],
    words: [
      ['Wielkanoc', 'Easter'],
      ['święconka', 'the Easter basket blessed on Saturday'],
      ['pisanki', 'decorated Easter eggs'],
      ['jajko', 'egg'],
      ['Śmigus-dyngus', 'Easter Monday water fight'],
      ['Wesołego Alleluja!', 'Happy Easter!'],
    ],
    image: {
      src: '/culture/wielkanoc.jpg',
      width: 960,
      height: 641,
      alt: 'Brightly patterned Easter eggs on a white lace doily.',
      caption: '{Pisanki}: eggs decorated with wax patterns and bright dyes.',
      author: 'Jakub T. Jankiewicz',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Colorful_Easter_eggs_on_a_doily.jpg',
    },
  },
  {
    id: 'tlusty-czwartek',
    title: 'Fat Thursday',
    pl: 'Tłusty czwartek',
    theme: 'calendar',
    when: 'The last Thursday before Lent',
    summary: 'The day the whole country queues for doughnuts.',
    body: [
      'Before the fasting of Lent, Poland has one last indulgence. On **{Tłusty czwartek}** bakeries open early and the queues stretch down the street for **{pączki}**: round, deep-fried doughnuts, traditionally filled with rose-petal jam and glazed or dusted with sugar.',
      'Eating none at all is said to bring bad luck for the rest of the year, so offices fill with boxes of them. Alongside pączki come **{faworki}** (also called {chruściki}): thin twists of fried pastry covered in icing sugar.',
    ],
    words: [
      ['Tłusty czwartek', 'Fat Thursday'],
      ['pączek', 'a doughnut'],
      ['pączki', 'doughnuts'],
      ['faworki', 'fried pastry ribbons'],
      ['Smacznego!', 'Enjoy your meal!'],
    ],
    image: {
      src: '/culture/tlusty-czwartek.jpg',
      width: 540,
      height: 720,
      alt: 'Round doughnuts glazed with icing and topped with candied orange peel.',
      caption: '{Pączki} with icing and candied orange peel.',
      author: 'hux',
      license: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Pączki_z_lukrem.jpg',
    },
  },
  {
    id: 'marzanna',
    title: 'Drowning winter',
    pl: 'Topienie Marzanny',
    theme: 'calendar',
    when: '21 March, the first day of spring',
    summary: 'Children say goodbye to winter by throwing a straw doll into the river.',
    body: [
      'On the first day of spring, schoolchildren make **{Marzanna}**: a doll of straw dressed in rags, standing for winter. They carry her to a river or pond, singing, and throw her in (or burn her) so that winter goes and spring can come.',
      'The custom is far older than Christianity. Tradition says you must not look back at Marzanna once she is in the water, or winter might follow you home.',
    ],
    words: [
      ['wiosna', 'spring'],
      ['zima', 'winter'],
      ['Marzanna', 'the straw doll of winter'],
      ['rzeka', 'river'],
    ],
    image: {
      src: '/culture/marzanna.jpg',
      width: 540,
      height: 720,
      alt: 'A straw doll in a white dress and ribbons held up beside a river, with a crowd watching.',
      caption: 'Saying goodbye to {Marzanna} at the riverbank on the first day of spring, 2023.',
      author: 'Tomasz Molina',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Pozegnanie_Marzanny_2023_-_Mazowiecki_Marsz_Powitania_Wiosny.jpg',
    },
  },
  {
    id: 'noc-kupaly',
    title: 'Midsummer night',
    pl: 'Noc Kupały',
    theme: 'calendar',
    when: 'The shortest night, around 23–24 June',
    summary: 'Floating wreaths, bonfires and the search for a flower that does not exist.',
    body: [
      'On the shortest night of the year, young women traditionally float wreaths of flowers and candles, **{wianki}**, down the river. Where a wreath drifted, and who caught it, was said to foretell marriage. Many towns still hold Wianki festivals with concerts and fireworks.',
      'Legend says that on this one night the fern blooms. Whoever finds the **{kwiat paproci}** will have luck and riches, but may not share them. Ferns never flower, which is rather the point.',
    ],
    words: [
      ['wianek', 'wreath'],
      ['wianki', 'wreaths; the midsummer festival'],
      ['kwiat paproci', 'fern flower'],
      ['ognisko', 'bonfire'],
    ],
    image: {
      src: '/culture/noc-kupaly.jpg',
      width: 960,
      height: 720,
      alt: 'Two young women wearing large wreaths of flowers and wheat.',
      caption: 'Flower crowns at the {Wianki} festival in Kraków, 2011.',
      author: 'Piotr Drabik',
      license: 'CC BY 2.0',
      source: 'https://commons.wikimedia.org/wiki/File:Polskie_wianki_(6117519878).jpg',
    },
  },
  {
    id: 'wszystkich-swietych',
    title: "All Saints' Day",
    pl: 'Wszystkich Świętych',
    theme: 'calendar',
    when: '1 November',
    summary: 'Cemeteries glowing with thousands of candles as families remember their dead.',
    body: [
      'On 1 November, a public holiday, families travel across the country to visit the graves of their relatives. They tidy the graves, lay flowers (often chrysanthemums) and light candles in glass holders called **{znicze}**.',
      'After dark, cemeteries glow with thousands of small flames. It is quiet and reflective rather than sad, and for many people it is as important as Christmas. The next day, **{Zaduszki}** (All Souls\' Day), continues the remembrance.',
    ],
    words: [
      ['cmentarz', 'cemetery'],
      ['grób', 'grave'],
      ['znicz', 'grave candle'],
      ['chryzantemy', 'chrysanthemums'],
      ['Zaduszki', "All Souls' Day"],
    ],
    image: {
      src: '/culture/wszystkich-swietych.jpg',
      width: 960,
      height: 720,
      alt: 'Glass grave lanterns glowing on a tomb at dusk, with flowers.',
      caption: '{Znicze} on the graves on the evening of All Saints\' Day.',
      author: 'Marek Ślusarczyk (Tupungato)',
      license: 'CC BY 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:030_All_Saints_Day_celebration_in_Poland_-_grave_candles_in_the_evening.jpg',
    },
  },
  {
    id: 'andrzejki',
    title: "St Andrew's Eve",
    pl: 'Andrzejki',
    theme: 'calendar',
    when: '29 November',
    summary: 'A night of party fortune-telling with hot wax and a key.',
    body: [
      'The evening before St Andrew\'s Day is for **{wróżby}**: fortune-telling games, played today mostly for fun at parties and in schools.',
      'The best known: pour melted wax through the hole of a large old key into cold water. Hold the set shape up to a candle and read your future in its shadow on the wall. Another game lines up everyone\'s shoes from the back of the room to the door; whoever\'s shoe reaches the threshold first will be the first to marry.',
    ],
    words: [
      ['Andrzejki', "St Andrew's Eve"],
      ['wróżba', 'a fortune, a prediction'],
      ['wosk', 'wax'],
      ['klucz', 'key'],
      ['cień', 'shadow'],
    ],
    image: {
      src: '/culture/andrzejki.jpg',
      width: 865,
      height: 720,
      alt: 'A painting of two young women at a candlelit table while an old woman\'s shadow falls on the wall.',
      caption: 'Henryk Siemiradzki, {Noc Andrzeja} (1867): fortune-telling by candlelight on St Andrew\'s Eve.',
      author: 'Henryk Siemiradzki',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Siemiradzki_Noc-Andrzeja_1867.jpg',
    },
  },
  {
    id: 'imieniny',
    title: 'Name days',
    pl: 'Imieniny',
    theme: 'everyday',
    summary: 'A second birthday, shared with everyone who has the same name.',
    body: [
      'Every day of the calendar belongs to a few first names, taken from saints\' days: 30 November is for Andrzej, 24 June for Jan, 26 July for Anna. Your name day, **{imieniny}**, is celebrated much like a birthday, and in older generations often more than one.',
      'Colleagues bring cake to the office, friends call, and flowers are given. Calendars and even the weather forecast mention whose name day it is, so there is no excuse for forgetting.',
      'At any celebration you will hear **{Sto lat}**, "a hundred years", sung as the Polish version of "Happy Birthday": may you live a hundred years.',
    ],
    words: [
      ['imieniny', 'name day'],
      ['urodziny', 'birthday'],
      ['Sto lat!', 'A hundred years! (the celebration song)'],
      ['Wszystkiego najlepszego!', 'All the best!'],
      ['kwiaty', 'flowers'],
    ],
    video: {
      youtube: 'vKI8TO7g2OU',
      title: 'Fans and players sing Sto lat',
      channel: 'Piast Gliwice',
      caption:
        'After a match, the players and fans of the football club Piast Gliwice sing {Sto lat} to a teammate nicknamed Badi. Listen for {Sto lat, sto lat, niech żyje, żyje nam}: "a hundred years, a hundred years, long may they live".',
    },
  },
  {
    id: 'goscinnosc',
    title: 'Being a guest',
    pl: 'Gościnność',
    theme: 'everyday',
    summary: 'Shoes off, flowers in odd numbers, and never leave hungry.',
    body: [
      'Poles take hospitality seriously; an old saying goes {Gość w dom, Bóg w dom}: "a guest in the house is God in the house". Expect to be fed more than you can eat, and to be offered seconds more than once.',
      'Take your shoes off at the door. Hosts often keep slippers, **{kapcie}**, for visitors.',
      'Bring something small: a box of chocolates, a bottle of wine, or flowers. Give flowers in an **odd number**; even numbers are for funerals. Yellow chrysanthemums are for graves, so choose something else.',
      'Before eating, wish everyone **{Smacznego!}** ("enjoy your meal"). When raising a glass, the toast is **{Na zdrowie!}**, "to health", and it is also what you say when someone sneezes.',
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
      '**{Pierogi}** are filled dumplings, boiled and sometimes fried afterwards with onion. {Pierogi ruskie} are filled with potato and white cheese. "Ruskie" refers to Ruthenia, a historical region, not Russia.',
      'Soup starts most proper meals. Sunday lunch ({obiad}, eaten early in the afternoon) very often begins with **{rosół}**, a clear chicken broth with thin noodles. There is also sour rye soup ({żurek}), beetroot soup ({barszcz}) and cucumber soup ({ogórkowa}).',
      'Among main courses, **{bigos}** is a hunter\'s stew of sauerkraut, cabbage and several kinds of meat, better on the second or third day. {Gołąbki} are cabbage leaves rolled round minced meat and rice, and {kotlet schabowy} is a breaded pork cutlet, the everyday favourite.',
      'In the Tatra mountains, look for **{oscypek}**, a smoked sheep\'s cheese pressed into decorated wooden moulds and often grilled with cranberry jam.',
    ],
    words: [
      ['pierogi', 'filled dumplings'],
      ['rosół', 'chicken broth'],
      ['bigos', "hunter's stew"],
      ['gołąbki', 'stuffed cabbage rolls'],
      ['obiad', 'the main (lunchtime) meal'],
      ['Poproszę…', "I'd like… please"],
    ],
    image: {
      src: '/culture/kuchnia.jpg',
      width: 960,
      height: 720,
      alt: 'A plate of boiled dumplings with spring onion.',
      caption: '{Pierogi ruskie} in a restaurant in Gdańsk.',
      author: 'MOs810',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Pierogi_ruskie,_Gdansk.jpg',
    },
  },
  {
    id: 'wycinanki',
    title: 'Paper cutting',
    pl: 'Wycinanki',
    theme: 'arts',
    summary: 'The folk art this app is named after: colourful paper cut-outs from the Polish countryside.',
    body: [
      'In the 1800s, country families began decorating their whitewashed cottages with paper cut-outs, **{wycinanki}**, pasted on walls and ceiling beams and renewed before Easter and Christmas.',
      'Each region has its own style. Around **{Łowicz}**, in central Poland, cut-outs are bright and built up in many layers of coloured paper: roosters, flowers and round rosettes ({gwiazdy}, "stars"). The **{Kurpie}** region in the north-east is known for single-colour, perfectly symmetrical designs, such as the tall tree-like {leluja}, traditionally cut with sheep-shearing scissors.',
      'The rosette you build as you learn is a nod to the Łowicz style: every lesson adds another layer of colour.',
    ],
    words: [
      ['wycinanka', 'a paper cut-out'],
      ['nożyczki', 'scissors'],
      ['papier', 'paper'],
      ['kogut', 'rooster'],
      ['gwiazda', 'star'],
    ],
    image: {
      src: '/culture/wycinanki.jpg',
      width: 960,
      height: 654,
      alt: 'A symmetrical paper cut-out of two black birds and a blue flower with green leaves.',
      caption: 'A Łowicz paper cut-out from 1909: birds and flowers in layers of coloured paper.',
      author: 'Unknown artist',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Wycinanka_lowicka._1909_(106673350).jpg',
    },
    video: {
      youtube: 'E_yxUKChkDo',
      title: 'How a Łowicz cut-out is made',
      channel: 'Muzeum w Łowiczu',
      caption:
        'A paper-cutter at the Museum in Łowicz builds a cut-out layer by layer, the style your rosette is based on. In Polish, with a sign-language interpreter; the scissors speak for themselves.',
    },
  },
  {
    id: 'chrzest',
    title: 'Where Poland began',
    pl: 'Chrzest Polski',
    theme: 'history',
    when: '966',
    summary: 'A duke\'s baptism, a royal hill in Kraków and a dragon.',
    body: [
      'Poland counts its birthday from **966**, when Mieszko I, duke of the Polanie, was baptised: the {Chrzest Polski}, "baptism of Poland". The Polanie took their name from {pole}, "field", and gave theirs to the country: {Polska}.',
      'Mieszko\'s family, the **{Piastowie}** (Piasts), ruled for four centuries. His son Bolesław the Brave, {Bolesław Chrobry}, was crowned the first King of Poland in 1025. The first capital was {Gniezno}; later the court moved to {Kraków}.',
      'In Kraków, the kings lived on **{Wawel}** hill, in the royal castle beside the cathedral where most of them were crowned and buried. Below the hill is the cave of the Wawel dragon, {Smok Wawelski}, who in legend ate the townspeople\'s sheep until a clever shoemaker fed him one stuffed with sulphur. A metal dragon by the cave breathes real fire every few minutes.',
    ],
    words: [
      ['chrzest', 'baptism'],
      ['król', 'king'],
      ['zamek', 'castle'],
      ['smok', 'dragon'],
      ['pole', 'field'],
    ],
    image: {
      src: '/culture/chrzest.jpg',
      width: 960,
      height: 638,
      alt: 'A castle and cathedral with green domes on a hill above a river, under a cloudy sky.',
      caption: '{Wawel}: the royal castle and cathedral above the Vistula in Kraków.',
      author: 'Jakub Hałun',
      license: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:20200826_Widok_na_Wawel_znad_Wisły_w_Krakowie_1749_1331.jpg',
    },
  },
  {
    id: 'rzeczpospolita',
    title: 'The Commonwealth',
    pl: 'Rzeczpospolita Obojga Narodów',
    theme: 'history',
    when: '1569–1795',
    summary: 'Elected kings, winged hussars and one of the largest countries in Europe.',
    body: [
      'In 1569 the Union of Lublin joined the Kingdom of Poland and the Grand Duchy of Lithuania into the **{Rzeczpospolita Obojga Narodów}**, the "Commonwealth of Both Nations". At its height it was one of the largest countries in Europe, reaching from the Baltic deep into what is now Ukraine and Belarus. Poland\'s official name is still {Rzeczpospolita Polska}.',
      'Its kings were not born to the throne but elected, in a {wolna elekcja} ("free election") open to the whole nobility, the **{szlachta}**. Parliament, the **{Sejm}**, gave every noble a voice, and in time a single member could block any law with the {liberum veto}. Today\'s parliament is still called the Sejm.',
      'The capital moved from Kraków to {Warszawa} around 1600. In 1683 King Jan III Sobieski led the army that lifted the Ottoman siege of Vienna, with the famous winged cavalry, the **{husaria}**.',
      'Weakened by wars and a paralysed parliament, the Commonwealth was carved up by Russia, Prussia and Austria in three partitions, in 1772, 1793 and 1795. The constitution of 3 May 1791 was a last attempt at reform (see National days).',
    ],
    words: [
      ['Rzeczpospolita', 'republic, the Commonwealth'],
      ['szlachta', 'the nobility'],
      ['Sejm', 'parliament'],
      ['stolica', 'capital city'],
      ['husaria', 'the winged hussars'],
    ],
    image: {
      src: '/culture/rzeczpospolita.jpg',
      width: 960,
      height: 479,
      alt: 'A large battle painting: the king on horseback among soldiers, banners and fallen tents.',
      caption: 'Jan Matejko, 1883: King Jan III Sobieski sends news of the victory at Vienna to the Pope.',
      author: 'Jan Matejko',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:King_John_III_Sobieski_sending_Message_of_Victory_to_the_Pope,_after_the_Battle_of_Vienna_111.png',
    },
  },
  {
    id: 'powstanie-warszawskie',
    title: 'The Warsaw Uprising',
    pl: 'Powstanie Warszawskie',
    theme: 'history',
    when: '1 August 1944',
    summary: 'Sixty-three days that the whole city still stops to remember.',
    body: [
      'The Second World War began on 1 September 1939, when Germany invaded Poland; the Soviet Union invaded from the east on 17 September. About six million Polish citizens died in the war, around half of them Polish Jews murdered in the Holocaust. In 1943 the Jews of the Warsaw Ghetto rose up against the Germans in the Warsaw Ghetto Uprising.',
      'On 1 August 1944 at 5 pm, **{Godzina W}** ("W-hour"), the Polish underground Home Army, the {Armia Krajowa}, rose against the German occupation of Warsaw. They fought for 63 days, largely alone, while the Soviet army waited across the river {Wisła}. Between 150,000 and 200,000 civilians were killed, and afterwards the Germans set about razing the city to the ground.',
      'Every year at 5 pm on 1 August, sirens sound across Warsaw and the city stands still for a minute: drivers stop and get out of their cars, and people stop in the street. The Old Town, {Stare Miasto}, was rebuilt from paintings and photographs after the war, and is now a UNESCO World Heritage Site.',
    ],
    words: [
      ['powstanie', 'uprising'],
      ['wojna', 'war'],
      ['Stare Miasto', 'Old Town'],
      ['pamięć', 'memory'],
      ['wolność', 'freedom'],
    ],
    image: {
      src: '/culture/powstanie-warszawskie.jpg',
      width: 960,
      height: 612,
      alt: 'A square of tall colourful townhouses with café tables in front.',
      caption: 'The Old Town Market Square in Warsaw, rebuilt after the war.',
      author: 'Igor123121',
      license: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Old_Town_Market_Square.,_2026,_Warsaw,_Poland.jpg',
    },
  },
  {
    id: 'solidarnosc',
    title: 'Solidarity and 1989',
    pl: 'Solidarność',
    theme: 'history',
    when: 'August 1980',
    summary: 'A shipyard strike that helped end communism in Europe.',
    body: [
      'After 1945 Poland was a communist state under Soviet control, the Polish People\'s Republic (PRL). In 1978 the Archbishop of Kraków, Karol Wojtyła, became Pope John Paul II, {Jan Paweł II}, and his visit home in 1979 drew millions onto the streets.',
      'In August 1980, workers at the shipyard in Gdańsk, the {Stocznia Gdańska}, went on **{strajk}** (strike), led by an electrician, Lech Wałęsa. The government gave way, and **{Solidarność}** became the first independent trade union in the Soviet bloc, with about ten million members.',
      'On 13 December 1981 the government declared martial law, {stan wojenny}: Solidarity was banned and its leaders interned. It carried on underground, and Wałęsa won the Nobel Peace Prize in 1983.',
      'In 1989 talks at the Round Table, the {Okrągły Stół}, led to partly free elections on 4 June. Solidarity won almost every seat it was allowed to contest, and Tadeusz Mazowiecki became the first non-communist prime minister in the Eastern Bloc. The Berlin Wall fell that November. Poland joined NATO in 1999 and the European Union in 2004.',
    ],
    words: [
      ['solidarność', 'solidarity'],
      ['strajk', 'strike'],
      ['stocznia', 'shipyard'],
      ['wybory', 'elections'],
      ['Okrągły Stół', 'the Round Table'],
    ],
    image: {
      src: '/culture/solidarnosc.jpg',
      width: 960,
      height: 682,
      alt: 'Black-and-white photo of a crowd outside a shipyard gate under the sign Stocznia Gdańska im. Lenina.',
      caption: 'Gate 3 of the Gdańsk shipyard during the strike of August 1980.',
      author: 'Jacek Awakumowski',
      license: 'CC BY-SA 3.0 PL',
      source: 'https://commons.wikimedia.org/wiki/File:Strajk_sierpniowy_w_Stoczni_Gdańskiej_im._Lenina.jpg',
    },
  },
  {
    id: 'swieta-narodowe',
    title: 'National days',
    pl: 'Święta narodowe',
    theme: 'history',
    summary: 'A constitution to be proud of, and independence regained after 123 years.',
    body: [
      '**3 May** is Constitution Day. The Constitution of 3 May 1791 was Europe\'s first modern written constitution, and the second in the world after the United States. Just days before, **2 May** is Flag Day: the flag is white over red.',
      'Within a few years of that constitution, Poland had been carved up between Russia, Prussia and Austria. For 123 years it did not exist on the map. On **11 November 1918** it regained its independence, and 11 November is now Independence Day, {Święto Niepodległości}, marked with flags, parades and marches.',
      'The national anthem, **{Mazurek Dąbrowskiego}**, begins {Jeszcze Polska nie zginęła}: "Poland has not yet perished". It was written in 1797, while Poland was partitioned.',
    ],
    words: [
      ['Święto Niepodległości', 'Independence Day'],
      ['konstytucja', 'constitution'],
      ['flaga', 'flag'],
      ['hymn', 'national anthem'],
      ['Jeszcze Polska nie zginęła.', 'Poland has not yet perished.'],
    ],
    image: {
      src: '/culture/swieta-narodowe.jpg',
      width: 960,
      height: 532,
      alt: 'A crowded painting of people cheering in a street as the king is carried towards a church.',
      caption: 'Jan Matejko painted the Constitution of 3 May 1791 for its centenary, in 1891.',
      author: 'Jan Matejko',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Konstytucja_3_Maja.jpg',
    },
    video: {
      youtube: 'fhVtiR3Rt4E',
      title: 'A stadium sings the anthem',
      channel: 'Radio Białystok',
      caption:
        'November 2018, a hundred years after independence: before a league match in Białystok, the whole stadium sings {Mazurek Dąbrowskiego} under a giant white-and-red flag.',
    },
  },
  {
    id: 'muzyka',
    title: 'Chopin and the polonaise',
    pl: 'Chopin i polonez',
    theme: 'arts',
    summary: 'Two national dances, one great composer, and a school ball 100 days before exams.',
    body: [
      '**{Fryderyk Chopin}** was born in 1810 in Żelazowa Wola, near Warsaw, and left Poland at twenty, never to return. His music was full of Polish dances, above all the lively **mazurka** ({mazurek}) and the stately **polonaise** ({polonez}).',
      'His heart was brought back to Warsaw, as he wished, and rests in a pillar of the Holy Cross Church. Every five years Warsaw hosts the International Chopin Piano Competition, and in summer there are free concerts by his monument in Łazienki Park.',
      'The polonaise is still danced today. About a hundred days before their final school exams, the {matura}, students hold a ball called **{studniówka}** ("the hundred-day"), and it always opens with a polonaise.',
    ],
    words: [
      ['polonez', 'polonaise'],
      ['mazurek', 'mazurka'],
      ['studniówka', 'the school-leavers\' ball'],
      ['matura', 'school-leaving exams'],
      ['fortepian', 'piano'],
    ],
    image: {
      src: '/culture/muzyka.jpg',
      width: 510,
      height: 720,
      alt: 'Black-and-white photograph of Chopin, seated, in a dark coat.',
      caption: 'Chopin in 1849, the year he died: one of only two known photographs of him.',
      author: 'Louis-Auguste Bisson',
      license: 'Public domain',
      source: 'https://commons.wikimedia.org/wiki/File:Frederic_Chopin_photo.jpeg',
    },
    video: {
      youtube: 'aZYYoDDmg8M',
      title: 'The "Heroic" Polonaise, Op. 53',
      channel: 'Chopin Institute',
      caption:
        'Chopin\'s best-known polonaise, played by Seong-Jin Cho, winner of the 2015 Chopin Competition, at the prize-winners\' concert in Warsaw.',
    },
  },
];

export const cultureTopic = (id: string) => CULTURE.find((c) => c.id === id);

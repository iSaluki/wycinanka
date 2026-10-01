import { lesson, unit } from '../build';

/**
 * Everyday topics added in the second edition. Each slots into the course where its grammar has been met
 * (see UNITS in course.ts): small talk after introductions, family after "having", weather after the clock,
 * free time after the instrumental, commands after verbs of motion, health after the dative.
 */

export const u19 = unit(
  19,
  'A1',
  "How's it going?",
  'Co słychać?',
  'The questions Poles really ask each other, how to keep a conversation going, and the people in your life.',
  [
    lesson('u19-l1', 'Everyday openers', 'Start a chat the way Poles really do.', {
      items: [
        ['co słychać?', "what's new?", { altEn: ["how's it going?", "what's up?"], hint: 'Literally "what\'s heard?". Friendly, to anyone you know.' }],
        ['co u ciebie?', 'how are you doing?', { altEn: ["how's things?", "what's new with you?"], hint: 'Literally "what at you?". The everyday question between friends.' }],
        ['jak leci?', "how's it going?", { altEn: ['how are things?'], hint: 'Casual. Literally "how does it fly?".' }],
        ['nic nowego', 'nothing new', { altEn: ['nothing much'] }],
        ['wszystko dobrze', 'all good', { altEn: ["everything's fine", 'everything is fine', 'all fine'] }],
        ['a u ciebie?', 'and with you?', { altEn: ['and you?', 'how about you?'] }],
        ['może być', 'not bad', { altEn: ["it'll do", 'could be worse', 'ok'], hint: 'Literally "it can be". A modest, very Polish "fine".' }],
        ['stara bieda', 'same old', { altEn: ['same old, same old', 'the usual'], hint: 'Literally "the old poverty". Jokey and self-deprecating.' }],
      ],
      sentences: [
        ['Cześć! Co słychać?', "Hi! What's new?", { altEn: ["Hi! How's it going?", "Hi, what's new?"], extra: ['jak', 'nowego'] }],
        ['Wszystko dobrze, a u ciebie?', 'All good, and with you?', { altEn: ['All good, and you?', "Everything's fine, and you?"], extra: ['ty', 'nic'] }],
        ['Nic nowego, stara bieda.', 'Nothing new, same old.', { altEn: ['Nothing new, same old same old.', 'Nothing new, the usual.'], extra: ['co', 'dobrze'] }],
        ['Jak leci? Może być.', "How's it going? Not bad.", { altEn: ["How's it going? It's OK.", 'How are things? Not bad.'], extra: ['co', 'słychać'] }],
      ],
      drills: [
        ['Co ___ ciebie?', 'How are you doing? (to a friend)', ['u', 'z', 'w'], 'u', 'u means "at someone\'s": Co u ciebie? is literally "what at you?".'],
        ['A u ___?', 'And with you? (to a friend)', ['ciebie', 'ty', 'tobą'], 'ciebie', 'After u, "you" is ciebie (the genitive).'],
        ['Co ___ pana?', 'How are you doing? (to a man, formal)', ['u', 'do', 'z'], 'u', 'Formally: Co u pana? / Co u pani?'],
        ['Jak ___?', "How's it going?", ['leci', 'lata', 'lecisz'], 'leci'],
      ],
      spotlight: {
        title: 'What Poles actually say',
        body: [
          '{Jak się masz?} is correct, but sounds a little like a textbook. Friends say {Co słychać?}, {Co u ciebie?} or {Jak leci?}. Formally: {Co u pana?} / {Co u pani?}',
          'Poles answer honestly and modestly. {Może być} ("it can be") and {Stara bieda} ("same old") are normal answers; a cheerful "Great!" every time can sound odd.',
        ],
      },
      dialogue: [
        ['Ania', 'Cześć, Tom! Co słychać?', "Hi, Tom! What's new?"],
        ['Tom', 'Cześć! Wszystko dobrze. A u ciebie?', 'Hi! All good. And with you?'],
        ['Ania', 'Może być. Dużo pracy.', 'Not bad. Lots of work.'],
        ['Tom', 'Rozumiem. Stara bieda!', 'I see. Same old!'],
      ],
    }),
    lesson('u19-l2', 'Keeping it going', "Ask again when you don't catch something, and fill the gaps while you think.", {
      items: [
        ['możesz powtórzyć?', 'can you say that again?', { altEn: ['can you repeat that?', 'could you repeat that?'], hint: 'Formally: {Może pan powtórzyć?} / {Może pani powtórzyć?}' }],
        ['nie dosłyszałem', "I didn't catch that", { altPl: ['nie dosłyszałam'], altEn: ["i didn't hear that"], hint: 'A woman says nie dosłyszałam.' }],
        ['co masz na myśli?', 'what do you mean?', { altEn: ['what do you have in mind?'] }],
        ['chodzi mi o to, że', 'what I mean is', { altEn: ['the point is', 'i mean that'] }],
        ['wiesz co', 'you know what', { altEn: ['you know what?'], hint: 'Starts a new idea or a suggestion.' }],
        ['no właśnie', 'exactly', { altEn: ["that's it", "that's the thing"] }],
        ['no', 'well', { altEn: ['yeah', 'so'], hint: 'The Polish "well…" and a casual "yeah". Never "no"!' }],
        ['to znaczy', 'I mean', { altEn: ['that is', 'that means'] }],
      ],
      sentences: [
        ['Przepraszam, możesz powtórzyć?', 'Sorry, can you say that again?', { altEn: ['Sorry, can you repeat that?', 'Excuse me, could you repeat that?', 'Sorry, could you say that again?'], extra: ['może', 'mówić'] }],
        ['Nie dosłyszałem. Możesz mówić wolniej?', "I didn't catch that. Can you speak more slowly?", { altPl: ['Nie dosłyszałam. Możesz mówić wolniej?'], altEn: ["I didn't hear that. Can you speak more slowly?", "I didn't catch that. Could you speak more slowly?"], extra: ['wolno', 'powtórzyć'] }],
        ['Co masz na myśli?', 'What do you mean?', { extra: ['mam', 'myśl'] }],
        ['No właśnie! Chodzi mi o to, że nie mam czasu.', "Exactly! What I mean is I don't have time.", { altEn: ["Exactly! I mean I don't have time.", "That's it! What I mean is that I don't have time."], extra: ['czas', 'masz'] }],
      ],
      drills: [
        ['Możesz ___?', 'Can you say that again?', ['powtórzyć', 'powtarzam', 'powtórz'], 'powtórzyć', 'możesz is followed by an infinitive.'],
        ['Nie ___ (a woman speaking).', "I didn't catch that.", ['dosłyszałam', 'dosłyszałem', 'dosłyszała'], 'dosłyszałam'],
        ['Co masz na ___?', 'What do you mean?', ['myśli', 'myśl', 'myślę'], 'myśli', 'na + locative: na myśli, "on (your) mind".'],
      ],
      spotlight: {
        title: 'Asking again, and buying time',
        body: [
          'Nobody catches everything. {Możesz powtórzyć?} and {Nie dosłyszałem} keep a conversation going; {Proszę mówić wolniej} (please speak more slowly) is the formal version.',
          'Fillers give you a second to think, as "well" and "you know" do in English: {no}, {wiesz co}, {to znaczy}. Careful: {no} means "well" or "yeah", never "no".',
        ],
      },
      dialogue: [
        ['Marek', 'Wiesz co, może pójdziemy jutro na pizzę?', 'You know what, shall we go for pizza tomorrow?'],
        ['Emma', 'Przepraszam, nie dosłyszałam. Możesz powtórzyć?', "Sorry, I didn't catch that. Can you say it again?"],
        ['Marek', 'Pizza. Jutro. Ty i ja.', 'Pizza. Tomorrow. You and me.'],
        ['Emma', 'Aha! No, dobrze. Chętnie!', 'Oh! Well, OK. Gladly!'],
      ],
    }),
    lesson('u19-l3', 'Friends and acquaintances', 'Name the people in your life, from close friends to neighbours.', {
      items: [
        ['kolega', 'friend (a man)', { altEn: ['mate', 'colleague'], g: 'm', hint: 'Someone you know: a mate, a classmate, a colleague. Masculine, despite the -a.' }],
        ['koleżanka', 'friend (a woman)', { altEn: ['colleague'], g: 'f' }],
        ['znajomy', 'acquaintance', { altEn: ['someone i know', 'friend'], g: 'm' }],
        ['chłopak', 'boyfriend', { altEn: ['boy', 'lad'], g: 'm' }],
        ['dziewczyna', 'girlfriend', { altEn: ['girl'], g: 'f' }],
        ['sąsiad', 'neighbour', { altEn: ['neighbor'], g: 'm' }],
        ['poznać', 'to meet', { altEn: ['to get to know'], hint: 'Meeting someone for the first time.' }],
        ['znamy się', 'we know each other', { altEn: ["we've met"] }],
      ],
      sentences: [
        ['To jest mój kolega z pracy.', 'This is my colleague from work.', { altEn: ['This is my friend from work.', 'This is a colleague from work.'], extra: ['moja', 'koleżanka'] }],
        ['Znamy się ze szkoły.', 'We know each other from school.', { altEn: ["We've known each other since school."], extra: ['szkoła', 'znam'] }],
        ['Moja dziewczyna jest z Krakowa.', 'My girlfriend is from Kraków.', { altEn: ['My girlfriend is from Krakow.'], extra: ['mój', 'chłopak'] }],
        ['Gdzie się poznaliście?', 'Where did you meet?', { altEn: ['Where did you two meet?'], extra: ['poznać', 'kiedy'] }],
      ],
      drills: [
        ['To jest moja ___.', 'This is my (female) colleague.', ['koleżanka', 'kolega', 'koleżanki'], 'koleżanka'],
        ['Mój ___ ma na imię Piotr.', 'My boyfriend is called Piotr.', ['chłopak', 'dziewczyna', 'chłopaka'], 'chłopak'],
        ['Miło mi cię ___.', 'Nice to meet you.', ['poznać', 'znać', 'poznaję'], 'poznać', 'Meeting for the first time: poznać.'],
      ],
      spotlight: {
        title: 'Friend, mate or girlfriend?',
        body: [
          '{Przyjaciel} / {przyjaciółka} is a **close** friend: a big word in Polish. Most people you would call friends in English are {kolega} / {koleżanka} (mates, classmates, colleagues) or {znajomi} (people you know).',
          'A boyfriend or girlfriend is {chłopak} / {dziewczyna}, which also simply mean "boy" and "girl".',
        ],
        table: {
          head: ['English', 'a man', 'a woman'],
          rows: [
            ['close friend', 'przyjaciel', 'przyjaciółka'],
            ['friend, mate, colleague', 'kolega', 'koleżanka'],
            ['acquaintance', 'znajomy', 'znajoma'],
            ['boyfriend / girlfriend', 'chłopak', 'dziewczyna'],
          ],
        },
      },
      dialogue: [
        ['Kasia', 'Tom, to jest Ola, moja koleżanka z pracy.', 'Tom, this is Ola, my colleague from work.'],
        ['Tom', 'Cześć, Ola! Miło mi cię poznać.', 'Hi, Ola! Nice to meet you.'],
        ['Ola', 'Mnie też. Wy się znacie ze szkoły?', 'Me too. Do you two know each other from school?'],
        ['Kasia', 'Nie, jesteśmy sąsiadami.', "No, we're neighbours."],
      ],
    }),
  ],
);

export const u20 = unit(
  20,
  'A1',
  'Family & people',
  'Ludzie',
  'Parents, grandparents and in-laws; what people look like and what they are like; and plurals of things.',
  [
    lesson('u20-l1', 'The wider family', 'Talk about parents, grandparents and cousins.', {
      items: [
        ['rodzice', 'parents', { g: 'pl' }],
        ['dziadek', 'grandad', { altEn: ['grandfather', 'grandpa'], g: 'm' }],
        ['babcia', 'grandma', { altEn: ['grandmother', 'nan', 'granny'], g: 'f' }],
        ['wujek', 'uncle', { g: 'm' }],
        ['kuzyn', 'cousin (a man)', { altEn: ['cousin'], g: 'm' }],
        ['kuzynka', 'cousin (a woman)', { altEn: ['cousin'], g: 'f' }],
        ['wnuk', 'grandson', { altEn: ['grandchild'], g: 'm' }],
        ['teściowa', 'mother-in-law', { g: 'f', hint: "Your husband's or wife's mother. The father-in-law is {teść}." }],
      ],
      sentences: [
        ['Moi rodzice mieszkają w Gdańsku.', 'My parents live in Gdańsk.', { altEn: ['My parents live in Gdansk.'], extra: ['moje', 'mieszka'] }],
        ['Babcia i dziadek są na emeryturze.', 'Grandma and Grandad are retired.', { altEn: ['My grandparents are retired.', 'Grandma and Grandpa are retired.'], extra: ['jest', 'emerytura'] }],
        ['Mój wujek jest lekarzem.', 'My uncle is a doctor.', { extra: ['lekarz', 'moja'] }],
        ['Teściowa przyjeżdża w sobotę.', 'My mother-in-law is coming on Saturday.', { altEn: ['Mother-in-law is coming on Saturday.', 'My mother-in-law arrives on Saturday.'], extra: ['przyjeżdżam', 'sobota'] }],
      ],
      drills: [
        ['Moi ___ mieszkają w Polsce.', 'My parents live in Poland.', ['rodzice', 'rodzina', 'rodziców'], 'rodzice'],
        ['Mam ___.', 'I have a grandma.', ['babcię', 'babcia', 'babci'], 'babcię', 'mieć + accusative: -a becomes -ę.'],
        ['Nie mam ___.', "I don't have a (male) cousin.", ['kuzyna', 'kuzyn', 'kuzynem'], 'kuzyna', 'After a "not", the genitive.'],
      ],
      spotlight: {
        title: 'Moi rodzice',
        body: [
          '{Moi} is the plural of {mój} for groups that include a man: {moi rodzice}, {moi dziadkowie} (grandparents). For things and groups of women it is {moje}: {moje siostry}.',
          'Families in Poland are close. Many Poles live near their parents, and grandparents often help with the children.',
        ],
      },
      dialogue: [
        ['Ewa', 'Masz rodzeństwo?', 'Do you have any brothers or sisters?'],
        ['Jack', 'Tak, mam brata. A moi rodzice mieszkają w Leeds.', 'Yes, I have a brother. And my parents live in Leeds.'],
        ['Ewa', 'A dziadkowie?', 'And your grandparents?'],
        ['Jack', 'Babcia mieszka z nami. Ma dziewięćdziesiąt lat!', "Grandma lives with us. She's ninety!"],
      ],
    }),
    lesson('u20-l2', 'Describing people', 'Say what someone looks like and what they are like.', {
      items: [
        ['wysoki', 'tall', { altEn: ['high'] }],
        ['niski', 'short', { altEn: ['low'] }],
        ['młody', 'young'],
        ['miły', 'nice', { altEn: ['kind', 'pleasant'] }],
        ['zabawny', 'funny'],
        ['nieśmiały', 'shy'],
        ['włosy', 'hair', { g: 'pl', hint: 'Plural in Polish.' }],
        ['oczy', 'eyes', { g: 'pl' }],
        ['wygląda', 'looks', { altEn: ['he looks', 'she looks'] }],
      ],
      sentences: [
        ['Mój brat jest wysoki i bardzo miły.', 'My brother is tall and very nice.', { altEn: ['My brother is tall and very kind.'], extra: ['wysoka', 'miła'] }],
        ['Ona ma długie włosy i niebieskie oczy.', 'She has long hair and blue eyes.', { altEn: ["She's got long hair and blue eyes."], extra: ['długi', 'oko'] }],
        ['Jak on wygląda?', 'What does he look like?', { extra: ['jaki', 'wyglądam'] }],
        ['Moja siostra jest trochę nieśmiała.', 'My sister is a bit shy.', { altEn: ['My sister is a little shy.'], extra: ['nieśmiały', 'mój'] }],
      ],
      drills: [
        ['Ona jest ___.', 'She is tall.', ['wysoka', 'wysoki', 'wysokie'], 'wysoka', 'The adjective agrees with the person: feminine -a.'],
        ['On jest bardzo ___.', 'He is very funny.', ['zabawny', 'zabawna', 'zabawne'], 'zabawny'],
        ['Mam krótkie ___.', 'I have short hair.', ['włosy', 'włos', 'włosów'], 'włosy', 'Hair is plural in Polish: włosy.'],
      ],
      spotlight: {
        title: 'Hair and eyes are plural',
        body: [
          '{Włosy} (hair) and {oczy} (eyes) are plural, so their adjectives are too: {długie włosy}, {niebieskie oczy}. Describe looks with {mieć}: {Ona ma krótkie włosy}.',
          'For character, use {być}: {On jest miły}. Ask {Jak on wygląda?} (what does he look like?) and {Jaki on jest?} (what is he like?).',
        ],
      },
      dialogue: [
        ['Ola', 'Jak wygląda twój nowy szef?', 'What does your new boss look like?'],
        ['Adam', 'Jest wysoki, ma krótkie włosy i okulary.', 'He is tall, with short hair and glasses.'],
        ['Ola', 'A jaki jest?', 'And what is he like?'],
        ['Adam', 'Bardzo miły i zabawny. Na szczęście!', 'Very nice and funny. Luckily!'],
      ],
    }),
    lesson('u20-l3', 'More than one', 'Make plurals of things: domy, książki, okna.', {
      items: [
        ['książki', 'books', { g: 'pl' }],
        ['domy', 'houses', { altEn: ['homes'], g: 'pl' }],
        ['okna', 'windows', { g: 'pl' }],
        ['samochody', 'cars', { g: 'pl' }],
        ['ulice', 'streets', { altEn: ['roads'], g: 'pl' }],
        ['krzesła', 'chairs', { g: 'pl' }],
        ['te', 'these', { altEn: ['those'], hint: 'The plural of ten, ta, to for things, animals and women.' }],
      ],
      sentences: [
        ['Te książki są nowe.', 'These books are new.', { altEn: ['Those books are new.'], extra: ['ta', 'nowa'] }],
        ['Na tej ulicy są stare domy.', 'There are old houses on this street.', { altEn: ['This street has old houses.'], extra: ['dom', 'stary'] }],
        ['Mieszkanie ma duże okna.', 'The flat has big windows.', { altEn: ['The apartment has big windows.', 'The flat has large windows.'], extra: ['okno', 'duży'] }],
        ['Gdzie są krzesła?', 'Where are the chairs?', { extra: ['jest', 'krzesło'] }],
      ],
      drills: [
        ['dwa ___', 'two cars', ['samochody', 'samochód', 'samochodów'], 'samochody', 'Most masculine things add -y (-i after k and g).'],
        ['trzy ___', 'three windows', ['okna', 'okno', 'okien'], 'okna', 'Neuter -o becomes -a.'],
        ['cztery ___', 'four streets', ['ulice', 'ulica', 'ulic'], 'ulice', 'Feminine -a becomes -y, -i or -e.'],
        ['___ domy są duże.', 'These houses are big.', ['Te', 'Ten', 'Ta'], 'Te'],
      ],
      spotlight: {
        title: 'Plurals of things',
        body: [
          'For things, animals and women, plurals are simple. Masculine and feminine nouns end in **-y** or **-i** (often **-e** after soft consonants: {ulice}); neuter **-o** and **-e** become **-a**.',
          'Adjectives and "this" follow: {nowe domy}, {te książki}. Groups that include men work differently; that comes in the B1 units.',
        ],
        table: {
          head: ['', 'one', 'more'],
          rows: [
            ['masculine', 'dom, samochód', 'domy, samochody'],
            ['feminine', 'książka, ulica', 'książki, ulice'],
            ['neuter', 'okno, krzesło', 'okna, krzesła'],
          ],
        },
      },
      dialogue: [
        ['Agentka', 'To mieszkanie ma trzy pokoje i duże okna.', 'This flat has three rooms and big windows.'],
        ['Kasia', 'A meble?', 'And the furniture?'],
        ['Agentka', 'Są nowe. Stoły, krzesła, wszystko.', "It's new. Tables, chairs, everything."],
        ['Kasia', 'Świetnie!', 'Great!'],
      ],
    }),
  ],
);

export const u21 = unit(
  21,
  'A1',
  'Weather & seasons',
  'Pogoda',
  "The safest start to any conversation, the seasons and months, and telling the time between the hours.",
  [
    lesson('u21-l1', "What's the weather like?", 'Talk about the weather.', {
      items: [
        ['pogoda', 'weather', { g: 'f' }],
        ['pada deszcz', "it's raining", { altEn: ['it is raining'], altPl: ['pada'] }],
        ['pada śnieg', "it's snowing", { altEn: ['it is snowing'] }],
        ['świeci słońce', "the sun's shining", { altEn: ["it's sunny", 'the sun is shining'] }],
        ['wieje wiatr', "it's windy", { altEn: ['the wind is blowing', 'it is windy'] }],
        ['ciepło', "it's warm", { altEn: ['warm', 'it is warm'] }],
        ['pochmurno', "it's cloudy", { altEn: ['cloudy', 'it is cloudy'] }],
        ['burza', 'storm', { altEn: ['thunderstorm'], g: 'f' }],
      ],
      sentences: [
        ['Jaka jest dzisiaj pogoda?', "What's the weather like today?", { altEn: ['What is the weather like today?', "How's the weather today?"], altPl: ['Jaka jest dziś pogoda?', 'Jaka jest pogoda dzisiaj?'], extra: ['jak', 'pogodę'] }],
        ['Pada deszcz i wieje wiatr.', "It's raining and it's windy.", { altEn: ['It is raining and windy.', "It's raining and windy."], extra: ['śnieg', 'słońce'] }],
        ['Jutro będzie ciepło i słonecznie.', "Tomorrow it'll be warm and sunny.", { altEn: ['It will be warm and sunny tomorrow.', 'Tomorrow will be warm and sunny.'], altPl: ['Jutro będzie słonecznie i ciepło.'], extra: ['jest', 'pochmurno'] }],
        ['Ale dzisiaj zimno!', "Isn't it cold today!", { altEn: ["It's so cold today!", "It's cold today!"], altPl: ['Ale dziś zimno!'], extra: ['ciepło', 'jest'] }],
      ],
      drills: [
        ['Dzisiaj ___ deszcz.', "It's raining today.", ['pada', 'padam', 'jest'], 'pada', 'Rain and snow "fall": pada deszcz, pada śnieg.'],
        ['Jutro ___ słonecznie.', "It'll be sunny tomorrow.", ['będzie', 'jest', 'było'], 'będzie'],
        ['Wczoraj ___ zimno.', 'It was cold yesterday.', ['było', 'był', 'była'], 'było', 'Weather words take the neuter: było zimno.'],
      ],
      spotlight: {
        title: 'Weather without "it"',
        body: [
          'Polish describes weather with an adverb and no "it": {Jest ciepło} (it is warm), {Było zimno} (it was cold), {Będzie pochmurno} (it will be cloudy). The verb is always the neuter "it" form.',
          'Rain and snow "fall" ({pada deszcz}, {pada śnieg}), the sun "shines" ({świeci słońce}) and the wind "blows" ({wieje wiatr}). {Ale zimno!} is the everyday "isn\'t it cold!".',
        ],
      },
      dialogue: [
        ['Pani Nowak', 'Dzień dobry! Ale dzisiaj zimno!', "Good morning! Isn't it cold today!"],
        ['Pan Smith', 'Tak, i pada deszcz. Jak w Anglii!', "Yes, and it's raining. Just like England!"],
        ['Pani Nowak', 'Podobno jutro będzie ciepło.', "Apparently it'll be warm tomorrow."],
        ['Pan Smith', 'Mam nadzieję!', 'I hope so!'],
      ],
    }),
    lesson('u21-l2', 'Seasons and months', 'Name the seasons and months, and say "in winter" and "in May".', {
      items: [
        ['wiosna', 'spring', { g: 'f' }],
        ['lato', 'summer', { g: 'n' }],
        ['jesień', 'autumn', { altEn: ['fall'], g: 'f', hint: 'Feminine, though it ends in a consonant.' }],
        ['zima', 'winter', { g: 'f' }],
        ['latem', 'in summer', { altEn: ['in the summer'], hint: 'Seasons in the instrumental mean "in": wiosną, latem, jesienią, zimą.' }],
        ['zimą', 'in winter', { altEn: ['in the winter'], key: 'zima-in' }],
        ['styczeń', 'January', { g: 'm' }],
        ['maj', 'May', { g: 'm' }],
        ['w lipcu', 'in July'],
      ],
      sentences: [
        ['Zimą jest bardzo zimno.', "In winter it's very cold.", { altEn: ["It's very cold in winter.", 'In winter it is very cold.'], altPl: ['W zimie jest bardzo zimno.'], extra: ['zima', 'ciepło'] }],
        ['Latem jeździmy nad morze.', 'In summer we go to the seaside.', { altEn: ['In the summer we go to the seaside.', 'We go to the seaside in summer.'], extra: ['lato', 'jedziemy'] }],
        ['Mam urodziny w maju.', 'My birthday is in May.', { altEn: ['I have my birthday in May.'], extra: ['maj', 'urodzin'] }],
        ['Jesienią często pada.', 'It often rains in autumn.', { altEn: ['In autumn it often rains.', 'It rains a lot in autumn.'], extra: ['jesień', 'nigdy'] }],
      ],
      drills: [
        ['___ jest gorąco.', "It's hot in summer.", ['Latem', 'Lato', 'Lata'], 'Latem', 'In a season: the instrumental. latem, zimą, wiosną, jesienią.'],
        ['w ___', 'in January', ['styczniu', 'styczeń', 'stycznia'], 'styczniu', 'w + month: the locative. styczeń → w styczniu.'],
        ['w ___', 'in May', ['maju', 'maj', 'maja'], 'maju'],
      ],
      spotlight: {
        title: 'In winter, in May',
        body: [
          'Seasons need no preposition: the instrumental alone means "in": {zimą}, {wiosną}, {latem}, {jesienią}. You will also hear {w zimie} and {w lecie}.',
          'Months take {w} + locative: {w styczniu}, {w maju}, {w lipcu}. They are written with a small letter, and most come from nature: {lipiec} from the lime tree ({lipa}), {listopad} from "falling leaves".',
        ],
        table: {
          head: ['Month', 'In…'],
          rows: [
            ['styczeń', 'w styczniu'],
            ['luty', 'w lutym'],
            ['marzec', 'w marcu'],
            ['kwiecień', 'w kwietniu'],
            ['maj', 'w maju'],
            ['czerwiec', 'w czerwcu'],
            ['lipiec', 'w lipcu'],
            ['sierpień', 'w sierpniu'],
            ['wrzesień', 'we wrześniu'],
            ['październik', 'w październiku'],
            ['listopad', 'w listopadzie'],
            ['grudzień', 'w grudniu'],
          ],
        },
      },
      dialogue: [
        ['Marta', 'Kiedy przyjedziesz do Polski?', 'When will you come to Poland?'],
        ['Ben', 'Chyba w lipcu. Latem jest ładnie, prawda?', "Probably in July. It's lovely in summer, isn't it?"],
        ['Marta', 'Tak, ale zimą też! Jest śnieg i jarmarki świąteczne.', 'Yes, but in winter too! There is snow and there are Christmas markets.'],
        ['Ben', 'To może przyjadę w grudniu.', "Then maybe I'll come in December."],
      ],
    }),
    lesson('u21-l3', 'Half past, quarter to', 'Tell the time between the hours.', {
      items: [
        ['wpół do', 'half past', { hint: 'Half "to" the next hour: {wpół do trzeciej} is 2:30.' }],
        ['kwadrans', 'quarter of an hour', { altEn: ['a quarter', 'quarter'], g: 'm' }],
        ['kwadrans po', 'quarter past'],
        ['za kwadrans', 'quarter to'],
        ['za pięć', 'five to'],
        ['dziesięć po', 'ten past'],
        ['punktualnie', 'on time', { altEn: ['sharp', 'punctually'] }],
        ['spóźniony', 'late', { altEn: ['delayed (a person)'] }],
      ],
      sentences: [
        ['Jest wpół do trzeciej.', "It's half past two.", { altEn: ["It's two thirty.", 'It is half past two.'], extra: ['trzecia', 'druga'] }],
        ['Spotkajmy się kwadrans po ósmej.', "Let's meet at quarter past eight.", { altEn: ["Let's meet at a quarter past eight."], extra: ['ósma', 'za'] }],
        ['Jest za kwadrans szósta.', "It's quarter to six.", { altEn: ["It's a quarter to six.", 'It is quarter to six.'], extra: ['szóstej', 'po'] }],
        ['Przepraszam, jestem spóźniony.', "Sorry, I'm late.", { altPl: ['Przepraszam, jestem spóźniona.'], altEn: ['Sorry, I am late.'], extra: ['późno', 'jest'] }],
      ],
      drills: [
        ['Jest wpół do ___.', "It's half past two (2:30).", ['trzeciej', 'drugiej', 'trzecia'], 'trzeciej', 'wpół do + the NEXT hour: 2:30 is "half to the third".'],
        ['Jest kwadrans po ___.', "It's quarter past eight.", ['ósmej', 'ósma', 'osiem'], 'ósmej', 'po takes the -ej form of the hour.'],
        ['Jest za kwadrans ___.', "It's quarter to six.", ['szósta', 'szóstej', 'sześć'], 'szósta', 'za kwadrans + the plain hour.'],
      ],
      spotlight: {
        title: 'Between the hours',
        body: [
          '**Half past** counts towards the next hour: {wpół do czwartej} is "half to the fourth", 3:30. English speakers get this wrong for years, so check twice.',
          '{Kwadrans po piątej} is 5:15 and {za kwadrans szósta} is 5:45. Minutes work the same way: {dziesięć po drugiej}, {za pięć trzecia}. With the 24-hour clock, just say the numbers: {piętnasta trzydzieści}.',
        ],
        table: {
          head: ['Time', 'Polish'],
          rows: [
            ['2:15', 'kwadrans po drugiej'],
            ['2:30', 'wpół do trzeciej'],
            ['2:45', 'za kwadrans trzecia'],
            ['2:50', 'za dziesięć trzecia'],
            ['14:30', 'czternasta trzydzieści'],
          ],
        },
      },
      dialogue: [
        ['Kasia', 'O której zaczyna się film?', 'What time does the film start?'],
        ['Tom', 'Wpół do ósmej.', 'Half past seven.'],
        ['Kasia', 'To spotkajmy się kwadrans po siódmej.', "Then let's meet at quarter past seven."],
        ['Tom', 'Dobrze. Tylko się nie spóźnij!', "OK. Just don't be late!"],
      ],
    }),
  ],
);

export const u22 = unit(
  22,
  'A2',
  'Free time',
  'Czas wolny',
  'Hobbies, invitations and saying no nicely, and the Monday-morning question: how was your weekend?',
  [
    lesson('u22-l1', 'Hobbies', 'Say what you like doing and what you are into.', {
      items: [
        ['interesuję się', "I'm interested in", { altEn: ["i'm into", 'i am interested in'], hint: 'Takes the instrumental: {interesuję się muzyką}.' }],
        ['gram w piłkę', 'I play football', { altEn: ['i play soccer', "i'm playing football"] }],
        ['gram na gitarze', 'I play the guitar', { altEn: ['i play guitar'] }],
        ['biegam', 'I run', { altEn: ['i go running', 'i jog'] }],
        ['pływam', 'I swim', { altEn: ['i go swimming'] }],
        ['czas wolny', 'free time', { altEn: ['spare time'], g: 'm' }],
        ['chętnie', 'gladly', { altEn: ["i'd love to", 'happily', 'willingly'] }],
        ['nudny', 'boring', { altEn: ['dull'] }],
      ],
      sentences: [
        ['Interesuję się historią i muzyką.', "I'm interested in history and music.", { altEn: ["I'm into history and music.", 'I am interested in history and music.'], extra: ['historia', 'muzyka'] }],
        ['W weekendy gram w piłkę z kolegami.', 'At weekends I play football with my mates.', { altEn: ['At weekends I play football with friends.', 'I play football with my mates at the weekend.'], extra: ['piłka', 'na'] }],
        ['Lubię czytać, ale nie lubię biegać.', "I like reading, but I don't like running.", { altEn: ["I like to read, but I don't like to run.", "I like reading but I don't like running."], extra: ['czytam', 'biegam'] }],
        ['Co robisz w wolnym czasie?', 'What do you do in your free time?', { altEn: ['What do you do in your spare time?'], extra: ['wolny', 'czas'] }],
      ],
      drills: [
        ['Interesuję się ___.', "I'm interested in sport.", ['sportem', 'sport', 'sportu'], 'sportem', 'interesować się + instrumental.'],
        ['Gram ___ tenisa.', 'I play tennis.', ['w', 'na', 'z'], 'w', 'Games and sports: grać w + accusative.'],
        ['Gram ___ pianinie.', 'I play the piano.', ['na', 'w', 'z'], 'na', 'Instruments: grać na + locative.'],
        ['Lubię ___.', 'I like swimming.', ['pływać', 'pływam', 'pływa'], 'pływać', 'lubię + infinitive: I like doing something.'],
      ],
      spotlight: {
        title: 'Playing in, playing on',
        body: [
          'Polish splits "play": games and sports take {grać w} + accusative ({gram w piłkę}, {w tenisa}, {w szachy}); instruments take {grać na} + locative ({gram na gitarze}, {na pianinie}).',
          'To say what you like doing, put an infinitive after {lubię}: {lubię pływać}. What you are into takes {interesuję się} + instrumental: {interesuję się sztuką}.',
        ],
      },
      dialogue: [
        ['Piotr', 'Co robisz w wolnym czasie?', 'What do you do in your free time?'],
        ['Emma', 'Biegam i gram na gitarze. A ty?', 'I run and play the guitar. And you?'],
        ['Piotr', 'Interesuję się fotografią. I w niedziele gram w piłkę.', "I'm into photography. And I play football on Sundays."],
        ['Emma', 'Super! Może kiedyś zagramy razem?', 'Great! Maybe we could play together some time?'],
      ],
    }),
    lesson('u22-l2', 'Making plans', 'Invite, accept and politely say no.', {
      items: [
        ['masz ochotę na…?', 'do you fancy…?', { altEn: ['do you feel like', 'would you like'] }],
        ['jestem umówiony', "I've got plans", { altPl: ['jestem umówiona'], altEn: ['i have plans', "i've arranged to meet someone"] }],
        ['nie dam rady', "I can't make it", { altEn: ["i won't manage", "i can't"] }],
        ['innym razem', 'another time', { altEn: ['some other time'] }],
        ['pasuje ci?', 'does it suit you?', { altEn: ['does that work for you?', 'is that ok for you?'] }],
        ['umówmy się', "let's arrange to meet", { altEn: ["let's meet", "let's make a date"] }],
        ['świetny pomysł', 'great idea', { altEn: ["that's a great idea", 'good idea'] }],
        ['spotkanie', 'meeting', { g: 'n' }],
      ],
      sentences: [
        ['Masz ochotę na kawę po pracy?', 'Do you fancy a coffee after work?', { altEn: ['Would you like a coffee after work?', 'Do you feel like a coffee after work?'], extra: ['mam', 'kawa'] }],
        ['Przykro mi, dziś nie dam rady. Może innym razem?', "Sorry, I can't make it today. Maybe another time?", { altEn: ["I'm sorry, I can't make it today. Maybe another time?", "Sorry, I can't today. Maybe some other time?"], altPl: ['Przykro mi, dzisiaj nie dam rady. Może innym razem?'], extra: ['raz', 'mogę'] }],
        ['Pasuje ci sobota o szóstej?', 'Does Saturday at six suit you?', { altEn: ['Does Saturday at six work for you?', 'Is Saturday at six OK for you?'], extra: ['pasuję', 'sobotę'] }],
        ['Jestem umówiona z Kasią.', "I'm meeting Kasia.", { altPl: ['Jestem umówiony z Kasią.'], altEn: ["I've arranged to meet Kasia.", 'I have plans with Kasia.'], extra: ['Kasia', 'umówmy'] }],
      ],
      drills: [
        ['Masz ochotę ___ pizzę?', 'Do you fancy a pizza?', ['na', 'do', 'w'], 'na', 'ochota na + accusative.'],
        ['Przepraszam, jestem ___ (a woman).', "Sorry, I've got plans.", ['umówiona', 'umówiony', 'umówione'], 'umówiona'],
        ['Czy ___ ci piątek?', 'Does Friday suit you?', ['pasuje', 'pasuję', 'pasujesz'], 'pasuje', 'The day does the suiting, so the verb agrees with the day.'],
      ],
      spotlight: {
        title: 'Saying no nicely',
        body: [
          'Poles rarely give an invitation a flat "no". Soften it: {Przykro mi, nie dam rady} (sorry, I can\'t make it), {Może innym razem?} (another time?), {Jestem już umówiony} (I\'ve already got plans).',
          'To accept: {Chętnie!} (gladly), {Świetny pomysł!} (great idea), {Pasuje mi} (that suits me).',
        ],
      },
      dialogue: [
        ['Ola', 'Masz ochotę na kino w piątek?', 'Do you fancy the cinema on Friday?'],
        ['Jack', 'Przykro mi, w piątek jestem umówiony. Pasuje ci sobota?', "Sorry, I've got plans on Friday. Does Saturday suit you?"],
        ['Ola', 'Tak, sobota mi pasuje. O której?', 'Yes, Saturday suits me. What time?'],
        ['Jack', 'Umówmy się o siódmej przed kinem.', "Let's meet at seven outside the cinema."],
        ['Ola', 'Świetny pomysł! Do soboty!', 'Great idea! See you on Saturday!'],
      ],
    }),
    lesson('u22-l3', 'How was your weekend?', 'Talk about what you did, the Monday-morning way.', {
      items: [
        ['jak minął weekend?', 'how was the weekend?', { altEn: ['how was your weekend?'] }],
        ['byłem na koncercie', 'I went to a concert', { altPl: ['byłam na koncercie'], altEn: ['i was at a concert'] }],
        ['odpoczywałem', 'I was resting', { altPl: ['odpoczywałam'], altEn: ['i rested', 'i relaxed'] }],
        ['wyjechałem', 'I went away', { altPl: ['wyjechałam'], altEn: ['i left'] }],
        ['nad morze', 'to the seaside', { altEn: ['to the sea', 'to the coast'] }],
        ['w góry', 'to the mountains'],
        ['było super', 'it was great', { altEn: ['it was brilliant', 'it was fantastic'] }],
        ['nic ciekawego', 'nothing interesting', { altEn: ['nothing special'] }],
      ],
      sentences: [
        ['Jak minął weekend?', 'How was the weekend?', { altEn: ['How was your weekend?'], extra: ['minie', 'tydzień'] }],
        ['W sobotę byłem na koncercie. Było super!', 'On Saturday I went to a concert. It was great!', { altPl: ['W sobotę byłam na koncercie. Było super!'], altEn: ['On Saturday I was at a concert. It was great!', 'I went to a concert on Saturday. It was great!'], extra: ['koncert', 'jest'] }],
        ['Wyjechaliśmy w góry.', 'We went away to the mountains.', { altPl: ['Wyjechałyśmy w góry.'], altEn: ['We went to the mountains.'], extra: ['górach', 'nad'] }],
        ['Nic ciekawego, odpoczywałam w domu.', 'Nothing interesting, I was resting at home.', { altPl: ['Nic ciekawego, odpoczywałem w domu.'], altEn: ['Nothing special, I rested at home.', 'Nothing interesting, I rested at home.'], extra: ['ciekawy', 'dom'] }],
      ],
      drills: [
        ['Byłam ___ koncercie.', 'I went to a concert.', ['na', 'w', 'do'], 'na', 'Events take na: na koncercie, na meczu, na weselu.'],
        ['Pojechaliśmy ___ morze.', 'We went to the seaside.', ['nad', 'na', 'do'], 'nad', 'The sea and lakes: nad morze (where to), nad morzem (where).'],
        ['W weekend ___ (a man) w domu.', 'I was resting at home at the weekend.', ['odpoczywałem', 'odpoczywałam', 'odpoczywam'], 'odpoczywałem'],
      ],
      spotlight: {
        title: 'Where to, and where',
        body: [
          'Holiday places have fixed prepositions: {nad morze} / {nad morzem} (to / at the seaside), {w góry} / {w górach} (to / in the mountains), {na wieś} / {na wsi} (to / in the countryside).',
          '{Jak minął weekend?} ("how did the weekend pass?") is the Monday-morning question at every Polish workplace.',
        ],
      },
      dialogue: [
        ['Szef', 'Dzień dobry! Jak minął weekend?', 'Good morning! How was the weekend?'],
        ['Emma', 'Świetnie, dziękuję. Byliśmy nad morzem.', 'Great, thanks. We were at the seaside.'],
        ['Szef', 'Pogoda była dobra?', 'Was the weather good?'],
        ['Emma', 'Nie bardzo, ale było super!', 'Not really, but it was great!'],
      ],
    }),
  ],
);

export const u23 = unit(
  23,
  'A2',
  'Do it!',
  'Tryb rozkazujący',
  'Commands: to a friend, politely to a stranger, and "don\'t" and "let\'s".',
  [
    lesson('u23-l1', 'Commands to a friend', 'Tell a friend what to do.', {
      items: [
        ['chodź', 'come here', { altEn: ['come', 'come on'], hint: 'From chodzić: {Chodź tu!} (come here!)' }],
        ['idź', 'go', { altEn: ['go away', 'walk'] }],
        ['weź', 'take', { altEn: ['take it', 'grab'] }],
        ['daj', 'give', { altEn: ['give me'] }],
        ['zrób', 'do', { altEn: ['make', 'do it'] }],
        ['czekaj', 'wait', { altEn: ['hang on', 'hold on'] }],
        ['powiedz', 'tell', { altEn: ['say', 'tell me'] }],
        ['słuchaj', 'listen', { altEn: ['listen to me'] }],
      ],
      sentences: [
        ['Chodź tu, szybko!', 'Come here, quickly!', { altEn: ['Come here, fast!', 'Come here quickly!'], extra: ['idź', 'szybki'] }],
        ['Daj mi to, proszę.', 'Give me that, please.', { altEn: ['Give it to me, please.', 'Please give me that.'], altPl: ['Proszę, daj mi to.'], extra: ['dam', 'ja'] }],
        ['Powiedz mi prawdę.', 'Tell me the truth.', { extra: ['powiem', 'prawda'] }],
        ['Czekaj, zadzwonię do mamy.', "Wait, I'll ring Mum.", { altEn: ["Hang on, I'll call Mum.", "Wait, I'll call my mum."], extra: ['czekam', 'dzwonię'] }],
      ],
      drills: [
        ['___ tu!', 'Come here!', ['Chodź', 'Chodzisz', 'Chodzić'], 'Chodź'],
        ['___ mi to!', 'Give me that!', ['Daj', 'Dajesz', 'Dać'], 'Daj'],
        ['___ to jutro.', 'Do it tomorrow.', ['Zrób', 'Zrobisz', 'Zrobić'], 'Zrób', 'The imperative: start from the "they" form and drop the ending. zrobią → zrób.'],
        ['___ mnie!', 'Listen to me!', ['Słuchaj', 'Słuchasz', 'Słuchać'], 'Słuchaj'],
      ],
      spotlight: {
        title: 'The imperative for ty',
        body: [
          'Start from the "they" form and drop the ending: {czytają} → {czytaj}, {robią} → {rób}, {piszą} → {pisz}. Most -ać verbs end in **-aj**: {czekaj}, {słuchaj}.',
          'A few are short and irregular: {chodź} (come), {idź} (go), {weź} (take), {daj} (give), {jedz} (eat). Between friends, commands are normal, not rude; {proszę} softens them.',
        ],
        table: {
          head: ['Infinitive', 'they…', 'Do it!'],
          rows: [
            ['czytać', 'czytają', 'czytaj'],
            ['robić', 'robią', 'rób'],
            ['pisać', 'piszą', 'pisz'],
            ['czekać', 'czekają', 'czekaj'],
            ['pomóc', 'pomogą', 'pomóż'],
          ],
        },
      },
      dialogue: [
        ['Mama', 'Tomek, chodź tu!', 'Tomek, come here!'],
        ['Tomek', 'Czekaj, mamo, czytam!', "Hang on, Mum, I'm reading!"],
        ['Mama', 'Zrób to później. Pomóż mi, proszę.', 'Do it later. Help me, please.'],
        ['Tomek', 'Dobrze, już idę.', "OK, I'm coming."],
      ],
    }),
    lesson('u23-l2', 'Please sit down', 'Understand and give polite instructions with proszę.', {
      items: [
        ['proszę usiąść', 'please sit down', { altEn: ['please take a seat', 'have a seat'] }],
        ['proszę wejść', 'please come in', { altEn: ['come in'] }],
        ['proszę poczekać', 'please wait', { altEn: ['please hold on', 'wait please'] }],
        ['proszę podpisać', 'please sign', { altEn: ['sign here please'] }],
        ['proszę pokazać', 'please show', { altEn: ['please show me'] }],
        ['proszę spojrzeć', 'please look', { altEn: ['have a look'] }],
        ['proszę się nie martwić', "please don't worry"],
      ],
      sentences: [
        ['Dzień dobry, proszę wejść i usiąść.', 'Hello, please come in and sit down.', { altEn: ['Good morning, please come in and sit down.', 'Hello, come in and sit down, please.', 'Hello, please come in and take a seat.'], extra: ['wchodzę', 'siedzieć'] }],
        ['Proszę tu podpisać.', 'Please sign here.', { altEn: ['Sign here, please.'], extra: ['podpis', 'tam'] }],
        ['Proszę chwilę poczekać.', 'Please wait a moment.', { altEn: ['Please wait a minute.', 'Wait a moment, please.'], extra: ['czekam', 'chwila'] }],
        ['Proszę pokazać paszport.', 'Please show your passport.', { altEn: ['Your passport, please.', 'Please show me your passport.'], extra: ['pokaż', 'paragon'] }],
      ],
      drills: [
        ['Proszę ___.', 'Please sit down.', ['usiąść', 'usiądź', 'siadam'], 'usiąść', 'Polite requests: proszę + infinitive.'],
        ['___ tu podpisać.', 'Please sign here.', ['Proszę', 'Prosi', 'Proszą'], 'Proszę'],
        ['Proszę się nie ___.', "Please don't worry.", ['martwić', 'martwi', 'martw'], 'martwić'],
      ],
      spotlight: {
        title: 'Commands to strangers',
        body: [
          'To someone you call {pan} or {pani}, the polite command is simply {proszę} + infinitive: {Proszę usiąść}, {Proszę tu podpisać}. It is what doctors, officials and shop staff say to you.',
          'You will also hear {Niech pan usiądzie} ("let the gentleman sit"): very polite and a little old-fashioned. Understanding it is enough.',
        ],
      },
      dialogue: [
        ['Recepcjonistka', 'Dzień dobry. Proszę wejść.', 'Good morning. Please come in.'],
        ['Pan Smith', 'Dzień dobry. Mam rezerwację na nazwisko Smith.', 'Good morning. I have a booking in the name of Smith.'],
        ['Recepcjonistka', 'Proszę chwilę poczekać. Tak, jest. Proszę pokazać paszport i tu podpisać.', 'Please wait a moment. Yes, here it is. Please show your passport and sign here.'],
        ['Pan Smith', 'Proszę bardzo.', 'Here you are.'],
      ],
    }),
    lesson('u23-l3', "Don't, and let's", 'Say "don\'t" and "let\'s".', {
      items: [
        ['nie martw się', "don't worry"],
        ['nie przejmuj się', "don't let it bother you", { altEn: ['never mind', "don't take it to heart"] }],
        ['uważaj!', 'be careful!', { altEn: ['watch out!', 'look out!', 'careful!'] }],
        ['nie zapomnij', "don't forget"],
        ['chodźmy', "let's go", { altEn: ['come on'] }],
        ['zróbmy to', "let's do it", { altEn: ["let's do this"] }],
        ['zobaczmy', "let's see", { altEn: ["let's have a look"] }],
        ['spokojnie', 'calm down', { altEn: ['take it easy', 'relax', 'easy'] }],
      ],
      sentences: [
        ['Nie martw się, wszystko będzie dobrze.', "Don't worry, everything will be fine.", { altEn: ["Don't worry, it'll be OK.", "Don't worry, everything will be OK."], extra: ['martwię', 'jest'] }],
        ['Uważaj, tu jest ślisko!', "Careful, it's slippery here!", { altEn: ["Watch out, it's slippery here!"], extra: ['uważam', 'tam'] }],
        ['Chodźmy na spacer.', "Let's go for a walk.", { extra: ['chodź', 'spacerem'] }],
        ['Nie zapomnij kluczy!', "Don't forget your keys!", { altEn: ["Don't forget the keys!"], extra: ['klucze', 'zapomnę'] }],
      ],
      drills: [
        ['Nie ___ się!', "Don't worry!", ['martw', 'martwisz', 'martwić'], 'martw'],
        ['Nie ___ tego!', "Don't do that!", ['rób', 'zrób', 'robić'], 'rób', '"Don\'t" usually takes the imperfective: nie rób, not nie zrób.'],
        ['___ na pizzę!', "Let's go for pizza!", ['Chodźmy', 'Chodź', 'Chodzimy'], 'Chodźmy', "Let's: the imperative + -my."],
      ],
      spotlight: {
        title: "Don't, and let's",
        body: [
          '"Don\'t" is {nie} + the imperative, usually the **imperfective**: {nie rób tego} (don\'t do that), {nie mów nikomu} (don\'t tell anyone). You will hear {nie martw się} and {nie przejmuj się} every day.',
          '"Let\'s" adds **-my** to the imperative: {chodźmy}, {zróbmy}, {zobaczmy}, {jedźmy}.',
        ],
      },
      dialogue: [
        ['Kasia', 'Spóźnimy się na pociąg!', "We'll be late for the train!"],
        ['Adam', 'Spokojnie, mamy jeszcze dwadzieścia minut.', 'Calm down, we still have twenty minutes.'],
        ['Kasia', 'Dobrze, ale chodźmy już. I nie zapomnij biletów!', "OK, but let's go now. And don't forget the tickets!"],
        ['Adam', 'Nie martw się, mam je.', "Don't worry, I've got them."],
      ],
    }),
  ],
);

export const u24 = unit(
  24,
  'A2',
  'Health',
  'Zdrowie',
  "Say what hurts, see a doctor, and get what you need at the chemist's.",
  [
    lesson('u24-l1', 'What hurts?', 'Name parts of the body and say what hurts.', {
      items: [
        ['głowa', 'head', { g: 'f' }],
        ['brzuch', 'stomach', { altEn: ['tummy', 'belly'], g: 'm' }],
        ['gardło', 'throat', { g: 'n' }],
        ['plecy', 'back', { g: 'pl', hint: 'Plural in Polish: {bolą mnie plecy}.' }],
        ['noga', 'leg', { altEn: ['foot'], g: 'f' }],
        ['ząb', 'tooth', { g: 'm' }],
        ['boli mnie', 'it hurts', { altEn: ['i have a pain'], hint: 'Literally "(it) hurts me": {Boli mnie głowa}.' }],
        ['bolą mnie', 'they hurt', { hint: 'For plural body parts: {Bolą mnie plecy}.' }],
      ],
      sentences: [
        ['Boli mnie głowa.', 'I have a headache.', { altEn: ['My head hurts.', "I've got a headache."], extra: ['bolą', 'głowę'] }],
        ['Od wczoraj boli mnie gardło.', "I've had a sore throat since yesterday.", { altEn: ['My throat has been hurting since yesterday.'], extra: ['bolą', 'gardła'] }],
        ['Bolą mnie plecy.', 'My back hurts.', { altEn: ['I have backache.', "I've got a bad back.", 'I have back pain.'], extra: ['boli', 'plecami'] }],
        ['Co cię boli?', 'What hurts?', { altEn: ['Where does it hurt?', 'What is hurting you?'], extra: ['ciebie', 'bolą'] }],
      ],
      drills: [
        ['___ mnie brzuch.', 'I have a stomach ache.', ['Boli', 'Bolą', 'Bolę'], 'Boli', 'The body part is the subject: one part → boli.'],
        ['___ mnie nogi.', 'My legs hurt.', ['Bolą', 'Boli', 'Bolę'], 'Bolą', 'Plural body parts → bolą.'],
        ['Boli ___ ząb.', 'I have toothache.', ['mnie', 'mi', 'ja'], 'mnie', 'boleć takes the accusative: boli mnie, boli cię, boli go.'],
      ],
      spotlight: {
        title: 'My head hurts me',
        body: [
          'Polish says "the head hurts me": {Boli mnie głowa}. The body part is the subject, so plural parts take {bolą}: {Bolą mnie plecy}. The person is in the accusative: {mnie}, {cię}, {go}, {ją}.',
          'A doctor or a friend will ask {Co cię boli?} (what hurts?) or, formally, {Co pana boli?} / {Co panią boli?}',
        ],
      },
      dialogue: [
        ['Mama', 'Co ci jest? Jesteś blada.', "What's wrong? You're pale."],
        ['Ola', 'Boli mnie brzuch i głowa.', 'My stomach and head hurt.'],
        ['Mama', 'Może masz gorączkę? Połóż się.', 'Maybe you have a temperature? Lie down.'],
        ['Ola', 'Dobrze, mamo.', 'OK, Mum.'],
      ],
    }),
    lesson('u24-l2', "At the doctor's", 'Book an appointment and describe your symptoms.', {
      items: [
        ['przychodnia', 'surgery', { altEn: ['clinic', 'health centre', "doctor's surgery"], g: 'f', hint: 'Your local health centre, where the family doctor works.' }],
        ['wizyta', 'appointment', { altEn: ['visit'], g: 'f' }],
        ['gorączka', 'temperature', { altEn: ['fever', 'a temperature'], g: 'f' }],
        ['katar', 'runny nose', { altEn: ['a runny nose', 'a cold'], g: 'm' }],
        ['kaszel', 'cough', { altEn: ['a cough'], g: 'm' }],
        ['jestem przeziębiony', "I've got a cold", { altPl: ['jestem przeziębiona'], altEn: ['i have a cold'] }],
        ['recepta', 'prescription', { g: 'f' }],
        ['od kiedy?', 'since when?', { altEn: ['how long?', 'for how long?'] }],
      ],
      sentences: [
        ['Chciałbym się zapisać na wizytę.', "I'd like to make an appointment.", { altPl: ['Chciałabym się zapisać na wizytę.'], altEn: ['I would like to book an appointment.', "I'd like to book an appointment."], extra: ['wizyty', 'chcę'] }],
        ['Mam gorączkę i kaszel.', 'I have a temperature and a cough.', { altEn: ["I've got a temperature and a cough.", 'I have a fever and a cough.'], extra: ['gorączka', 'kaszlu'] }],
        ['Od kiedy ma pan katar?', 'How long have you had a runny nose?', { altEn: ['Since when have you had a runny nose?', 'How long have you had a cold?'], extra: ['jak', 'katarem'] }],
        ['Dam panu receptę.', "I'll give you a prescription.", { altEn: ["I'll write you a prescription."], extra: ['recepta', 'pan'] }],
      ],
      drills: [
        ['Mam ___.', 'I have a temperature.', ['gorączkę', 'gorączka', 'gorączki'], 'gorączkę', 'mieć + accusative.'],
        ['Jestem ___ (a woman).', "I've got a cold.", ['przeziębiona', 'przeziębiony', 'przeziębione'], 'przeziębiona'],
        ['Chciałbym się zapisać ___ wizytę.', "I'd like to book an appointment.", ['na', 'do', 'w'], 'na'],
      ],
      spotlight: {
        title: 'Seeing a doctor in Poland',
        body: [
          'Your first stop is a family doctor ({lekarz rodzinny}) at the local {przychodnia}. You book a {wizyta}, often by phone or online. Prescriptions are usually electronic: an {e-recepta} arrives as a text message with a four-digit code to give at any chemist.',
          'The emergency number is 112. For something urgent that is not an emergency, evenings and weekends, there is {nocna i świąteczna opieka zdrowotna}, the out-of-hours service.',
        ],
      },
      dialogue: [
        ['Lekarka', 'Dzień dobry. Co panu dolega?', "Good morning. What's the problem?"],
        ['Pacjent', 'Mam gorączkę i boli mnie gardło.', 'I have a temperature and a sore throat.'],
        ['Lekarka', 'Od kiedy?', 'Since when?'],
        ['Pacjent', 'Od wczoraj. I mam kaszel.', 'Since yesterday. And I have a cough.'],
        ['Lekarka', 'To przeziębienie. Dam panu receptę.', "It's a cold. I'll give you a prescription."],
      ],
    }),
    lesson('u24-l3', "At the chemist's", 'Buy medicine and understand the instructions.', {
      items: [
        ['lek', 'medicine', { altEn: ['drug', 'medication'], g: 'm' }],
        ['tabletki', 'tablets', { altEn: ['pills'], g: 'pl' }],
        ['coś na…', 'something for…', { altEn: ['something for'] }],
        ['bez recepty', 'without a prescription', { altEn: ['over the counter'] }],
        ['dwa razy dziennie', 'twice a day', { altEn: ['two times a day', 'twice daily'] }],
        ['przed jedzeniem', 'before meals', { altEn: ['before eating', 'before food'] }],
        ['po jedzeniu', 'after meals', { altEn: ['after eating', 'after food'] }],
        ['syrop', 'syrup', { altEn: ['cough syrup'], g: 'm' }],
      ],
      sentences: [
        ['Poproszę coś na ból głowy.', 'Something for a headache, please.', { altEn: ["I'd like something for a headache.", 'Could I have something for a headache?'], extra: ['boli', 'głowa'] }],
        ['Czy ten lek jest bez recepty?', 'Is this medicine available without a prescription?', { altEn: ['Is this medicine over the counter?', 'Can I get this medicine without a prescription?'], altPl: ['Ten lek jest bez recepty?'], extra: ['recepta', 'leki'] }],
        ['Proszę brać dwa razy dziennie po jedzeniu.', 'Take it twice a day after meals.', { altEn: ['Please take it twice a day after meals.', 'Take twice a day after food.'], extra: ['biorę', 'przed'] }],
        ['Mam syrop na kaszel.', "I've got cough syrup.", { altEn: ['I have cough syrup.', 'I have some cough syrup.'], extra: ['kaszlu', 'syropu'] }],
      ],
      drills: [
        ['Poproszę coś ___ katar.', 'Something for a runny nose, please.', ['na', 'do', 'od'], 'na', 'Medicine for something: na + accusative.'],
        ['Proszę brać trzy razy ___.', 'Take it three times a day.', ['dziennie', 'dzień', 'dnia'], 'dziennie'],
        ['Proszę brać ___ jedzeniem.', 'Take it before meals.', ['przed', 'po', 'bez'], 'przed', 'przed + instrumental.'],
      ],
      spotlight: {
        title: 'Medicine for…',
        body: [
          'Medicine "for" a problem is {na} + accusative: {coś na gardło}, {syrop na kaszel}, {tabletki na ból głowy}.',
          'Instructions use {proszę} + infinitive: {Proszę brać dwa razy dziennie} (take twice a day). Polish chemists give plenty of advice, so describe what hurts and ask {Co pani poleca?} (what do you recommend?).',
        ],
      },
      dialogue: [
        ['Farmaceutka', 'Dzień dobry, w czym mogę pomóc?', 'Hello, how can I help?'],
        ['Klient', 'Poproszę coś na ból gardła.', 'Something for a sore throat, please.'],
        ['Farmaceutka', 'Te tabletki są bez recepty. Proszę brać trzy razy dziennie po jedzeniu.', 'These tablets are over the counter. Take them three times a day after meals.'],
        ['Klient', 'Dziękuję. Ile płacę?', 'Thank you. How much is that?'],
      ],
    }),
  ],
);

import { lesson, unit } from '../build';

export const u17 = unit(
  17,
  'B1',
  'Would you?',
  'Tryb przypuszczający',
  'The conditional: polite requests, wishes and "if I were you". Built from the past tense plus -by-.',
  [
    lesson('u17-l1', "I'd like, could you", 'Make polite requests with the conditional.', {
      items: [
        ['chciałbym', "I'd like", { altPl: ['chciałabym'], altEn: ['i would like'], hint: 'A woman says chciałabym.' }],
        ['chciałbyś', 'would you like', { altPl: ['chciałabyś'], altEn: ["would you like to"] }],
        ['mógłbyś', 'could you', { altPl: ['mogłabyś'], altEn: ['would you be able to'] }],
        ['czy mógłby pan', 'could you', { altEn: ['could you (sir)', 'could you, sir'], hint: 'Formal, to a man.' }],
        ['czy mogłaby pani', 'could you', { altEn: ['could you (madam)', 'could you, madam'], hint: 'Formal, to a woman.' }],
        ['wolałbym', "I'd prefer", { altPl: ['wolałabym'], altEn: ['i would prefer', "i'd rather", 'i would rather'] }],
        ['byłoby miło', 'it would be nice', { altEn: ["that'd be nice", 'that would be nice', 'it would be lovely'] }],
      ],
      sentences: [
        ['Chciałbym zarezerwować stolik.', "I'd like to book a table.", { altEn: ['I would like to book a table.', "I'd like to reserve a table."], altPl: ['Chciałabym zarezerwować stolik.'], extra: ['chcę', 'stolika'] }],
        ['Czy mógłby mi pan pomóc?', 'Could you help me?', { altEn: ['Could you help me, sir?', 'Would you be able to help me?'], altPl: ['Czy mogłaby mi pani pomóc?', 'Czy mógłby pan mi pomóc?', 'Mógłby mi pan pomóc?'], extra: ['może', 'mnie'] }],
        ['Wolałabym herbatę.', "I'd prefer tea.", { altEn: ['I would prefer tea.', "I'd rather have tea.", "I'd prefer a tea."], altPl: ['Wolałbym herbatę.'], extra: ['wolę', 'herbata'] }],
        ['Chcielibyśmy dwa bilety.', "We'd like two tickets.", { altEn: ['We would like two tickets.'], altPl: ['Chciałybyśmy dwa bilety.'], extra: ['chcemy', 'bilet'] }],
      ],
      drills: [
        ['(Tom) ___ kawę.', "Tom: I'd like a coffee.", ['Chciałbym', 'Chciałabym', 'Chcę by'], 'Chciałbym'],
        ['(Anna) ___ zapłacić kartą.', "Anna: I'd like to pay by card.", ['Chciałabym', 'Chciałbym', 'Chciała'], 'Chciałabym'],
        ['Czy ___ pani otworzyć okno?', 'Could you open the window, madam?', ['mogłaby', 'mógłby', 'mogła'], 'mogłaby'],
        ['Kasiu, ___ mi pomóc?', 'Kasia, could you help me?', ['mogłabyś', 'mógłbyś', 'możesz by'], 'mogłabyś'],
      ],
      spotlight: {
        title: 'The conditional: past + by',
        body: [
          'Take the past-tense form (without the person ending), add **-by-**, then the person ending: {chciał} → {chciałbym}. For a woman: {chciała} → {chciałabym}.',
          'It softens requests, just like English "would" and "could". In a shop, {chciałbym} is more polite than {chcę}.',
        ],
        table: {
          head: ['', 'man', 'woman'],
          rows: [
            ['I', 'chciałbym', 'chciałabym'],
            ['you', 'chciałbyś', 'chciałabyś'],
            ['he / she', 'chciałby', 'chciałaby'],
            ['we', 'chcielibyśmy', 'chciałybyśmy'],
            ['they', 'chcieliby', 'chciałyby'],
          ],
        },
      },
    }),
    lesson('u17-l2', 'If I had time…', 'Talk about hypotheticals with gdyby.', {
      items: [
        ['gdybym', 'if I', { altEn: ['if i were', 'if i had'] }],
        ['gdybym miał czas', 'if I had time', { altPl: ['gdybym miała czas'], altEn: ['if i had the time'] }],
        ['gdybym był tobą', 'if I were you', { altPl: ['gdybym była tobą'] }],
        ['na twoim miejscu', 'if I were you', { altEn: ['in your place', 'in your shoes'] }],
        ['pojechałbym', "I'd go", { altPl: ['pojechałabym'], altEn: ['i would go', "i'd travel"] }],
        ['zrobiłbym', "I'd do", { altPl: ['zrobiłabym'], altEn: ['i would do'] }],
        ['kupiłbym', "I'd buy", { altPl: ['kupiłabym'], altEn: ['i would buy'] }],
        ['wtedy', 'then', { altEn: ['at that time'] }],
      ],
      sentences: [
        ['Gdybym miał czas, pojechałbym do Polski.', "If I had time, I'd go to Poland.", { altEn: ['If I had time, I would go to Poland.', 'If I had the time, I would go to Poland.', "If I had the time, I'd go to Poland."], altPl: ['Gdybym miała czas, pojechałabym do Polski.'], extra: ['mam', 'jadę'] }],
        ['Na twoim miejscu zadzwoniłabym do niego.', "If I were you, I'd ring him.", { altEn: ["If I were you, I'd call him.", 'If I were you, I would call him.', 'In your place I would ring him.'], altPl: ['Na twoim miejscu zadzwoniłbym do niego.'], extra: ['dzwonię', 'on'] }],
        ['Co byś zrobił?', 'What would you do?', { altPl: ['Co byś zrobiła?', 'Co zrobiłbyś?', 'Co zrobiłabyś?'], extra: ['robisz', 'zrobię'] }],
        ['Gdyby było ciepło, poszlibyśmy na spacer.', "If it were warm, we'd go for a walk.", { altEn: ['If it was warm, we would go for a walk.', "If it was warm, we'd go for a walk.", 'If it were warm, we would go for a walk.'], altPl: ['Gdyby było ciepło, poszłybyśmy na spacer.'], extra: ['jest', 'idziemy'] }],
      ],
      drills: [
        ['Gdybym ___ pieniądze, kupiłbym dom.', 'If I had money, I would buy a house.', ['miał', 'mam', 'mieć'], 'miał', 'After gdybym, use the past-tense form.'],
        ['Gdybyś chciał, ___ ci.', 'If you wanted, I would help you.', ['pomógłbym', 'pomogę', 'pomagam'], 'pomógłbym'],
        ['Na twoim ___ nie czekałabym.', "If I were you, I wouldn't wait.", ['miejscu', 'miejsce', 'miejsca'], 'miejscu'],
      ],
      spotlight: {
        title: 'Gdyby: unreal conditions',
        body: [
          '{Gdyby} (if) carries the person ending itself: {gdybym} (if I), {gdybyś} (if you), {gdyby} (if he/she/it). The verb after it is in the plain past form: {Gdybym miał czas…}',
          'The result clause uses the conditional: {…pojechałbym do Polski}. Polish uses the same structure for "if I had" and "if I had had", so context decides.',
        ],
      },
    }),
    lesson('u17-l3', 'Sorting things out', 'Make requests and complaints in shops and offices.', {
      items: [
        ['czy mogę prosić o…?', 'could I have…?', { altEn: ['may i have', 'can i have', 'could i ask for'] }],
        ['przepraszam, że przeszkadzam', 'sorry to bother you', { altEn: ['sorry to disturb you'] }],
        ['to nie działa', "it doesn't work", { altEn: ["it's not working", 'it is not working', 'it does not work'] }],
        ['zwrócić', 'to return', { altEn: ['to give back', 'to take back'] }],
        ['czy można…?', 'is it possible to…?', { altEn: ['can one', 'can i', 'can you'] }],
        ['nie ma sprawy', 'no worries', { altEn: ['no problem', 'sure'] }],
        ['proszę bardzo', "you're very welcome", { altEn: ['here you go', 'there you go', 'you are welcome', 'go ahead'] }],
        ['reklamacja', 'complaint', { altEn: ['return', 'claim'], g: 'f', hint: 'A formal complaint about a faulty product.' }],
      ],
      sentences: [
        ['Czy mogę prosić o paragon?', 'Could I have the receipt, please?', { altEn: ['Could I have a receipt?', 'Can I have the receipt?', 'May I have a receipt?', 'Could I have the receipt?'], extra: ['paragonu', 'proszę'] }],
        ['Przepraszam, że przeszkadzam, ale mam pytanie.', "Sorry to bother you, but I've got a question.", { altEn: ['Sorry to bother you, but I have a question.', 'Sorry to disturb you, but I have a question.'], extra: ['pytania', 'nie'] }],
        ['Kupiłem ten telefon wczoraj i nie działa.', "I bought this phone yesterday and it doesn't work.", { altEn: ["I bought this phone yesterday and it's not working.", 'I bought this phone yesterday and it does not work.'], altPl: ['Kupiłam ten telefon wczoraj i nie działa.', 'Wczoraj kupiłem ten telefon i nie działa.', 'Wczoraj kupiłam ten telefon i nie działa.'], extra: ['kupuję', 'działam'] }],
        ['Chciałabym to zwrócić.', "I'd like to return this.", { altEn: ['I would like to return this.', "I'd like to return it.", "I'd like to bring this back."], altPl: ['Chciałbym to zwrócić.'], extra: ['zwracam', 'chcę'] }],
      ],
      dialogue: [
        ['Klientka', 'Dzień dobry. Przepraszam, że przeszkadzam.', "Hello. Sorry to bother you."],
        ['Sprzedawca', 'Nie ma sprawy. W czym mogę pomóc?', 'No worries. How can I help?'],
        ['Klientka', 'Kupiłam ten czajnik wczoraj i nie działa. Chciałabym go zwrócić.', "I bought this kettle yesterday and it doesn't work. I'd like to return it."],
        ['Sprzedawca', 'Czy ma pani paragon?', 'Do you have the receipt?'],
        ['Klientka', 'Tak, proszę bardzo.', 'Yes, here you go.'],
        ['Sprzedawca', 'Dziękuję. Wymienimy go na nowy.', "Thank you. We'll exchange it for a new one."],
      ],
    }),
  ],
);

export const u18 = unit(
  18,
  'B1',
  'Quantities',
  'Ile?',
  'How numbers change the noun after them, and how to ask for "a bit of", "a kilo of" and "a lot of".',
  [
    lesson('u18-l1', 'Two cats, five cats', 'Use nouns correctly after numbers.', {
      items: [
        ['dwie', 'two', { altEn: ['two (feminine)'], hint: 'Two with feminine nouns: dwie kawy.' }],
        ['dwoje dzieci', 'two children', { hint: 'Children use a special "collective" number.' }],
        ['dwa koty', 'two cats'],
        ['pięć kotów', 'five cats'],
        ['dwie kawy', 'two coffees'],
        ['pięć kaw', 'five coffees'],
        ['trzy piwa', 'three beers'],
        ['sześć piw', 'six beers'],
        ['dziesięć osób', 'ten people'],
      ],
      sentences: [
        ['Mam dwadzieścia dwa lata.', "I'm twenty-two.", { altEn: ['I am twenty-two years old.', "I'm twenty-two years old.", 'I am twenty-two.', "I'm twenty two."], extra: ['lat', 'jestem'] }],
        ['Poproszę dwie kawy i trzy piwa.', 'Two coffees and three beers, please.', { altEn: ["I'd like two coffees and three beers."], extra: ['dwa', 'kaw'] }],
        ['W grupie jest dziesięć osób.', 'There are ten people in the group.', { altEn: ['The group has ten people.'], extra: ['są', 'osoby'] }],
        ['Mamy pięć kotów.', 'We have five cats.', { altEn: ["We've got five cats."], extra: ['koty', 'kota'] }],
      ],
      drills: [
        ['dwie ___', 'two coffees', ['kawy', 'kaw', 'kawa'], 'kawy'],
        ['pięć ___', 'five coffees', ['kaw', 'kawy', 'kawę'], 'kaw', '5+ takes the genitive plural. Feminine often has no ending at all.'],
        ['trzy ___', 'three cats', ['koty', 'kotów', 'kot'], 'koty'],
        ['dwanaście ___', 'twelve beers', ['piw', 'piwa', 'piwo'], 'piw'],
        ['dwadzieścia trzy ___', 'twenty-three years', ['lata', 'lat', 'rok'], 'lata'],
        ['Mam trzydzieści pięć ___.', "I'm thirty-five.", ['lat', 'lata', 'roku'], 'lat'],
      ],
      spotlight: {
        title: 'Numbers choose the case',
        body: [
          'You met this with money. It applies to every noun: after **2, 3, 4** use the nominative plural; after **5 and up** use the genitive plural, and the verb becomes singular and neuter: {Pięć osób przyszło}.',
          'Numbers ending in 2, 3, 4 (except 12, 13, 14) behave like 2–4: {dwadzieścia dwa lata}, but {dwanaście lat}.',
        ],
        table: {
          head: ['', 'kot (m)', 'kawa (f)', 'piwo (n)'],
          rows: [
            ['1', 'jeden kot', 'jedna kawa', 'jedno piwo'],
            ['2–4', 'dwa koty', 'dwie kawy', 'dwa piwa'],
            ['5+', 'pięć kotów', 'pięć kaw', 'pięć piw'],
          ],
        },
      },
    }),
    lesson('u18-l2', 'A lot, a little, a few', 'Use quantity words with the genitive.', {
      items: [
        ['dużo', 'a lot of', { altEn: ['a lot', 'lots of', 'much', 'many'] }],
        ['mało', 'not much', { altEn: ['little', 'few', 'not many'] }],
        ['kilka', 'a few', { altEn: ['several', 'some'] }],
        ['ile?', 'how much?', { altEn: ['how many?'] }],
        ['więcej', 'more'],
        ['mniej', 'less', { altEn: ['fewer'] }],
        ['za dużo', 'too much', { altEn: ['too many'] }],
        ['wystarczy', "that's enough", { altEn: ['enough', 'that will do', 'it is enough'] }],
      ],
      sentences: [
        ['Mam dużo pracy.', 'I have a lot of work.', { altEn: ["I've got a lot of work.", "I've got lots of work."], extra: ['praca', 'pracę'] }],
        ['Poproszę trochę wody.', 'Some water, please.', { altEn: ['A little water, please.', 'Could I have some water, please?'], extra: ['woda', 'wodę'] }],
        ['Wystarczy, dziękuję.', "That's enough, thank you.", { altEn: ["That's enough, thanks.", 'That will do, thank you.'], extra: ['więcej', 'proszę'] }],
        ['Ile czasu to zajmie?', 'How long will it take?', { altEn: ['How much time will it take?', 'How long does it take?'], extra: ['czas', 'godzina'] }],
      ],
      drills: [
        ['Poproszę trochę ___.', 'A little water, please.', ['wody', 'woda', 'wodę'], 'wody'],
        ['Mam dużo ___.', 'I have a lot of work.', ['pracy', 'praca', 'pracę'], 'pracy'],
        ['Poczekaj kilka ___.', 'Wait a few minutes.', ['minut', 'minuty', 'minutę'], 'minut'],
        ['Ile masz ___?', 'How much time do you have?', ['czasu', 'czas', 'czasem'], 'czasu'],
      ],
      spotlight: {
        title: 'Quantity words take the genitive',
        body: [
          'Like numbers from five up, {dużo}, {mało}, {trochę}, {kilka}, {ile} and {więcej} are followed by the **genitive**: {dużo ludzi}, {trochę wody}, {kilka minut}.',
        ],
      },
    }),
    lesson('u18-l3', 'At the deli counter', 'Buy food by weight and by the packet.', {
      items: [
        ['kilo', 'a kilo', { altEn: ['kilo', 'kilogram', 'a kilogram'], altPl: ['kilogram'] }],
        ['pół kilo', 'half a kilo', { altEn: ['half a kilogram'] }],
        ['dziesięć deko', 'a hundred grams', { altEn: ['100 grams', '100g'], hint: 'Poles buy cheese and ham in "deko" (10 g units).' }],
        ['litr', 'a litre', { altEn: ['litre'] }],
        ['butelka', 'bottle', { altEn: ['a bottle'], g: 'f' }],
        ['paczka', 'packet', { altEn: ['a packet', 'pack', 'a pack'], g: 'f' }],
        ['puszka', 'tin', { altEn: ['can', 'a tin', 'a can'], g: 'f' }],
        ['kawałek', 'piece', { altEn: ['a piece', 'a bit', 'a slice'], g: 'm' }],
      ],
      sentences: [
        ['Poproszę kilo jabłek.', 'A kilo of apples, please.', { altEn: ["I'd like a kilo of apples."], extra: ['jabłka', 'litr'] }],
        ['Poproszę butelkę wody.', 'A bottle of water, please.', { altEn: ["I'd like a bottle of water."], extra: ['butelka', 'woda'] }],
        ['Pół kilo sera, proszę.', 'Half a kilo of cheese, please.', { altEn: ["I'd like half a kilo of cheese."], altPl: ['Poproszę pół kilo sera.'], extra: ['ser', 'kilogram'] }],
        ['Poproszę dwadzieścia deko szynki.', 'Two hundred grams of ham, please.', { altEn: ['200 grams of ham, please.', "I'd like two hundred grams of ham."], extra: ['szynka', 'kilo'] }],
      ],
      drills: [
        ['Poproszę paczkę ___.', 'A packet of coffee, please.', ['kawy', 'kawa', 'kawę'], 'kawy', 'Containers and weights take the genitive: "of coffee".'],
        ['Poproszę ___ wody.', 'A bottle of water, please.', ['butelkę', 'butelka', 'butelki'], 'butelkę', 'The container is what you order, so it takes the accusative.'],
        ['Kawałek ___, proszę.', 'A piece of cake, please.', ['ciasta', 'ciasto', 'ciastem'], 'ciasta'],
      ],
      dialogue: [
        ['Ekspedientka', 'Słucham?', 'Yes, please?'],
        ['Klient', 'Poproszę dwadzieścia deko szynki i pół kilo sera.', 'Two hundred grams of ham and half a kilo of cheese, please.'],
        ['Ekspedientka', 'Coś jeszcze?', 'Anything else?'],
        ['Klient', 'Butelkę wody i paczkę kawy. To wszystko.', "A bottle of water and a packet of coffee. That's all."],
        ['Ekspedientka', 'Trzydzieści dwa złote pięćdziesiąt.', 'Thirty-two złoty fifty.'],
      ],
    }),
  ],
);

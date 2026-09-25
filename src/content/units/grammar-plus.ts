import { lesson, unit } from '../build';

/**
 * Grammar that conversation keeps needing, added in the second edition: comparing, "should" and "must",
 * plurals for groups of men, który and swój, reporting what people said, prefixed verbs of motion, and the
 * language of work and renting. See UNITS in course.ts for where each sits.
 */

export const u25 = unit(
  25,
  'A2',
  'Better & best',
  'Stopniowanie',
  'Compare things and people: bigger, cheaper, the best, and faster and more often.',
  [
    lesson('u25-l1', 'Bigger, cheaper, better', 'Compare two things.', {
      items: [
        ['większy', 'bigger', { altEn: ['larger'] }],
        ['mniejszy', 'smaller'],
        ['tańszy', 'cheaper'],
        ['droższy', 'more expensive', { altEn: ['dearer'] }],
        ['lepszy', 'better'],
        ['gorszy', 'worse'],
        ['starszy', 'older', { altEn: ['elder'] }],
        ['niż', 'than'],
      ],
      sentences: [
        ['Mój brat jest starszy ode mnie.', 'My brother is older than me.', { altEn: ['My brother is older than I am.'], altPl: ['Mój brat jest starszy niż ja.'], extra: ['stary', 'młodszy'] }],
        ['Ten telefon jest tańszy niż tamten.', 'This phone is cheaper than that one.', { extra: ['tani', 'droższy'] }],
        ['Kraków jest mniejszy niż Warszawa.', 'Kraków is smaller than Warsaw.', { altEn: ['Krakow is smaller than Warsaw.'], altPl: ['Kraków jest mniejszy od Warszawy.'], extra: ['mały', 'większy'] }],
        ['Ta kawa jest lepsza.', 'This coffee is better.', { altEn: ['That coffee is better.', 'The coffee is better.'], extra: ['lepszy', 'dobra'] }],
      ],
      drills: [
        ['Londyn jest ___ niż Kraków.', 'London is bigger than Kraków.', ['większy', 'duży', 'największy'], 'większy'],
        ['Ta książka jest ___.', 'This book is better.', ['lepsza', 'lepszy', 'lepsze'], 'lepsza', 'lepszy agrees like any adjective: lepsza with a feminine noun.'],
        ['Jestem starszy ___ ciebie.', "I'm older than you.", ['od', 'niż', 'z'], 'od', 'od + genitive (od ciebie); with niż, the plain form (niż ty).'],
      ],
      spotlight: {
        title: 'Comparing: -szy and -ejszy',
        body: [
          'Most adjectives add **-szy** or **-ejszy**: {tani} → {tańszy}, {młody} → {młodszy}, {ładny} → {ładniejszy}, {ciepły} → {cieplejszy}. A few are irregular, as in English: {dobry} → {lepszy}, {zły} → {gorszy}, {duży} → {większy}, {mały} → {mniejszy}.',
          '"Than" is {niż} + the plain form ({starszy niż ja}), or {od} + genitive ({starszy ode mnie}).',
        ],
        table: {
          head: ['', 'more…'],
          rows: [
            ['dobry', 'lepszy'],
            ['zły', 'gorszy'],
            ['duży', 'większy'],
            ['mały', 'mniejszy'],
            ['tani', 'tańszy'],
            ['drogi', 'droższy'],
          ],
        },
      },
      dialogue: [
        ['Klientka', 'Który telefon jest lepszy?', 'Which phone is better?'],
        ['Sprzedawca', 'Ten jest droższy, ale ma lepszy aparat.', 'This one is more expensive, but it has a better camera.'],
        ['Klientka', 'A tamten?', 'And that one?'],
        ['Sprzedawca', 'Tamten jest tańszy i mniejszy.', "That one's cheaper and smaller."],
        ['Klientka', 'Wezmę tańszy.', "I'll take the cheaper one."],
      ],
    }),
    lesson('u25-l2', 'The best', 'Say what is the best, the biggest and the cheapest.', {
      items: [
        ['najlepszy', 'the best', { altEn: ['best'] }],
        ['najgorszy', 'the worst', { altEn: ['worst'] }],
        ['największy', 'the biggest', { altEn: ['biggest', 'the largest'] }],
        ['najtańszy', 'the cheapest', { altEn: ['cheapest'] }],
        ['najstarszy', 'the oldest', { altEn: ['oldest', 'the eldest'] }],
        ['najmłodszy', 'the youngest', { altEn: ['youngest'] }],
        ['najbliższy', 'the nearest', { altEn: ['nearest', 'the closest'] }],
        ['na świecie', 'in the world'],
      ],
      sentences: [
        ['To jest najlepsza pizza w mieście.', 'This is the best pizza in town.', { altEn: ["It's the best pizza in town.", 'This is the best pizza in the city.'], extra: ['najlepszy', 'lepsza'] }],
        ['Mój najmłodszy brat ma dziesięć lat.', 'My youngest brother is ten.', { altEn: ['My youngest brother is ten years old.'], extra: ['młodszy', 'mam'] }],
        ['Który pokój jest najtańszy?', 'Which room is the cheapest?', { extra: ['tańszy', 'która'] }],
        ['Kraków to najpiękniejsze miasto w Polsce.', 'Kraków is the most beautiful city in Poland.', { altEn: ['Krakow is the most beautiful city in Poland.', 'Kraków is the loveliest city in Poland.'], extra: ['piękne', 'Polska'] }],
      ],
      drills: [
        ['To jest ___ restauracja w mieście.', 'This is the best restaurant in town.', ['najlepsza', 'najlepszy', 'lepsza'], 'najlepsza', 'naj- + the comparative: the best. It agrees with the noun.'],
        ['Wisła to ___ rzeka w Polsce.', 'The Vistula is the longest river in Poland.', ['najdłuższa', 'dłuższa', 'najdłuższy'], 'najdłuższa'],
        ['Ona jest ___ w rodzinie.', "She's the youngest in the family.", ['najmłodsza', 'najmłodszy', 'młodsza'], 'najmłodsza'],
      ],
      spotlight: {
        title: 'Naj-: the most',
        body: [
          'Put **naj-** in front of the comparative: {lepszy} → {najlepszy}, {tańszy} → {najtańszy}, {większy} → {największy}. It agrees like any adjective: {najlepsza kawa}, {najlepsze miejsce}.',
          '"In the world" and "in town" are {na świecie} and {w mieście}.',
        ],
      },
      dialogue: [
        ['Turysta', 'Przepraszam, gdzie jest najbliższa apteka?', 'Excuse me, where is the nearest chemist?'],
        ['Pani', 'Najbliższa jest na rogu, ale najtańsza jest przy dworcu.', 'The nearest is on the corner, but the cheapest is by the station.'],
        ['Turysta', 'Dziękuję. A najlepsze pierogi w mieście?', 'Thank you. And the best pierogi in town?'],
        ['Pani', 'U mojej babci!', "At my grandma's!"],
      ],
    }),
    lesson('u25-l3', 'Faster, more often', 'Compare how things are done.', {
      items: [
        ['szybciej', 'faster', { altEn: ['more quickly', 'quicker'] }],
        ['wolniej', 'more slowly', { altEn: ['slower'] }],
        ['lepiej', 'better (how you do it)', { altEn: ['better'], hint: 'The adverb: {Mówisz lepiej ode mnie}. The adjective is {lepszy}.' }],
        ['gorzej', 'worse (how you do it)', { altEn: ['worse'] }],
        ['częściej', 'more often'],
        ['bardziej', 'more (with adjectives)', { altEn: ['more'], hint: 'Before long adjectives: {bardziej interesujący}. With amounts: {więcej}.' }],
        ['najbardziej', 'the most', { altEn: ['most', 'most of all'] }],
        ['coraz', 'more and more', { hint: '{coraz lepiej}: better and better.' }],
      ],
      sentences: [
        ['Mówisz po polsku coraz lepiej!', 'Your Polish is getting better and better!', { altEn: ['You speak Polish better and better!'], extra: ['lepszy', 'dobrze'] }],
        ['Możesz mówić trochę wolniej?', 'Can you speak a bit more slowly?', { altEn: ['Could you speak a little more slowly?', 'Can you speak a bit slower?'], extra: ['wolno', 'szybciej'] }],
        ['Pociągiem jest szybciej niż autobusem.', "It's quicker by train than by bus.", { altEn: ["It's faster by train than by bus."], extra: ['szybki', 'autobus'] }],
        ['Najbardziej lubię lato.', 'I like summer most of all.', { altEn: ['I like summer the most.', 'Summer is my favourite.'], extra: ['bardziej', 'lata'] }],
      ],
      drills: [
        ['Mów ___, proszę.', 'Speak more slowly, please.', ['wolniej', 'wolny', 'wolno'], 'wolniej'],
        ['Dzisiaj czuję się ___.', 'I feel better today.', ['lepiej', 'lepszy', 'dobrze'], 'lepiej', 'How you feel is an adverb: lepiej, not lepszy.'],
        ['To jest ___ interesujące.', "That's more interesting.", ['bardziej', 'więcej', 'najwięcej'], 'bardziej', 'bardziej with adjectives; więcej with amounts.'],
      ],
      spotlight: {
        title: 'Doing it better: adverbs',
        body: [
          'Adverbs compare with **-iej** or **-ej**: {szybko} → {szybciej}, {często} → {częściej}, {wolno} → {wolniej}. Irregular: {dobrze} → {lepiej}, {źle} → {gorzej}, {dużo} → {więcej}.',
          'Long adjectives use {bardziej} and {najbardziej}: {bardziej interesujący}. {Coraz} + a comparative means "more and more": {coraz lepiej}, {coraz zimniej}.',
        ],
      },
      dialogue: [
        ['Kasia', 'Mówisz po polsku coraz lepiej!', 'Your Polish is getting better and better!'],
        ['Tom', 'Dzięki! Ale ty mówisz za szybko.', 'Thanks! But you speak too fast.'],
        ['Kasia', 'Dobrze, będę mówić wolniej.', "OK, I'll speak more slowly."],
        ['Tom', 'Najbardziej lubię, kiedy mówisz powoli!', 'What I like most is when you speak slowly!'],
      ],
    }),
  ],
);

export const u26 = unit(
  26,
  'A2',
  'Should & must',
  'Trzeba',
  'Advice and rules: I should, you have to, you can, you mustn\'t, and what is worth doing.',
  [
    lesson('u26-l1', 'I should', 'Give and take advice with powinienem.', {
      items: [
        ['powinienem', 'I should', { altPl: ['powinnam'], altEn: ['i ought to'], hint: 'A woman says powinnam.' }],
        ['powinieneś', 'you should', { altPl: ['powinnaś'], altEn: ['you ought to'] }],
        ['powinien', 'he should', { altEn: ['should'] }],
        ['powinna', 'she should'],
        ['powinniśmy', 'we should', { altPl: ['powinnyśmy'] }],
        ['odpocząć', 'to rest', { altEn: ['to have a rest', 'to relax'] }],
        ['wcześniej', 'earlier', { altEn: ['before'] }],
        ['więcej spać', 'sleep more', { altEn: ['to sleep more'] }],
      ],
      sentences: [
        ['Powinieneś więcej odpoczywać.', 'You should rest more.', { altPl: ['Powinnaś więcej odpoczywać.'], altEn: ['You ought to rest more.'], extra: ['powinienem', 'odpocząć'] }],
        ['Powinnam już iść.', 'I should go now.', { altPl: ['Powinienem już iść.'], altEn: ['I ought to go now.', 'I should be going.'], extra: ['powinna', 'idę'] }],
        ['On powinien zadzwonić do lekarza.', 'He should ring the doctor.', { altEn: ['He should call the doctor.', 'He ought to call the doctor.'], extra: ['powinna', 'dzwoni'] }],
        ['Nie powinniśmy tyle jeść.', "We shouldn't eat so much.", { altPl: ['Nie powinnyśmy tyle jeść.'], altEn: ['We should not eat so much.'], extra: ['jemy', 'dużo'] }],
      ],
      drills: [
        ['(Anna) ___ więcej spać.', 'Anna: I should sleep more.', ['Powinnam', 'Powinienem', 'Powinna'], 'Powinnam'],
        ['Tomek, ___ odpocząć.', 'Tomek, you should rest.', ['powinieneś', 'powinnaś', 'powinien'], 'powinieneś'],
        ['Ona ___ wrócić wcześniej.', 'She should come back earlier.', ['powinna', 'powinien', 'powinnam'], 'powinna'],
      ],
      spotlight: {
        title: 'Powinien: should',
        body: [
          '{Powinien} (should) changes like a past-tense verb, by person and gender: a man says {powinienem}, a woman {powinnam}. An infinitive follows: {Powinienem więcej spać}.',
          '"Should have" adds {był}: {Powinienem był zadzwonić} (I should have rung).',
        ],
        table: {
          head: ['', 'man', 'woman'],
          rows: [
            ['I', 'powinienem', 'powinnam'],
            ['you', 'powinieneś', 'powinnaś'],
            ['he / she', 'powinien', 'powinna'],
            ['we', 'powinniśmy', 'powinnyśmy'],
            ['they', 'powinni', 'powinny'],
          ],
        },
      },
      dialogue: [
        ['Marek', 'Jestem taki zmęczony.', "I'm so tired."],
        ['Ola', 'Pracujesz za dużo. Powinieneś odpocząć.', 'You work too much. You should rest.'],
        ['Marek', 'Wiem, wiem. Może wezmę urlop.', "I know, I know. Maybe I'll take some time off."],
        ['Ola', 'Dobry pomysł. Powinniśmy pojechać w góry!', 'Good idea. We should go to the mountains!'],
      ],
    }),
    lesson('u26-l2', 'You have to, you can', 'Talk about rules with trzeba, można and nie wolno.', {
      items: [
        ['trzeba', 'you have to', { altEn: ['it is necessary', 'one must', 'you need to'] }],
        ['można', 'you can', { altEn: ['one can', 'it is allowed'] }],
        ['nie wolno', "you mustn't", { altEn: ['it is forbidden', 'not allowed'] }],
        ['warto', "it's worth it", { altEn: ['worth', 'it is worth'] }],
        ['nie warto', "it's not worth it", { altEn: ['not worth it'] }],
        ['zakaz', 'ban', { altEn: ['prohibition'], g: 'm', hint: 'On signs: {Zakaz palenia} (no smoking).' }],
        ['wstęp wolny', 'free admission', { altEn: ['free entry'] }],
        ['tu się nie pali', "there's no smoking here", { altEn: ['no smoking here'], hint: 'Impersonal się: "one doesn\'t smoke here".' }],
      ],
      sentences: [
        ['Trzeba kupić bilet przed wejściem.', 'You have to buy a ticket before going in.', { altEn: ['You need to buy a ticket before going in.', 'You have to buy a ticket before entering.'], extra: ['kupuję', 'bilety'] }],
        ['Czy można tu płacić kartą?', 'Can you pay by card here?', { altEn: ['Can one pay by card here?', 'Is it possible to pay by card here?'], altPl: ['Można tu płacić kartą?'], extra: ['mogę', 'gotówką'] }],
        ['W muzeum nie wolno robić zdjęć.', "You mustn't take photos in the museum.", { altEn: ["You can't take photos in the museum.", 'Taking photos is not allowed in the museum.'], extra: ['zdjęcia', 'można'] }],
        ['Warto zobaczyć Wawel.', 'Wawel is worth seeing.', { altEn: ["It's worth seeing Wawel.", 'Wawel is worth a visit.'], extra: ['widzieć', 'nie'] }],
      ],
      drills: [
        ['___ kupić bilet.', 'You have to buy a ticket.', ['Trzeba', 'Warto', 'Wolno'], 'Trzeba'],
        ['Tu nie ___ palić.', "You mustn't smoke here.", ['wolno', 'trzeba', 'warto'], 'wolno'],
        ['Czy ___ tu zaparkować?', 'Can you park here?', ['można', 'trzeba', 'warto'], 'można'],
      ],
      spotlight: {
        title: 'Rules without a person',
        body: [
          '{Trzeba} (it is necessary), {można} (one can), {nie wolno} (one mustn\'t) and {warto} (it\'s worth it) take an infinitive and no person at all: {Trzeba czekać}, {Można wejść?}',
          'Polish also talks about "people in general" with {się}: {Tu się nie pali} (there\'s no smoking here), {Jak to się mówi?} (how do you say it?). Signs are blunter: {Zakaz wstępu} (no entry), {Zakaz parkowania} (no parking).',
        ],
      },
      dialogue: [
        ['Turystka', 'Przepraszam, czy trzeba kupić bilet?', 'Excuse me, do you have to buy a ticket?'],
        ['Pracownik', 'We wtorek wstęp jest wolny. Ale nie wolno robić zdjęć.', "On Tuesday admission is free. But you mustn't take photos."],
        ['Turystka', 'Rozumiem. A można zostawić plecak?', 'I see. And can I leave my rucksack?'],
        ['Pracownik', 'Tak, w szatni. Warto też zobaczyć wystawę na górze.', 'Yes, in the cloakroom. The exhibition upstairs is worth seeing too.'],
      ],
    }),
    lesson('u26-l3', 'Giving advice', 'Suggest, recommend and warn.', {
      items: [
        ['radzę ci', 'my advice is', { altEn: ['i advise you', 'i suggest'] }],
        ['polecam', 'I recommend', { altEn: ["i'd recommend"] }],
        ['lepiej nie', 'better not', { altEn: ["you'd better not", "i'd rather not"] }],
        ['spróbuj', 'try', { altEn: ['have a go', 'try it'] }],
        ['nie ma sensu', "there's no point", { altEn: ['it makes no sense', "it's pointless"] }],
        ['musisz koniecznie', 'you really must', { altEn: ['you absolutely must'] }],
        ['uważam, że', 'I believe that', { altEn: ['i reckon', 'in my view'] }],
        ['zamiast', 'instead of'],
      ],
      sentences: [
        ['Radzę ci iść do lekarza.', 'My advice is to see a doctor.', { altEn: ['I advise you to go to the doctor.', 'I suggest you see a doctor.'], extra: ['radzisz', 'lekarz'] }],
        ['Polecam tę restaurację, jest świetna.', "I recommend this restaurant, it's great.", { altEn: ["I'd recommend this restaurant, it's excellent."], extra: ['ta', 'restauracja'] }],
        ['Lepiej nie jedź samochodem, są korki.', "Better not drive, there's a lot of traffic.", { altEn: ["You'd better not drive, there are traffic jams.", 'Better not go by car, there are traffic jams.'], extra: ['jedziesz', 'autobus'] }],
        ['Musisz koniecznie spróbować żurku!', 'You really must try żurek!', { altEn: ['You absolutely must try żurek!', 'You really have to try żurek!'], extra: ['próbuję', 'żurek'] }],
      ],
      drills: [
        ['Radzę ___ odpocząć.', 'My advice is to rest.', ['ci', 'cię', 'ty'], 'ci', 'radzić komuś: the dative.'],
        ['Pij herbatę zamiast ___.', 'Drink tea instead of coffee.', ['kawy', 'kawę', 'kawa'], 'kawy', 'zamiast + genitive.'],
        ['Lepiej nie ___ tego.', 'Better not do that.', ['rób', 'zrób', 'robisz'], 'rób', 'Warnings take the imperfective, like other "don\'t"s.'],
      ],
      spotlight: {
        title: 'Advice, Polish style',
        body: [
          'Poles give advice readily and directly, especially about health and food. {Radzę ci…} (my advice is…), {Musisz koniecznie…} (you really must…) and {Lepiej nie…} (better not…) are friendly, not bossy.',
          '{Polecam} (I recommend) is everywhere: a waiter says {Polecam pierogi}, and a shop signs off an email with {Polecamy się} ("we recommend ourselves").',
        ],
      },
      dialogue: [
        ['Emma', 'Jadę w weekend do Krakowa. Co polecasz?', "I'm going to Kraków at the weekend. What do you recommend?"],
        ['Piotr', 'Musisz koniecznie zobaczyć Wawel i Kazimierz.', 'You really must see Wawel and Kazimierz.'],
        ['Emma', 'A gdzie zjeść?', 'And where should I eat?'],
        ['Piotr', 'Polecam małą restaurację przy Rynku. Ale lepiej nie jedz na samym Rynku, bo jest drogo.', "I recommend a little restaurant by the Market Square. But better not eat right on the Square, because it's expensive."],
      ],
    }),
  ],
);

export const u27 = unit(
  27,
  'B1',
  'People in the plural',
  'Oni i one',
  'Groups that include a man have plurals of their own: Polacy, studenci, dwóch panów, wszyscy.',
  [
    lesson('u27-l1', 'Poles, students, doctors', 'Make plurals for groups of men and mixed groups.', {
      items: [
        ['Polacy', 'Poles', { altEn: ['polish people'], hint: 'Men or mixed groups. Only women: {Polki}.' }],
        ['Anglicy', 'English people', { altEn: ['englishmen', 'the english'] }],
        ['studenci', 'students', { hint: 'Men or mixed. Only women: {studentki}.' }],
        ['lekarze', 'doctors'],
        ['nauczyciele', 'teachers'],
        ['koledzy', 'friends (men or mixed)', { altEn: ['mates', 'colleagues'] }],
        ['ludzie', 'people', { hint: 'The plural of {człowiek} (a person).' }],
        ['państwo', 'ladies and gentlemen', { altEn: ['you (formal, to a group)'], hint: 'Formal "you" to a group or a couple: {Czy państwo…?}' }],
      ],
      sentences: [
        ['Moi koledzy są z Polski.', 'My friends are from Poland.', { altEn: ['My mates are from Poland.', 'My colleagues are from Poland.'], extra: ['moje', 'kolegi'] }],
        ['W grupie są Polacy i Anglicy.', 'There are Poles and English people in the group.', { altEn: ['The group has Poles and English people in it.'], extra: ['Polak', 'Anglik'] }],
        ['Czy państwo są gotowi?', 'Are you ready? (to a group)', { altEn: ['Are you ready?', 'Are you all ready?'], extra: ['pan', 'gotowe'] }],
        ['Ci ludzie są bardzo mili.', 'These people are very nice.', { altEn: ['Those people are very nice.', 'These people are very kind.'], extra: ['te', 'miłe'] }],
      ],
      drills: [
        ['To są ___.', 'They are Poles.', ['Polacy', 'Polaków', 'Polak'], 'Polacy', 'Men or mixed groups: Polak → Polacy.'],
        ['Moi ___ są mili.', 'My (male) friends are nice.', ['koledzy', 'kolegi', 'kolegów'], 'koledzy'],
        ['___ studenci', 'these students', ['ci', 'te', 'ten'], 'ci', 'For men and mixed groups, "these" is ci.'],
        ['Ci ludzie są ___.', 'These people are tired.', ['zmęczeni', 'zmęczone', 'zmęczony'], 'zmęczeni', 'Adjectives for groups with a man end in -i or -y, and the consonant before often softens: zmęczony → zmęczeni.'],
      ],
      spotlight: {
        title: 'A plural just for men',
        body: [
          'Groups that include at least one man ("masculine personal") have their own plural, and the last consonant often changes: {Polak} → {Polacy}, {student} → {studenci}, {kolega} → {koledzy}. Some take **-owie**: {panowie}, {synowie}.',
          'Adjectives and "these" change too: {ci mili studenci} (these nice students), but {te miłe studentki} (these nice female students). You met the same split in the past tense: {byli} / {były}.',
        ],
        table: {
          head: ['one man', 'group with a man', 'only women'],
          rows: [
            ['Polak', 'Polacy', 'Polki'],
            ['student', 'studenci', 'studentki'],
            ['nauczyciel', 'nauczyciele', 'nauczycielki'],
            ['ten miły pan', 'ci mili panowie', 'te miłe panie'],
          ],
        },
      },
      dialogue: [
        ['Przewodnik', 'Dzień dobry państwu! Skąd państwo są?', 'Good morning, everyone! Where are you from?'],
        ['Turysta', 'My jesteśmy z Anglii, a oni są ze Szkocji.', "We're from England, and they're from Scotland."],
        ['Przewodnik', 'A ci panowie?', 'And these gentlemen?'],
        ['Turysta', 'To nasi koledzy z Irlandii.', "They're our friends from Ireland."],
      ],
    }),
    lesson('u27-l2', 'Two men, five women', 'Count people: dwóch, pięciu, dwoje.', {
      items: [
        ['dwóch', 'two (men)', { altEn: ['two'], hint: 'For men and mixed groups: {dwóch panów}.' }],
        ['trzech', 'three (men)', { altEn: ['three'] }],
        ['czterech', 'four (men)', { altEn: ['four'] }],
        ['pięciu', 'five (men)', { altEn: ['five'] }],
        ['kilku', 'a few (men)', { altEn: ['several'] }],
        ['wielu', 'many (people)', { altEn: ['many', 'a lot of'] }],
        ['troje', 'three (children)', { altEn: ['three kids'], hint: 'The collective number, for children and mixed pairs: {dwoje}, {troje}, {czworo}.' }],
        ['ilu?', 'how many (people)?', { altEn: ['how many?'] }],
      ],
      sentences: [
        ['Mam dwóch braci.', 'I have two brothers.', { altEn: ["I've got two brothers."], extra: ['dwa', 'brata'] }],
        ['Na spotkaniu było pięciu studentów.', 'There were five students at the meeting.', { extra: ['pięć', 'byli'] }],
        ['Ilu was jest?', 'How many of you are there?', { extra: ['ile', 'są'] }],
        ['Mają troje dzieci.', 'They have three children.', { altEn: ['They have three kids.', "They've got three children."], extra: ['trzy', 'dziecko'] }],
      ],
      drills: [
        ['Mam ___ braci.', 'I have three brothers.', ['trzech', 'trzy', 'troje'], 'trzech', 'Men: trzech + genitive plural.'],
        ['Mam ___ siostry.', 'I have three sisters.', ['trzy', 'trzech', 'troje'], 'trzy', 'Women count like things: trzy siostry.'],
        ['W pokoju jest ___ mężczyzn.', 'There are five men in the room.', ['pięciu', 'pięć', 'piątka'], 'pięciu'],
        ['Mamy ___ dzieci.', 'We have two children.', ['dwoje', 'dwa', 'dwóch'], 'dwoje', 'Children take the collective number: dwoje, troje.'],
      ],
      spotlight: {
        title: 'Counting people',
        body: [
          'For men and mixed groups, numbers take **-u** or **-ch** and the noun goes into the genitive plural: {dwóch panów}, {trzech studentów}, {pięciu kolegów}. The verb is singular: {Przyszło pięciu studentów}.',
          'Women count like things ({trzy siostry}, {pięć kobiet}); children take {dwoje}, {troje}, {czworo}: {troje dzieci}. {Ilu?} asks how many people.',
        ],
        table: {
          head: ['', 'men / mixed', 'women, things', 'children'],
          rows: [
            ['2', 'dwóch panów', 'dwie panie', 'dwoje dzieci'],
            ['3', 'trzech panów', 'trzy panie', 'troje dzieci'],
            ['5', 'pięciu panów', 'pięć pań', 'pięcioro dzieci'],
          ],
        },
      },
      dialogue: [
        ['Kelner', 'Dobry wieczór. Na ile osób?', 'Good evening. For how many people?'],
        ['Adam', 'Na sześć. Trzech panów, dwie panie i dziecko.', 'For six. Three men, two women and a child.'],
        ['Kelner', 'Proszę tędy. Czy ktoś jeszcze dojdzie?', 'This way, please. Is anyone else joining you?'],
        ['Adam', 'Może jeszcze dwóch kolegów.', 'Maybe two more friends.'],
      ],
    }),
    lesson('u27-l3', 'They went, they were pleased', 'Use the past and adjectives with groups.', {
      items: [
        ['poszli', 'they went (men or mixed)', { altEn: ['they went'], hint: 'Only women: {poszły}.' }],
        ['przyszli', 'they came (men or mixed)', { altEn: ['they came', 'they arrived'] }],
        ['zadowoleni', 'pleased (men or mixed)', { altEn: ['happy', 'satisfied', 'pleased'] }],
        ['zmęczeni', 'tired (men or mixed)', { altEn: ['tired'] }],
        ['wszyscy', 'everyone', { altEn: ['all', 'everybody'], hint: 'For people. For things: {wszystkie}.' }],
        ['nasi', 'our (men or mixed)', { altEn: ['our'] }],
        ['obaj', 'both (men)', { altEn: ['both'] }],
      ],
      sentences: [
        ['Wszyscy byli bardzo zadowoleni.', 'Everyone was very pleased.', { altEn: ['Everybody was very happy.', 'Everyone was very happy.'], extra: ['wszystkie', 'zadowolone'] }],
        ['Nasi goście przyszli o ósmej.', 'Our guests came at eight.', { altEn: ['Our guests arrived at eight.'], extra: ['nasze', 'przyszły'] }],
        ['Chłopcy poszli do kina, a dziewczyny zostały w domu.', 'The boys went to the cinema, and the girls stayed at home.', { altEn: ['The boys went to the cinema and the girls stayed home.'], extra: ['poszły', 'zostali'] }],
        ['Obaj są zmęczeni.', 'Both of them are tired.', { altEn: ['They are both tired.', "They're both tired."], extra: ['obie', 'zmęczone'] }],
      ],
      drills: [
        ['Moi rodzice ___ do Hiszpanii.', 'My parents went to Spain.', ['pojechali', 'pojechały', 'pojechał'], 'pojechali'],
        ['Kasia i Ola ___ zmęczone.', 'Kasia and Ola were tired.', ['były', 'byli', 'była'], 'były'],
        ['___ są zadowoleni.', 'Everyone is pleased.', ['Wszyscy', 'Wszystkie', 'Wszystko'], 'Wszyscy'],
      ],
      spotlight: {
        title: 'One split, everywhere',
        body: [
          'The men-or-mixed / no-men split runs through the whole plural: the past tense ({poszli} / {poszły}), adjectives ({zadowoleni} / {zadowolone}), "all" ({wszyscy} / {wszystkie}), "our" ({nasi} / {nasze}) and "both" ({obaj} / {obie}).',
          'One man in a group of a hundred women makes it {oni}, with the men\'s forms.',
        ],
      },
      dialogue: [
        ['Mama', 'Gdzie są chłopcy?', 'Where are the boys?'],
        ['Tata', 'Poszli z kolegami na mecz.', 'They went to the match with their friends.'],
        ['Mama', 'A dziewczyny?', 'And the girls?'],
        ['Tata', 'Są w pokoju. Wszyscy są zadowoleni, a my mamy spokój!', "They're in their room. Everyone's happy, and we have some peace!"],
      ],
    }),
  ],
);

export const u28 = unit(
  28,
  'B1',
  'Which & whose',
  'Który i swój',
  'Longer sentences: the man who, the house where, my own, and reporting what people said.',
  [
    lesson('u28-l1', 'The man who…', 'Join sentences with który.', {
      items: [
        ['który', 'who, which (m)', { altEn: ['which', 'that', 'who'] }],
        ['która', 'who, which (f)', { altEn: ['which', 'that', 'who'] }],
        ['które', 'which (n, pl)', { altEn: ['which', 'that'] }],
        ['którego', 'whom (a man)', { altEn: ['whom', 'which'] }],
        ['w którym', 'in which', { altEn: ['where', 'in which (m)'] }],
        ['człowiek', 'person', { altEn: ['man', 'human'], g: 'm' }],
        ['film', 'film', { altEn: ['movie'], g: 'm' }],
      ],
      sentences: [
        ['To jest pan, który uczy polskiego.', 'This is the man who teaches Polish.', { altEn: ['This is the gentleman who teaches Polish.'], extra: ['która', 'uczę'] }],
        ['Mam koleżankę, która mieszka w Poznaniu.', 'I have a friend who lives in Poznań.', { altEn: ['I have a friend who lives in Poznan.', "I've got a friend who lives in Poznań."], extra: ['który', 'mieszkam'] }],
        ['Film, który widzieliśmy, był nudny.', 'The film we saw was boring.', { altEn: ['The film that we saw was boring.', 'The film which we saw was boring.'], extra: ['która', 'nudna'] }],
        ['To jest dom, w którym mieszkałam.', 'This is the house where I lived.', { altPl: ['To jest dom, w którym mieszkałem.'], altEn: ['This is the house I lived in.', 'This is the house in which I lived.'], extra: ['która', 'domu'] }],
      ],
      drills: [
        ['To kobieta, ___ pracuje w banku.', 'That is the woman who works at the bank.', ['która', 'który', 'które'], 'która', 'który agrees with the noun it refers to: kobieta → która.'],
        ['To jest samochód, ___ kupiłem.', 'This is the car I bought.', ['który', 'którego', 'która'], 'który', 'The car is the object, and masculine things keep the plain form: który.'],
        ['Znasz tego pana, ___ tam stoi?', 'Do you know the man who is standing there?', ['który', 'którego', 'która'], 'który', 'He does the standing: the subject, so który.'],
        ['To jest miasto, w ___ się urodziłam.', 'This is the town where I was born.', ['którym', 'który', 'którą'], 'którym', 'After w (in), the locative: w którym.'],
      ],
      spotlight: {
        title: 'Który: who, which and that',
        body: [
          '{Który} joins two sentences like English "who", "which" or "that". Its gender and number come from the noun it refers to; its case from its job in the new clause: {pan, który uczy} (the subject), {pan, którego znam} (the object, a man), {dom, w którym mieszkam} (after w).',
          'English can leave "that" out ("the film we saw"); Polish never leaves out {który}, and always puts a comma before it.',
        ],
        table: {
          head: ['', 'm', 'f', 'n'],
          rows: [
            ['who, which', 'który', 'która', 'które'],
            ['whom, which (object)', 'którego / który', 'którą', 'które'],
            ['in which', 'w którym', 'w której', 'w którym'],
          ],
        },
      },
      dialogue: [
        ['Ola', 'Pamiętasz Kasię, która była z nami w Gdańsku?', 'Do you remember Kasia, who was with us in Gdańsk?'],
        ['Adam', 'Tę, która ma psa?', 'The one who has a dog?'],
        ['Ola', 'Tak! Wychodzi za mąż za chłopaka, którego poznała w pracy.', "Yes! She's marrying a guy she met at work."],
        ['Adam', 'Za tego, który gra na gitarze?', 'The one who plays the guitar?'],
      ],
    }),
    lesson('u28-l2', 'My own: swój', 'Say "his own" and "my own" the Polish way.', {
      items: [
        ['swój', "one's own (m)", { altEn: ['my own', 'his own', 'own'], hint: 'Replaces mój, twój, jego… when it belongs to the subject.' }],
        ['swoja', "one's own (f)", { altEn: ['her own', 'own'] }],
        ['swoje', "one's own (n, pl)", { altEn: ['own'] }],
        ['jego', 'his'],
        ['jej', 'her', { altEn: ['hers'] }],
        ['ich', 'their', { altEn: ['theirs'] }],
        ['własny', 'own', { altEn: ['of my own'] }],
      ],
      sentences: [
        ['Tomek kocha swoją żonę.', 'Tomek loves his wife.', { extra: ['jego', 'swoja'] }],
        ['Masz własny samochód?', 'Do you have your own car?', { altEn: ['Have you got your own car?', 'Do you have a car of your own?'], altPl: ['Czy masz własny samochód?'], extra: ['swój', 'własna'] }],
        ['Oni sprzedali swój dom.', 'They sold their house.', { altEn: ['They sold their home.'], extra: ['ich', 'swoje'] }],
        ['Adam i jego brat są w domu.', 'Adam and his brother are at home.', { extra: ['swój', 'ich'] }],
      ],
      drills: [
        ['Anna czyta ___ książkę.', 'Anna is reading her (own) book.', ['swoją', 'jej', 'swoja'], 'swoją', 'The book belongs to the subject, Anna: swoją.'],
        ['Mam ___ pokój.', 'I have my own room.', ['swój', 'swoja', 'swoim'], 'swój'],
        ['Marek jest w domu, a ___ żona w pracy.', 'Marek is at home, and his wife is at work.', ['jego', 'swoja', 'swoją'], 'jego', 'Here żona is the subject of its own clause, and swój never describes a subject.'],
      ],
      spotlight: {
        title: 'Swój: belonging to the subject',
        body: [
          'When something belongs to the subject of the sentence, Polish uses {swój} instead of {mój}, {jego}, {jej} and the rest: {Tomek kocha swoją żonę}. With {jego} it would be another man\'s wife!',
          '{Swój} never describes the subject itself: {Jego żona jest miła}, never {swoja żona}. It changes like {mój}: {swój}, {swoja}, {swoje}, {swoją}, {swojego}.',
        ],
      },
      dialogue: [
        ['Ewa', 'Czy Tomek mieszka z rodzicami?', 'Does Tomek live with his parents?'],
        ['Kasia', 'Nie, ma już swoje mieszkanie.', 'No, he has his own flat now.'],
        ['Ewa', 'A jego brat?', 'And his brother?'],
        ['Kasia', 'Jego brat mieszka ze swoją dziewczyną w Krakowie.', 'His brother lives with his girlfriend in Kraków.'],
      ],
    }),
    lesson('u28-l3', 'She said that…', 'Report what people said and asked.', {
      items: [
        ['powiedział, że', 'he said that', { altEn: ['he said'] }],
        ['powiedziała, że', 'she said that', { altEn: ['she said'] }],
        ['zapytał, czy', 'he asked if', { altEn: ['he asked whether'] }],
        ['nie wiem, czy', "I don't know if", { altEn: ["i don't know whether"] }],
        ['podobno', 'apparently', { altEn: ['reportedly', 'supposedly', 'they say'] }],
        ['obiecał', 'he promised'],
        ['wyjaśnić', 'to explain'],
        ['dlaczego', 'why'],
      ],
      sentences: [
        ['Powiedziała, że przyjdzie później.', "She said she'd come later.", { altEn: ['She said that she would come later.', 'She said she would come later.'], extra: ['przyszła', 'powiedział'] }],
        ['Zapytał, czy mówię po polsku.', 'He asked if I speak Polish.', { altEn: ['He asked whether I speak Polish.', 'He asked if I spoke Polish.'], extra: ['że', 'mówi'] }],
        ['Nie wiem, czy mają wolny stolik.', "I don't know if they have a free table.", { altEn: ["I don't know whether they have a free table."], extra: ['że', 'wolna'] }],
        ['Podobno jutro będzie padać.', "Apparently it's going to rain tomorrow.", { altEn: ['Apparently it will rain tomorrow.', "They say it's going to rain tomorrow."], extra: ['pada', 'było'] }],
      ],
      drills: [
        ['Powiedział, ___ jest zmęczony.', 'He said he was tired.', ['że', 'czy', 'co'], 'że'],
        ['Zapytała, ___ mam czas.', 'She asked if I had time.', ['czy', 'że', 'kiedy'], 'czy', 'Reported yes/no questions: czy.'],
        ['Powiedziała, że ___ jutro.', "She said she would ring tomorrow.", ['zadzwoni', 'zadzwoniła', 'dzwoniła'], 'zadzwoni', 'Polish keeps the original tense: "I\'ll ring" stays zadzwoni.'],
      ],
      spotlight: {
        title: 'Keep the tense',
        body: [
          'Reporting in Polish is easy: keep the verb exactly as it was said. "I\'m tired" becomes {Powiedział, że jest zmęczony}, literally "he said that he is tired". English shifts back to "was"; Polish never does.',
          'Yes/no questions become {czy}: {Zapytał, czy mam czas}. Other questions keep their question word: {Zapytała, gdzie mieszkam}.',
        ],
      },
      dialogue: [
        ['Adam', 'Rozmawiałeś z Kasią?', 'Did you talk to Kasia?'],
        ['Tom', 'Tak. Powiedziała, że nie może przyjść w sobotę.', "Yes. She said she can't come on Saturday."],
        ['Adam', 'Szkoda. A zapytałeś, czy przyjdzie w niedzielę?', "Shame. And did you ask if she'll come on Sunday?"],
        ['Tom', 'Nie wiem, czy ma czas. Podobno dużo pracuje.', "I don't know if she has time. Apparently she's working a lot."],
      ],
    }),
  ],
);

export const u30 = unit(
  30,
  'B1',
  'Coming & going',
  'Przyjść, wyjść, wejść',
  'Prefixes turn "go" into arrive, leave, go in and get to, on foot and by transport. Plus the airport.',
  [
    lesson('u30-l1', 'In, out and here', 'Use prefixes with iść: przyjść, wyjść, wejść.', {
      items: [
        ['przyjść', 'to come', { altEn: ['to arrive (on foot)'] }],
        ['wyjść', 'to go out', { altEn: ['to leave', 'to get out'] }],
        ['wejść', 'to go in', { altEn: ['to come in', 'to enter'] }],
        ['wyszedł', 'he went out', { altEn: ['he left', "he's gone out"] }],
        ['przyszła', 'she came', { altEn: ['she arrived', 'she has come'] }],
        ['wychodzę', "I'm going out", { altEn: ["i'm leaving", 'i go out'] }],
        ['przez', 'through', { altEn: ['across', 'via'] }],
        ['z domu', 'from home', { altEn: ['out of the house'] }],
      ],
      sentences: [
        ['Szef wyszedł na obiad.', 'The boss has gone out for lunch.', { altEn: ['The boss went out for lunch.', 'The boss is out at lunch.'], extra: ['wszedł', 'obiadu'] }],
        ['Weszliśmy do sklepu.', 'We went into the shop.', { altPl: ['Weszłyśmy do sklepu.'], extra: ['wyszliśmy', 'sklep'] }],
        ['O której wychodzisz z domu?', 'What time do you leave home?', { altEn: ['What time do you leave the house?', 'When do you leave home?'], extra: ['wychodzę', 'dom'] }],
        ['Kasia przyszła za późno.', 'Kasia came too late.', { altEn: ['Kasia arrived too late.'], extra: ['przyszedł', 'późna'] }],
      ],
      drills: [
        ['Czy mogę ___?', 'May I come in?', ['wejść', 'wyjść', 'przyjść'], 'wejść', 'w-: into.'],
        ['Tomek ___ z domu o ósmej.', 'Tomek left home at eight.', ['wyszedł', 'wszedł', 'przyszedł'], 'wyszedł', 'wy-: out of.'],
        ['___ do mnie jutro!', 'Come to my place tomorrow!', ['Przyjdź', 'Wyjdź', 'Wejdź'], 'Przyjdź', 'przy-: arriving.'],
      ],
      spotlight: {
        title: 'Prefixes give direction',
        body: [
          'Add a prefix to {iść} (on foot) and it gains a direction and becomes perfective: **przy-** arriving ({przyjść}), **wy-** out ({wyjść}), **w-** in ({wejść}), **do-** reaching ({dojść}), **od-** away ({odejść}), **prze-** across ({przejść}).',
          'Each has an imperfective partner built on {-chodzić}, for habits: {Wychodzę z domu o siódmej} (every day), {Wyszedłem o siódmej} (once).',
        ],
        table: {
          head: ['', 'once (perfective)', 'habit (imperfective)'],
          rows: [
            ['arrive', 'przyjść', 'przychodzić'],
            ['go out', 'wyjść', 'wychodzić'],
            ['go in', 'wejść', 'wchodzić'],
            ['cross', 'przejść', 'przechodzić'],
          ],
        },
      },
      dialogue: [
        ['Klient', 'Dzień dobry, czy mogę rozmawiać z panią Nowak?', 'Hello, may I speak to Mrs Nowak?'],
        ['Sekretarka', 'Niestety, właśnie wyszła. Wróci za godzinę.', "Unfortunately she's just gone out. She'll be back in an hour."],
        ['Klient', 'Dobrze, przyjdę później.', "OK, I'll come back later."],
        ['Sekretarka', 'Albo proszę wejść i poczekać.', 'Or please come in and wait.'],
      ],
    }),
    lesson('u30-l2', 'Arriving and leaving', 'Use prefixes with jechać: przyjechać, wyjechać, dojechać.', {
      items: [
        ['przyjechać', 'to arrive (by transport)', { altEn: ['to come', 'to arrive'] }],
        ['wyjechać', 'to leave (by transport)', { altEn: ['to go away', 'to leave'] }],
        ['dojechać', 'to get to', { altEn: ['to reach', 'to get there'] }],
        ['przejechać', 'to go past', { altEn: ['to drive through', 'to miss (a stop)'] }],
        ['przyjechał', 'he arrived', { altEn: ['he came'] }],
        ['wyjeżdżam', "I'm going away", { altEn: ["i'm leaving (by transport)"] }],
        ['przesiąść się', 'to change', { altEn: ['to change trains', 'to transfer'] }],
        ['centrum', 'centre', { altEn: ['city centre', 'town centre', 'center'], g: 'n' }],
      ],
      sentences: [
        ['Pociąg przyjechał z opóźnieniem.', 'The train arrived late.', { altEn: ['The train arrived with a delay.', 'The train came in late.'], extra: ['przyjechała', 'opóźniony'] }],
        ['Jak dojechać do centrum?', 'How do I get to the centre?', { altEn: ['How do you get to the centre?', 'How can I get to the city centre?'], extra: ['dojść', 'jechać'] }],
        ['Jutro wyjeżdżam na urlop.', "I'm going away on holiday tomorrow.", { altEn: ["Tomorrow I'm going on holiday.", "I'm leaving on holiday tomorrow."], extra: ['przyjeżdżam', 'urlopie'] }],
        ['Musimy przesiąść się w Poznaniu.', 'We have to change in Poznań.', { altEn: ['We need to change trains in Poznań.', 'We have to change in Poznan.'], altPl: ['Musimy się przesiąść w Poznaniu.'], extra: ['przesiadka', 'Poznań'] }],
      ],
      drills: [
        ['Kiedy ___ do Polski?', 'When did you arrive in Poland? (to a man)', ['przyjechałeś', 'wyjechałeś', 'przyszedłeś'], 'przyjechałeś', 'A long way means transport: przyjechać.'],
        ['Jak ___ na lotnisko?', 'How do I get to the airport?', ['dojechać', 'wyjechać', 'przejechać'], 'dojechać', 'do-: reaching a place.'],
        ['Jutro ___ z Warszawy.', "I'm leaving Warsaw tomorrow.", ['wyjeżdżam', 'przyjeżdżam', 'wchodzę'], 'wyjeżdżam'],
      ],
      spotlight: {
        title: 'Jechać with prefixes',
        body: [
          'The same prefixes work with {jechać}: {przyjechać} (arrive), {wyjechać} (leave, go away), {dojechać} (get to), {przejechać} (go through, or go past your stop!), {zjechać} (turn off, come down).',
          'Asking the way by transport: {Jak dojechać do…?} On foot: {Jak dojść do…?}',
        ],
      },
      dialogue: [
        ['Tom', 'Przepraszam, jak dojechać do Starego Miasta?', 'Excuse me, how do I get to the Old Town?'],
        ['Pani', 'Tramwajem numer dwa. Ale w centrum trzeba się przesiąść.', 'Tram number two. But you have to change in the centre.'],
        ['Tom', 'A ile to trwa?', 'And how long does it take?'],
        ['Pani', 'Około dwudziestu minut. Tylko proszę nie przejechać przystanku!', "About twenty minutes. Just don't miss your stop!"],
      ],
    }),
    lesson('u30-l3', 'At the airport', 'Handle departures, arrivals and delays.', {
      items: [
        ['odlot', 'departure', { altEn: ['departures'], g: 'm' }],
        ['przylot', 'arrival', { altEn: ['arrivals'], g: 'm' }],
        ['bagaż', 'luggage', { altEn: ['baggage', 'bags'], g: 'm' }],
        ['bagaż podręczny', 'hand luggage', { altEn: ['carry-on'] }],
        ['odprawa', 'check-in', { g: 'f' }],
        ['bramka', 'gate', { g: 'f' }],
        ['lot', 'flight', { g: 'm' }],
        ['odwołany', 'cancelled', { altEn: ['canceled'] }],
      ],
      sentences: [
        ['Lot do Londynu jest opóźniony.', 'The flight to London is delayed.', { extra: ['lotu', 'odwołany'] }],
        ['Gdzie jest odprawa?', 'Where is check-in?', { altEn: ["Where's check-in?", 'Where is the check-in desk?'], extra: ['odlot', 'bramka'] }],
        ['Mam tylko bagaż podręczny.', 'I only have hand luggage.', { altEn: ["I've only got hand luggage.", 'I have only hand luggage.'], extra: ['bagażu', 'duży'] }],
        ['Mój lot został odwołany.', 'My flight has been cancelled.', { altEn: ['My flight was cancelled.'], extra: ['odwołana', 'jest'] }],
      ],
      drills: [
        ['Proszę iść do ___ numer pięć.', 'Please go to gate five.', ['bramki', 'bramka', 'bramkę'], 'bramki', 'do + genitive.'],
        ['Mój lot jest ___.', 'My flight is cancelled.', ['odwołany', 'odwołana', 'odwołane'], 'odwołany'],
        ['Gdzie mogę odebrać ___?', 'Where can I collect my luggage?', ['bagaż', 'bagażu', 'bagażem'], 'bagaż', 'odebrać + accusative: masculine things don\'t change.'],
      ],
      spotlight: {
        title: 'Signs at the airport',
        body: [
          'Boards show {Odloty} (departures) and {Przyloty} (arrivals); a flight can be {opóźniony} (delayed) or {odwołany} (cancelled). Announcements begin {Pasażerowie proszeni są…} ("passengers are requested…").',
          'If your bag doesn\'t arrive, look for {Zagubiony bagaż} (lost luggage).',
        ],
      },
      dialogue: [
        ['Pasażer', 'Dzień dobry, mój lot do Manchesteru został odwołany.', 'Hello, my flight to Manchester has been cancelled.'],
        ['Pracownica', 'Przepraszamy. Mamy wolne miejsce w samolocie o osiemnastej.', 'We apologise. We have a free seat on the six o\'clock plane.'],
        ['Pasażer', 'Dobrze. A mój bagaż?', 'OK. And my luggage?'],
        ['Pracownica', 'Bagaż poleci z panem. Proszę iść do bramki numer dwanaście.', 'Your luggage will fly with you. Please go to gate twelve.'],
      ],
    }),
  ],
);

export const u29 = unit(
  29,
  'B1',
  'Work & home',
  'Praca i dom',
  'Your working week, the phone, and renting a flat — and getting things fixed.',
  [
    lesson('u29-l1', 'At work', 'Talk about your job and your working week.', {
      items: [
        ['biuro', 'office', { g: 'n' }],
        ['szef', 'boss', { altEn: ['manager'], g: 'm' }],
        ['kolega z pracy', 'colleague', { altEn: ['work colleague', 'coworker'] }],
        ['urlop', 'holiday', { altEn: ['leave', 'time off', 'annual leave'], g: 'm', hint: 'Time off work. School and summer holidays are {wakacje}.' }],
        ['pracuję zdalnie', 'I work from home', { altEn: ['i work remotely'] }],
        ['na pełen etat', 'full-time', { altEn: ['full time'] }],
        ['zarabiać', 'to earn'],
        ['zwolnienie lekarskie', 'sick leave', { altEn: ['sick note'] }],
      ],
      sentences: [
        ['Pracuję zdalnie dwa dni w tygodniu.', 'I work from home two days a week.', { altEn: ['I work remotely two days a week.'], extra: ['pracuje', 'tydzień'] }],
        ['Szef jest na urlopie do poniedziałku.', 'The boss is on holiday until Monday.', { altEn: ['The boss is on leave until Monday.', 'The manager is on holiday until Monday.'], extra: ['urlop', 'poniedziałek'] }],
        ['Mam dzisiaj dużo spotkań.', 'I have a lot of meetings today.', { altEn: ["I've got lots of meetings today.", 'I have lots of meetings today.'], altPl: ['Mam dziś dużo spotkań.', 'Dzisiaj mam dużo spotkań.'], extra: ['spotkania', 'mało'] }],
        ['Jestem na zwolnieniu lekarskim.', "I'm on sick leave.", { altEn: ['I am on sick leave.', "I'm off sick."], extra: ['zwolnienie', 'w'] }],
      ],
      drills: [
        ['Szef jest na ___.', 'The boss is on holiday.', ['urlopie', 'urlop', 'urlopu'], 'urlopie', 'na + locative: where someone is.'],
        ['Pracuję ___ pełen etat.', 'I work full-time.', ['na', 'w', 'z'], 'na'],
        ['Ile ___ w tej firmie?', 'How much do you earn at this company?', ['zarabiasz', 'zarabiam', 'zarabia'], 'zarabiasz', 'Careful: money is a private subject in Poland.'],
      ],
      spotlight: {
        title: 'Urlop or wakacje?',
        body: [
          'Time off work is {urlop}: {Jestem na urlopie} (I\'m on holiday, on leave). {Wakacje} are the school and summer holidays. Off sick is {na zwolnieniu}; people call the doctor\'s note {L4}, after an old form.',
          'Colleagues often move from {pan} / {pani} to first names quickly, but wait for the older or more senior person to suggest it: {Mówmy sobie po imieniu} (let\'s use first names).',
        ],
      },
      dialogue: [
        ['Marta', 'Cześć! Pracujesz dziś z domu?', 'Hi! Are you working from home today?'],
        ['Ben', 'Tak, pracuję zdalnie we wtorki i w piątki.', 'Yes, I work from home on Tuesdays and Fridays.'],
        ['Marta', 'Szczęściarz! A szef?', 'Lucky you! And the boss?'],
        ['Ben', 'Jest na urlopie do poniedziałku, więc jest spokojnie.', "He's on holiday until Monday, so it's quiet."],
      ],
    }),
    lesson('u29-l2', 'On the phone', 'Make and take a phone call.', {
      items: [
        ['halo?', 'hello? (on the phone)', { altEn: ['hello?'] }],
        ['dzwonię w sprawie', "I'm calling about", { altEn: ["i'm ringing about", "i'm phoning about"] }],
        ['czy mogę rozmawiać z…?', 'may I speak to…?', { altEn: ['can i speak to', 'could i speak to'] }],
        ['kto mówi?', "who's speaking?", { altEn: ["who's calling?", 'who is this?'] }],
        ['oddzwonię', "I'll call back", { altEn: ["i'll ring back", "i'll call you back"] }],
        ['pomyłka', 'wrong number', { altEn: ['mistake'], g: 'f' }],
        ['nie słychać cię', "I can't hear you", { altEn: ["you're breaking up"] }],
        ['wiadomość', 'message', { altEn: ['text', 'news'], g: 'f' }],
      ],
      sentences: [
        ['Halo? Dzień dobry, dzwonię w sprawie mieszkania.', "Hello? Good morning, I'm calling about the flat.", { altEn: ["Hello? Hello, I'm ringing about the flat.", "Hello? Good afternoon, I'm calling about the flat."], extra: ['sprawa', 'mieszkanie'] }],
        ['Czy mogę rozmawiać z panem Nowakiem?', 'May I speak to Mr Nowak?', { altEn: ['Can I speak to Mr Nowak?', 'Could I speak to Mr Nowak?'], altPl: ['Mogę rozmawiać z panem Nowakiem?'], extra: ['pan', 'Nowak'] }],
        ['Przepraszam, pomyłka.', 'Sorry, wrong number.', { extra: ['pomyłki', 'proszę'] }],
        ['Nie słychać cię, oddzwonię później.', "I can't hear you, I'll call back later.", { altEn: ["I can't hear you, I'll ring you back later.", "You're breaking up, I'll call you back later."], extra: ['dzwonię', 'słyszę'] }],
      ],
      drills: [
        ['Dzwonię w ___ rezerwacji.', "I'm calling about the booking.", ['sprawie', 'sprawa', 'sprawę'], 'sprawie', 'w sprawie + genitive: "in the matter of".'],
        ['Czy mogę rozmawiać z ___ Anną?', 'May I speak to Anna? (formal)', ['panią', 'pani', 'panem'], 'panią', 'z + instrumental: z panią.'],
        ['Dobrze, ___ jutro.', "OK, I'll call back tomorrow.", ['oddzwonię', 'dzwonię', 'dzwoniłem'], 'oddzwonię'],
      ],
      spotlight: {
        title: 'Phone Polish',
        body: [
          'Poles answer with {Halo?}, {Słucham?} ("I\'m listening") or their name. To ask for someone formally: {Czy mogę rozmawiać z panem / z panią…?}, with the name in the instrumental.',
          'If the line is bad: {Nie słychać cię} (I can\'t hear you) and {Oddzwonię} (I\'ll call back). Many people would rather get a {wiadomość} (a message) than a call.',
        ],
      },
      dialogue: [
        ['Recepcja', 'Przychodnia „Zdrowie”, słucham?', '"Zdrowie" Surgery, hello?'],
        ['Emma', 'Dzień dobry, dzwonię w sprawie wizyty. Czy mogę rozmawiać z doktor Kowalską?', "Good morning, I'm calling about an appointment. May I speak to Dr Kowalska?"],
        ['Recepcja', 'Pani doktor ma teraz pacjenta. Może oddzwonić do pani?', 'The doctor is with a patient now. Can she call you back?'],
        ['Emma', 'Tak, oczywiście. Dziękuję!', 'Yes, of course. Thank you!'],
      ],
    }),
    lesson('u29-l3', 'Renting a flat', 'Find a flat, and get things fixed.', {
      items: [
        ['wynająć', 'to rent', { altEn: ['to let'] }],
        ['czynsz', 'rent', { g: 'm' }],
        ['kaucja', 'deposit', { g: 'f' }],
        ['pokój', 'room', { g: 'm' }],
        ['łazienka', 'bathroom', { g: 'f' }],
        ['kuchnia', 'kitchen', { g: 'f' }],
        ['właściciel', 'landlord', { altEn: ['owner'], g: 'm' }],
        ['coś się zepsuło', 'something has broken', { altEn: ['something broke', "something's broken"] }],
      ],
      sentences: [
        ['Chciałbym wynająć mieszkanie w centrum.', "I'd like to rent a flat in the centre.", { altPl: ['Chciałabym wynająć mieszkanie w centrum.'], altEn: ['I would like to rent a flat in the centre.', "I'd like to rent an apartment in the centre."], extra: ['wynajmę', 'mieszkania'] }],
        ['Ile wynosi czynsz?', 'How much is the rent?', { altEn: ["What's the rent?"], extra: ['czynszu', 'kosztuje'] }],
        ['W łazience coś się zepsuło.', "Something's broken in the bathroom.", { altEn: ['Something has broken in the bathroom.'], extra: ['łazienka', 'zepsuł'] }],
        ['Kaucja to jeden miesięczny czynsz.', "The deposit is one month's rent.", { altEn: ["The deposit is a month's rent."], extra: ['kaucji', 'dwa'] }],
      ],
      drills: [
        ['Chcę ___ pokój.', 'I want to rent a room.', ['wynająć', 'wynajmuję', 'wynajmę'], 'wynająć', 'chcę + infinitive.'],
        ['Coś się zepsuło w ___.', 'Something has broken in the kitchen.', ['kuchni', 'kuchnia', 'kuchnię'], 'kuchni', 'w + locative: kuchnia → w kuchni.'],
        ['Ile wynosi ___?', 'How much is the deposit?', ['kaucja', 'kaucję', 'kaucji'], 'kaucja', 'The deposit is the subject: the plain form.'],
      ],
      spotlight: {
        title: 'Renting in Poland',
        body: [
          'Adverts list the rent ({czynsz}) and often extra charges ({opłaty}: water, heating, service charge) separately, so ask {Czy czynsz jest z opłatami?} A deposit ({kaucja}) of one or two months\' rent is usual.',
          'When something breaks, tell the landlord ({właściciel} / {właścicielka}): {Coś się zepsuło}, {Nie działa ogrzewanie} (the heating isn\'t working), {Cieknie kran} (the tap is dripping).',
        ],
      },
      dialogue: [
        ['Jack', 'Dzień dobry, dzwonię w sprawie pokoju do wynajęcia.', "Good morning, I'm calling about the room to rent."],
        ['Właścicielka', 'Tak, pokój jest jeszcze wolny. Czynsz to tysiąc dwieście złotych.', 'Yes, the room is still free. The rent is twelve hundred złoty.'],
        ['Jack', 'Z opłatami?', 'Including bills?'],
        ['Właścicielka', 'Tak, z opłatami. I kaucja: jeden miesięczny czynsz.', "Yes, including bills. And a deposit: one month's rent."],
        ['Jack', 'Świetnie. Kiedy mogę go zobaczyć?', 'Great. When can I see it?'],
      ],
    }),
  ],
);

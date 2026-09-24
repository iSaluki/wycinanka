import { lesson, unit } from '../build';

export const u11 = unit(
  11,
  'A2',
  'What I did',
  'Co robiłem',
  'The past tense: one simple pattern, with endings that show whether a man or a woman is speaking.',
  [
    lesson('u11-l1', 'I was, you were', 'Use the past of być.', {
      items: [
        ['byłem', 'I was', { altPl: ['byłam'], hint: 'A woman says byłam.' }],
        ['byłeś', 'you were', { altPl: ['byłaś'], hint: 'To a woman: byłaś.' }],
        ['był', 'he was', { altEn: ['it was', 'was'] }],
        ['była', 'she was', { altEn: ['was'] }],
        ['było', 'it was', { altEn: ['there was'] }],
        ['byliśmy', 'we were', { altPl: ['byłyśmy'], hint: 'All-female group: byłyśmy.' }],
        ['byli', 'they were (men or mixed)', { altEn: ['they were'], hint: 'For groups including a man.' }],
        ['były', 'they were (women or things)', { altEn: ['they were'], hint: 'For women, children, animals and things.' }],
      ],
      sentences: [
        ['Wczoraj byłem w pracy.', 'Yesterday I was at work.', { altEn: ['I was at work yesterday.'], altPl: ['Wczoraj byłam w pracy.', 'Byłem wczoraj w pracy.', 'Byłam wczoraj w pracy.'], extra: ['jestem', 'była'] }],
        ['Gdzie byłeś?', 'Where were you?', { altEn: ['Where have you been?'], altPl: ['Gdzie byłaś?'], extra: ['jesteś', 'był'] }],
        ['To było bardzo dobre.', 'It was very good.', { altEn: ['That was very good.', 'This was very good.'], extra: ['był', 'jest'] }],
        ['Byliśmy w Polsce.', 'We were in Poland.', { altEn: ['We have been to Poland.', "We've been to Poland."], altPl: ['Byłyśmy w Polsce.'], extra: ['byli', 'Polska'] }],
      ],
      drills: [
        ['Wczoraj (ja — Anna) ___ w domu.', 'Anna: I was at home yesterday.', ['byłam', 'byłem', 'była'], 'byłam', 'A woman speaking about herself: -łam.'],
        ['Tom ___ w pracy.', 'Tom was at work.', ['był', 'była', 'byli'], 'był'],
        ['Kasiu, czy ___ w Krakowie?', 'Kasia, were you in Kraków?', ['byłaś', 'byłeś', 'była'], 'byłaś'],
        ['Adam i Ewa ___ w kinie.', 'Adam and Ewa were at the cinema.', ['byli', 'były', 'był'], 'byli', 'A group with at least one man uses -li.'],
      ],
      spotlight: {
        title: 'The past tense shows your gender',
        body: [
          'Take the infinitive, drop **-ć**, add **-ł-** and then an ending. The ending shows the person and, in the singular, the speaker\'s gender: a man says {byłem}, a woman says {byłam}.',
          'In the plural, Polish splits groups into **"at least one man"** ({byli}) and **"no men"** ({były}).',
        ],
        table: {
          head: ['', 'man', 'woman'],
          rows: [
            ['I', 'byłem', 'byłam'],
            ['you', 'byłeś', 'byłaś'],
            ['he / she / it', 'był', 'była / było'],
            ['we', 'byliśmy', 'byłyśmy'],
            ['you (pl.)', 'byliście', 'byłyście'],
            ['they', 'byli', 'były'],
          ],
        },
      },
      dialogue: [
        ['Ola', 'Gdzie byłeś wczoraj?', 'Where were you yesterday?'],
        ['Tom', 'Byłem w pracy. A ty?', 'I was at work. And you?'],
        ['Ola', 'Byłam w domu. Było zimno!', 'I was at home. It was cold!'],
      ],
    }),
    lesson('u11-l2', 'I worked, I watched', 'Form the past of regular verbs.', {
      items: [
        ['robiłem', 'I was doing', { altPl: ['robiłam'], altEn: ['i did', 'i made', 'i was making'] }],
        ['czytałam', 'I was reading', { altPl: ['czytałem'], altEn: ['i read'] }],
        ['pracowałem', 'I worked', { altPl: ['pracowałam'], altEn: ['i was working'] }],
        ['mieszkałam', 'I lived', { altPl: ['mieszkałem'], altEn: ['i was living', 'i used to live'] }],
        ['oglądaliśmy', 'we watched', { altPl: ['oglądałyśmy'], altEn: ['we were watching'] }],
        ['mówił', 'he said', { altEn: ['he was saying', 'he spoke', 'he was speaking', 'he talked'] }],
        ['co robiłeś?', 'what were you doing?', { altPl: ['co robiłaś?'], altEn: ['what did you do?'] }],
      ],
      sentences: [
        ['Wczoraj pracowałem do późna.', 'Yesterday I worked late.', { altEn: ['I worked late yesterday.'], altPl: ['Wczoraj pracowałam do późna.'], extra: ['pracuję', 'późno'] }],
        ['Co robiłaś w weekend?', 'What did you do at the weekend?', { altEn: ['What were you doing at the weekend?', 'What did you do over the weekend?'], altPl: ['Co robiłeś w weekend?'], extra: ['robisz', 'na'] }],
        ['Mieszkałam w Warszawie.', 'I lived in Warsaw.', { altEn: ['I used to live in Warsaw.'], altPl: ['Mieszkałem w Warszawie.'], extra: ['mieszkam', 'Warszawa'] }],
        ['Oglądaliśmy film.', 'We watched a film.', { altEn: ['We were watching a film.', 'We watched a movie.'], altPl: ['Oglądałyśmy film.'], extra: ['oglądamy', 'filmu'] }],
      ],
      drills: [
        ['Wczoraj (ja — Tom) ___ książkę.', 'Tom: I was reading a book yesterday.', ['czytałem', 'czytałam', 'czytał'], 'czytałem'],
        ['Ona ___ w Londynie.', 'She lived in London.', ['mieszkała', 'mieszkał', 'mieszkałam'], 'mieszkała'],
        ['Moi rodzice ___ film.', 'My parents watched a film.', ['oglądali', 'oglądały', 'oglądał'], 'oglądali'],
        ['Kasia i Ola ___ w banku.', 'Kasia and Ola worked in a bank.', ['pracowały', 'pracowali', 'pracowała'], 'pracowały', 'No men in the group: -ły.'],
      ],
      spotlight: {
        title: 'Past endings',
        body: [
          'The same endings work for almost every verb. From {czytać}: drop -ć → {czyta-} → add -ł + ending.',
          'Past tense is often about background and duration with these verbs: {czytałem} = "I was reading / I read (for a while)". Unit 12 shows how to say you *finished* something.',
        ],
        table: {
          head: ['', 'man', 'woman'],
          rows: [
            ['I', 'czytałem', 'czytałam'],
            ['you', 'czytałeś', 'czytałaś'],
            ['he / she', 'czytał', 'czytała'],
            ['we', 'czytaliśmy', 'czytałyśmy'],
            ['they', 'czytali', 'czytały'],
          ],
        },
      },
      dialogue: [
        ['Marek', 'Co robiłaś w weekend?', 'What did you do at the weekend?'],
        ['Kasia', 'Czytałam i oglądałam filmy. A ty?', 'I read and watched films. And you?'],
        ['Marek', 'Pracowałem.', 'I worked.'],
        ['Kasia', 'Biedny!', 'Poor you!'],
      ],
    }),
    lesson('u11-l3', 'I went, I ate', 'Use common irregular past forms.', {
      items: [
        ['jadłem', 'I ate', { altPl: ['jadłam'], altEn: ['i was eating'] }],
        ['piłam', 'I drank', { altPl: ['piłem'], altEn: ['i was drinking'] }],
        ['poszedłem', 'I went (on foot)', { altPl: ['poszłam'], altEn: ['i went'], hint: 'On foot. A woman says poszłam.' }],
        ['pojechałem', 'I went (by transport)', { altPl: ['pojechałam'], altEn: ['i went', 'i drove', 'i travelled'], hint: 'By car, train, bus…' }],
        ['miałam', 'I had', { altPl: ['miałem'] }],
        ['chciałem', 'I wanted', { altPl: ['chciałam'] }],
        ['mogłam', 'I could', { altPl: ['mogłem'], altEn: ['i was able to'] }],
        ['wziąłem', 'I took', { altPl: ['wzięłam'] }],
      ],
      sentences: [
        ['Poszłam do sklepu.', 'I went to the shop.', { altPl: ['Poszedłem do sklepu.'], extra: ['idę', 'sklep'] }],
        ['Pojechaliśmy do Gdańska pociągiem.', 'We went to Gdańsk by train.', { altEn: ['We travelled to Gdańsk by train.', 'We took the train to Gdańsk.'], altPl: ['Pojechałyśmy do Gdańska pociągiem.'], extra: ['poszliśmy', 'pociąg'] }],
        ['Jadłem pierogi w Krakowie.', 'I ate pierogi in Kraków.', { altEn: ['I had pierogi in Kraków.', 'I ate dumplings in Kraków.'], altPl: ['Jadłam pierogi w Krakowie.'], extra: ['jem', 'Kraków'] }],
        ['Nie mogłem przyjść.', "I couldn't come.", { altEn: ['I could not come.', "I wasn't able to come."], altPl: ['Nie mogłam przyjść.'], extra: ['mogę', 'iść'] }],
      ],
      drills: [
        ['Wczoraj Tom ___ do kina.', 'Yesterday Tom went to the cinema (walking).', ['poszedł', 'poszła', 'pojechał'], 'poszedł'],
        ['Anna ___ do Krakowa.', 'Anna went to Kraków (by train).', ['pojechała', 'poszła', 'pojechał'], 'pojechała', 'A long distance means transport: pojechać.'],
        ['(ja — Ewa) ___ dużo kawy.', 'Ewa: I drank a lot of coffee.', ['piłam', 'piłem', 'piła'], 'piłam'],
      ],
      dialogue: [
        ['Emma', 'Wczoraj pojechałam do Krakowa.', 'Yesterday I went to Kraków.'],
        ['Piotr', 'Super! Co jadłaś?', 'Great! What did you eat?'],
        ['Emma', 'Pierogi! I piłam dużo kawy.', 'Pierogi! And I drank a lot of coffee.'],
      ],
    }),
  ],
);

export const u12 = unit(
  12,
  'A2',
  'Aspect',
  'Aspekt',
  'Almost every Polish verb comes in a pair: one for the process, one for the finished result.',
  [
    lesson('u12-l1', 'Process or result?', 'Choose between imperfective and perfective.', {
      items: [
        ['zrobić', 'to do', { altEn: ['to make', 'to get done'], hint: 'Perfective of robić.' }],
        ['przeczytać', 'to read', { altEn: ['to finish reading', 'to read through'], hint: 'Perfective of czytać.' }],
        ['napisać', 'to write', { altEn: ['to finish writing'], hint: 'Perfective of pisać.' }],
        ['wypić', 'to drink', { altEn: ['to drink up'], hint: 'Perfective of pić.' }],
        ['zjeść', 'to eat', { altEn: ['to eat up'], hint: 'Perfective of jeść.' }],
        ['obejrzeć', 'to watch', { altEn: ['to see (a film)', 'to watch (to the end)'], hint: 'Perfective of oglądać.' }],
        ['kupić', 'to buy', { hint: 'Perfective of kupować.' }],
      ],
      sentences: [
        ['Przeczytałam tę książkę.', "I've read this book.", { altEn: ['I read this book.', 'I have read this book.', 'I finished this book.', 'I read that book.'], altPl: ['Przeczytałem tę książkę.'], extra: ['czytałam', 'ta'] }],
        ['Codziennie piję kawę.', 'I drink coffee every day.', { altEn: ['Every day I drink coffee.'], altPl: ['Piję kawę codziennie.'], extra: ['wypiję', 'kawa'] }],
        ['Czy zjadłeś już obiad?', 'Have you had lunch yet?', { altEn: ['Have you eaten lunch yet?', 'Did you have lunch already?', 'Have you already had lunch?', 'Have you had dinner yet?'], altPl: ['Zjadłeś już obiad?', 'Czy zjadłaś już obiad?', 'Zjadłaś już obiad?', 'Czy już zjadłeś obiad?'], extra: ['jadłeś', 'jem'] }],
        ['Kupiłem nowy telefon.', 'I bought a new phone.', { altEn: ["I've bought a new phone.", 'I have bought a new phone.'], altPl: ['Kupiłam nowy telefon.'], extra: ['kupowałem', 'nowa'] }],
      ],
      drills: [
        ['Wczoraj ___ cały film.', 'Yesterday I watched the whole film.', ['obejrzałem', 'oglądałem'], 'obejrzałem', '"The whole film" is a completed result → perfective.'],
        ['Codziennie ___ kawę.', 'I drink coffee every day.', ['piję', 'wypiję'], 'piję', 'Habits and repeated actions → imperfective.'],
        ['Już ___ zupę.', "I've already eaten the soup.", ['zjadłem', 'jadłem'], 'zjadłem', '"Already" + finished → perfective.'],
        ['Często ___ książki.', 'I often read books.', ['czytam', 'przeczytam'], 'czytam'],
        ['Kiedy zadzwoniłaś, ___ obiad.', 'When you rang, I was eating lunch.', ['jadłam', 'zjadłam'], 'jadłam', 'Background "was doing" → imperfective.'],
      ],
      spotlight: {
        title: 'Aspect: the movie or the snapshot',
        body: [
          'Polish verbs come in pairs. The **imperfective** describes a process, habit or ongoing action — the movie. The **perfective** describes one complete, finished result — the snapshot.',
          'English uses tenses for this ("I was reading" vs "I\'ve read"); Polish uses a different verb. Perfectives are usually the imperfective plus a prefix ({czytać → przeczytać}), but sometimes a different form ({kupować → kupić}).',
        ],
        table: {
          head: ['Imperfective (process)', 'Perfective (result)'],
          rows: [
            ['robić', 'zrobić'],
            ['czytać', 'przeczytać'],
            ['pisać', 'napisać'],
            ['pić', 'wypić'],
            ['jeść', 'zjeść'],
            ['oglądać', 'obejrzeć'],
            ['kupować', 'kupić'],
          ],
        },
        examples: [
          ['Czytałem książkę.', 'I was reading a book.'],
          ['Przeczytałem książkę.', "I read the book (and finished it)."],
        ],
      },
      dialogue: [
        ['Mama', 'Zjadłeś już obiad?', 'Have you had lunch yet?'],
        ['Tomek', 'Tak, zjadłem zupę.', 'Yes, I ate the soup.'],
        ['Mama', 'A przeczytałeś książkę?', 'And have you read the book?'],
        ['Tomek', 'Jeszcze nie. Czytam!', 'Not yet. I\'m reading it!'],
      ],
    }),
    lesson('u12-l2', 'More pairs', 'Learn high-frequency aspect pairs.', {
      items: [
        ['dać', 'to give', { hint: 'Perfective of dawać.' }],
        ['powiedzieć', 'to say', { altEn: ['to tell'], hint: 'Perfective of mówić.' }],
        ['wziąć', 'to take', { hint: 'Perfective of brać.' }],
        ['zobaczyć', 'to see', { hint: 'Perfective of widzieć.' }],
        ['wrócić', 'to come back', { altEn: ['to return', 'to go back'], hint: 'Perfective of wracać.' }],
        ['zamknąć', 'to close', { altEn: ['to shut'], hint: 'Perfective of zamykać.' }],
        ['otworzyć', 'to open', { hint: 'Perfective of otwierać.' }],
        ['zapomnieć', 'to forget', { hint: 'Perfective of zapominać.' }],
      ],
      sentences: [
        ['Co powiedziałeś?', 'What did you say?', { altPl: ['Co powiedziałaś?'], extra: ['mówisz', 'mówiłeś'] }],
        ['Wezmę to.', "I'll take it.", { altEn: ['I will take it.', "I'll take this."], extra: ['biorę', 'wziąć'] }],
        ['Zobaczymy.', "We'll see.", { altEn: ['We will see.'], extra: ['widzimy', 'zobaczę'] }],
        ['Zamknij okno, proszę.', 'Close the window, please.', { altEn: ['Please close the window.', 'Shut the window, please.'], altPl: ['Proszę, zamknij okno.'], extra: ['otwórz', 'drzwi'] }],
        ['Zapomniałam hasła.', "I've forgotten my password.", { altEn: ['I forgot my password.', 'I forgot the password.'], altPl: ['Zapomniałem hasła.'], extra: ['hasło', 'pamiętam'] }],
      ],
      drills: [
        ['Czy możesz ___ drzwi?', 'Can you open the door?', ['otworzyć', 'otwierać'], 'otworzyć', 'One single action → perfective.'],
        ['Zawsze ___ klucze!', 'I always forget my keys!', ['zapominam', 'zapomnę'], 'zapominam', '"Always" → repeated → imperfective.'],
        ['Kiedy ___ do domu?', 'When will you come back home?', ['wrócisz', 'wracasz'], 'wrócisz', 'Perfective present form = future.'],
      ],
      dialogue: [
        ['Kasia', 'Co powiedziałeś?', 'What did you say?'],
        ['Tom', 'Zamknij okno, proszę. Zimno mi.', 'Close the window, please. I\'m cold.'],
        ['Kasia', 'Dobrze. A drzwi?', 'OK. And the door?'],
        ['Tom', 'Drzwi już zamknąłem.', 'I\'ve already closed the door.'],
      ],
    }),
    lesson('u12-l3', 'Signal words', 'Let time words guide your choice of aspect.', {
      items: [
        ['codziennie', 'every day', { altEn: ['daily'] }],
        ['często', 'often'],
        ['zawsze', 'always'],
        ['nigdy', 'never'],
        ['już', 'already', { altEn: ['yet', 'now'] }],
        ['jeszcze nie', 'not yet'],
        ['właśnie', 'just', { altEn: ['exactly', 'right now'] }],
        ['w końcu', 'finally', { altEn: ['at last', 'in the end', 'eventually'] }],
      ],
      sentences: [
        ['Zawsze piję herbatę rano.', 'I always drink tea in the morning.', { altEn: ['I always have tea in the morning.'], altPl: ['Rano zawsze piję herbatę.'], extra: ['wypiję', 'wieczorem'] }],
        ['Nigdy nie byłem w Gdańsku.', "I've never been to Gdańsk.", { altEn: ['I have never been to Gdańsk.', 'I was never in Gdańsk.'], altPl: ['Nigdy nie byłam w Gdańsku.'], extra: ['zawsze', 'Gdańsk'] }],
        ['Jeszcze nie skończyłem.', "I haven't finished yet.", { altEn: ['I have not finished yet.', 'Not finished yet.'], altPl: ['Jeszcze nie skończyłam.'], extra: ['już', 'kończę'] }],
        ['W końcu kupiliśmy mieszkanie.', 'We finally bought a flat.', { altEn: ['Finally we bought a flat.', 'At last we bought a flat.', 'We have finally bought a flat.'], altPl: ['W końcu kupiłyśmy mieszkanie.'], extra: ['kupowaliśmy', 'dom'] }],
      ],
      drills: [
        ['Często ___ do mamy.', 'I often ring my mum.', ['dzwonię', 'zadzwonię'], 'dzwonię'],
        ['Właśnie ___ list.', "I've just written the letter.", ['napisałem', 'pisałem'], 'napisałem'],
        ['Nigdy ___ w Polsce.', "I've never been to Poland.", ['nie byłem', 'byłem'], 'nie byłem', 'Polish uses double negatives: nigdy nie.'],
      ],
      spotlight: {
        title: 'Double negatives are correct',
        body: [
          'Words like {nigdy} (never), {nic} (nothing) and {nikt} (nobody) need {nie} with the verb too: {Nigdy nie byłem} — literally "I never wasn\'t".',
          'Signal words help with aspect: {codziennie, często, zawsze, zwykle} point to the imperfective; {już, właśnie, w końcu} often point to the perfective.',
        ],
      },
      dialogue: [
        ['Ewa', 'Byłeś już w Gdańsku?', 'Have you been to Gdańsk yet?'],
        ['Ben', 'Nie, nigdy nie byłem.', 'No, I\'ve never been.'],
        ['Ewa', 'Szkoda! Musisz w końcu pojechać.', 'Shame! You must go some time.'],
      ],
    }),
  ],
);

export const u13 = unit(
  13,
  'A2',
  'Plans & the future',
  'Plany',
  'Two ways to talk about the future, depending on aspect.',
  [
    lesson('u13-l1', 'I will be', 'Use będę for the future.', {
      items: [
        ['będę', 'I will be', { altEn: ["i'll be", 'i will'] }],
        ['będziesz', 'you will be', { altEn: ["you'll be", 'you will'] }],
        ['będzie', 'will be', { altEn: ['he will be', 'she will be', 'it will be', 'there will be'] }],
        ['będziemy', 'we will be', { altEn: ["we'll be", 'we will'] }],
        ['będą', 'they will be', { altEn: ["they'll be", 'they will'] }],
        ['będę pracować', "I'll be working", { altEn: ['i will work', 'i will be working', "i'll work"], altPl: ['będę pracował', 'będę pracowała'] }],
        ['będę czekać', "I'll wait", { altEn: ["i'll be waiting", 'i will wait', 'i will be waiting'], altPl: ['będę czekał', 'będę czekała'] }],
      ],
      sentences: [
        ['Jutro będę w pracy.', "I'll be at work tomorrow.", { altEn: ['Tomorrow I will be at work.', "Tomorrow I'll be at work."], altPl: ['Będę jutro w pracy.'], extra: ['byłem', 'jestem'] }],
        ['Będę czekać na dworcu.', "I'll wait at the station.", { altEn: ["I'll be waiting at the station.", 'I will wait at the station.'], altPl: ['Będę czekał na dworcu.', 'Będę czekała na dworcu.'], extra: ['czekam', 'dworzec'] }],
        ['Będzie padać.', "It's going to rain.", { altEn: ['It will rain.', "It's going to be raining."], extra: ['pada', 'było'] }],
        ['Co będziesz robić w sobotę?', 'What will you do on Saturday?', { altEn: ['What are you doing on Saturday?', 'What will you be doing on Saturday?'], altPl: ['Co będziesz robił w sobotę?', 'Co będziesz robiła w sobotę?'], extra: ['robisz', 'sobota'] }],
      ],
      drills: [
        ['Jutro ___ w domu.', "I'll be at home tomorrow.", ['będę', 'byłem', 'jestem'], 'będę'],
        ['Oni ___ w Polsce w lipcu.', "They'll be in Poland in July.", ['będą', 'będzie', 'będziemy'], 'będą'],
        ['Co ___ robić w weekend?', 'What will you do at the weekend?', ['będziesz', 'będę', 'będzie'], 'będziesz'],
      ],
      spotlight: {
        title: 'Future with imperfective verbs',
        body: [
          'For ongoing or repeated actions in the future, use {będę} + infinitive: {Będę pracować} (I\'ll be working). You will also hear {będę pracował / pracowała}, with a past-tense form. Both are correct.',
        ],
        table: {
          head: ['', 'być — future'],
          rows: [
            ['ja', 'będę'],
            ['ty', 'będziesz'],
            ['on / ona', 'będzie'],
            ['my', 'będziemy'],
            ['wy', 'będziecie'],
            ['oni / one', 'będą'],
          ],
        },
      },
      dialogue: [
        ['Marta', 'Co będziesz robić jutro?', 'What will you do tomorrow?'],
        ['Ben', 'Będę pracować. A wieczorem będę w domu.', 'I\'ll be working. And in the evening I\'ll be at home.'],
        ['Marta', 'A w sobotę?', 'And on Saturday?'],
        ['Ben', 'W sobotę będę w Krakowie.', 'On Saturday I\'ll be in Kraków.'],
      ],
    }),
    lesson('u13-l2', "I'll ring you", 'Make promises with perfective verbs.', {
      items: [
        ['zrobię', "I'll do it", { altEn: ['i will do', "i'll do", "i'll make"] }],
        ['zadzwonię', "I'll ring", { altEn: ["i'll call", 'i will call', 'i will ring', "i'll phone"] }],
        ['napiszę', "I'll write", { altEn: ['i will write', "i'll text"] }],
        ['kupię', "I'll buy", { altEn: ['i will buy', "i'll get"] }],
        ['przyjdę', "I'll come", { altEn: ['i will come'], hint: 'On foot.' }],
        ['pojadę', "I'll go", { altEn: ['i will go', "i'll travel", "i'll drive"], hint: 'By transport.' }],
        ['spróbuję', "I'll try", { altEn: ['i will try'] }],
      ],
      sentences: [
        ['Zadzwonię do ciebie wieczorem.', "I'll ring you this evening.", { altEn: ["I'll call you this evening.", "I'll call you in the evening.", "I'll ring you in the evening.", "I'll phone you this evening."], altPl: ['Wieczorem zadzwonię do ciebie.', 'Zadzwonię wieczorem.'], extra: ['dzwonię', 'ty'] }],
        ['Kupię chleb.', "I'll buy some bread.", { altEn: ["I'll buy bread.", "I'll get some bread.", 'I will buy bread.'], extra: ['kupuję', 'chleba'] }],
        ['Przyjdę o siódmej.', "I'll come at seven.", { altEn: ["I'll be there at seven.", 'I will come at seven.'], extra: ['przychodzę', 'siedem'] }],
        ['Spróbuję jeszcze raz.', "I'll try again.", { altEn: ["I'll try one more time.", 'I will try again.', "I'll have another go."], extra: ['próbuję', 'razy'] }],
      ],
      drills: [
        ['Jutro ___ do ciebie.', "I'll ring you tomorrow.", ['zadzwonię', 'dzwonię', 'zadzwoniłem'], 'zadzwonię'],
        ['Zaraz ___ to.', "I'll do it in a moment.", ['zrobię', 'robię', 'robiłem'], 'zrobię'],
      ],
      spotlight: {
        title: 'Perfective present = future',
        body: [
          'Perfective verbs have no present tense: their "present" forms mean the future. {Zrobię} = "I\'ll do it (and finish)". {Robię} = "I\'m doing it".',
          'So there are two futures: {będę robić} (I\'ll be doing — process) and {zrobię} (I\'ll get it done — result).',
        ],
      },
      dialogue: [
        ['Ola', 'Kupisz chleb?', 'Will you buy some bread?'],
        ['Adam', 'Tak, kupię chleb i mleko.', 'Yes, I\'ll buy bread and milk.'],
        ['Ola', 'Dziękuję! Zadzwonisz ze sklepu?', 'Thanks! Will you ring from the shop?'],
        ['Adam', 'Dobrze, zadzwonię.', 'OK, I\'ll ring.'],
      ],
    }),
    lesson('u13-l3', 'Next week', 'Talk about plans and intentions.', {
      items: [
        ['w przyszłym tygodniu', 'next week'],
        ['w przyszłym roku', 'next year'],
        ['za tydzień', 'in a week', { altEn: ["in a week's time"] }],
        ['za godzinę', 'in an hour', { altEn: ["in an hour's time"] }],
        ['wakacje', 'holidays', { altEn: ['holiday', 'summer holidays'], g: 'pl' }],
        ['mam zamiar', "I'm going to", { altEn: ['i intend to', "i'm planning to", 'i plan to'] }],
        ['chyba', 'probably', { altEn: ['i think', 'i guess', 'perhaps'] }],
        ['może', 'maybe', { altEn: ['perhaps'] }],
      ],
      sentences: [
        ['W przyszłym tygodniu jadę do Polski.', "Next week I'm going to Poland.", { altEn: ["I'm going to Poland next week.", 'Next week I am going to Poland.', "I'm travelling to Poland next week."], altPl: ['Jadę do Polski w przyszłym tygodniu.'], extra: ['idę', 'Polska'] }],
        ['Mam zamiar uczyć się codziennie.', 'I intend to study every day.', { altEn: ["I'm going to study every day.", "I'm planning to study every day.", 'I plan to study every day.'], extra: ['uczę', 'często'] }],
        ['Może pójdziemy do kina?', 'Shall we go to the cinema?', { altEn: ['Maybe we could go to the cinema?', 'How about going to the cinema?', 'Maybe we will go to the cinema?'], extra: ['idziemy', 'kino'] }],
        ['Wrócę za godzinę.', "I'll be back in an hour.", { altEn: ["I'll come back in an hour.", 'I will be back in an hour.'], extra: ['wracam', 'godzina'] }],
      ],
      dialogue: [
        ['Marta', 'Co robisz w weekend?', 'What are you doing at the weekend?'],
        ['Ben', 'W sobotę będę pracować, ale w niedzielę mam czas.', "I'm working on Saturday, but I'm free on Sunday."],
        ['Marta', 'Może pójdziemy do kina?', 'Shall we go to the cinema?'],
        ['Ben', 'Świetny pomysł! Zadzwonię do ciebie w niedzielę rano.', "Great idea! I'll ring you on Sunday morning."],
      ],
    }),
  ],
);

export const u14 = unit(
  14,
  'A2',
  'With & as',
  'Z kim? Kim?',
  'The instrumental case: "with" someone, "by" bus, and what you are.',
  [
    lesson('u14-l1', 'With milk, with friends', 'Use z + instrumental.', {
      items: [
        ['z mlekiem', 'with milk'],
        ['z cukrem', 'with sugar'],
        ['z cytryną', 'with lemon', { altEn: ['with a slice of lemon'] }],
        ['z przyjacielem', 'with a friend', { altEn: ['with my friend'] }],
        ['z mamą', 'with Mum', { altEn: ['with my mum', 'with mother', 'with my mother'] }],
        ['z tobą', 'with you'],
        ['ze mną', 'with me'],
        ['z nami', 'with us'],
      ],
      sentences: [
        ['Poproszę herbatę z cytryną.', 'Tea with lemon, please.', { altEn: ["I'd like tea with lemon, please.", 'A tea with lemon, please.'], extra: ['cytryna', 'mlekiem'] }],
        ['Mieszkam z przyjacielem.', 'I live with a friend.', { altEn: ['I live with my friend.', 'I share a flat with a friend.'], extra: ['przyjaciel', 'mieszka'] }],
        ['Czy idziesz z nami?', 'Are you coming with us?', { altEn: ['Are you going with us?', 'Will you come with us?'], altPl: ['Idziesz z nami?'], extra: ['my', 'mną'] }],
        ['Rozmawiałam z mamą.', 'I spoke to Mum.', { altEn: ['I talked to Mum.', 'I talked with my mum.', 'I spoke with my mum.', 'I was talking to Mum.'], altPl: ['Rozmawiałem z mamą.'], extra: ['mama', 'mamy'] }],
      ],
      drills: [
        ['Herbata z ___.', 'Tea with lemon.', ['cytryną', 'cytryna', 'cytrynę'], 'cytryną', 'Feminine: -a → -ą.'],
        ['Kawa z ___.', 'Coffee with sugar.', ['cukrem', 'cukier', 'cukru'], 'cukrem', 'Masculine and neuter: -em.'],
        ['Idę do kina z ___.', "I'm going to the cinema with Anna.", ['Anną', 'Anna', 'Annę'], 'Anną'],
        ['Czy pójdziesz ze ___?', 'Will you go with me?', ['mną', 'mnie', 'ja'], 'mną'],
      ],
      spotlight: {
        title: 'The instrumental case',
        body: [
          '{z} meaning "with" (together with) takes the **instrumental**. Endings are regular: **-em** for masculine and neuter, **-ą** for feminine.',
        ],
        table: {
          head: ['Noun', 'with…'],
          rows: [
            ['mleko', 'z mlekiem'],
            ['cukier', 'z cukrem'],
            ['cytryna', 'z cytryną'],
            ['mama', 'z mamą'],
            ['ja / ty / my', 'ze mną / z tobą / z nami'],
          ],
        },
      },
      dialogue: [
        ['Kelner', 'Kawa z mlekiem?', 'Coffee with milk?'],
        ['Emma', 'Nie, dla mnie herbata z cytryną.', 'No, tea with lemon for me.'],
        ['Kelner', 'A dla pana?', 'And for you, sir?'],
        ['Jack', 'Kawa z mlekiem i z cukrem.', 'Coffee with milk and sugar.'],
      ],
    }),
    lesson('u14-l2', 'I am a teacher', 'Say what job someone does.', {
      items: [
        ['nauczyciel', 'teacher (a man)', { altEn: ['teacher', 'male teacher'], g: 'm' }],
        ['nauczycielka', 'teacher (a woman)', { altEn: ['teacher', 'female teacher'], g: 'f' }],
        ['lekarz', 'doctor (a man)', { altEn: ['doctor', 'male doctor'], g: 'm' }],
        ['lekarka', 'doctor (a woman)', { altEn: ['doctor', 'female doctor'], g: 'f' }],
        ['pielęgniarka', 'nurse', { g: 'f' }],
        ['student', 'student', { altEn: ['male student'], g: 'm' }],
        ['kierowca', 'driver', { g: 'm', hint: 'Masculine, despite the -a.' }],
        ['czym się zajmujesz?', 'what do you do?', { altEn: ['what do you do for a living?', "what's your job?", 'what is your job?'] }],
      ],
      sentences: [
        ['Jestem nauczycielem.', "I'm a teacher.", { altEn: ['I am a teacher.'], altPl: ['Jestem nauczycielką.'], extra: ['nauczyciel', 'jest'] }],
        ['Moja siostra jest lekarką.', 'My sister is a doctor.', { extra: ['lekarka', 'lekarzem'] }],
        ['Pracuję jako kierowca.', 'I work as a driver.', { altEn: ["I'm working as a driver."], extra: ['kierowcą', 'jestem'] }],
        ['On jest studentem.', "He's a student.", { altEn: ['He is a student.'], extra: ['student', 'studentką'] }],
      ],
      drills: [
        ['Jestem ___.', "I'm a doctor (man).", ['lekarzem', 'lekarz', 'lekarza'], 'lekarzem', 'być + job → instrumental.'],
        ['Ona jest ___.', "She's a nurse.", ['pielęgniarką', 'pielęgniarka', 'pielęgniarkę'], 'pielęgniarką'],
        ['Mój brat jest ___.', 'My brother is a student.', ['studentem', 'student', 'studenta'], 'studentem'],
        ['To jest ___.', 'This is a teacher.', ['nauczyciel', 'nauczycielem', 'nauczyciela'], 'nauczyciel', 'After "to jest", use the plain nominative.'],
      ],
      spotlight: {
        title: 'Być + instrumental',
        body: [
          'When you say what someone **is** — a job, a role, a nationality — the noun goes into the instrumental: {Jestem lekarzem}, {Ona jest Polką}.',
          'But after {to jest} ("this is") and after {jako} ("as"), keep the plain form: {To jest lekarz}, {Pracuję jako lekarz}.',
        ],
      },
      dialogue: [
        ['Piotr', 'Czym się zajmujesz?', 'What do you do?'],
        ['Emma', 'Jestem nauczycielką. A ty?', 'I\'m a teacher. And you?'],
        ['Piotr', 'Jestem lekarzem.', 'I\'m a doctor.'],
        ['Emma', 'Naprawdę? Moja siostra też jest lekarką!', 'Really? My sister is a doctor too!'],
      ],
    }),
    lesson('u14-l3', 'By bus, by train', 'Say how you travel.', {
      items: [
        ['autobusem', 'by bus'],
        ['pociągiem', 'by train'],
        ['samochodem', 'by car', { altEn: ['in the car'] }],
        ['tramwajem', 'by tram'],
        ['rowerem', 'by bike', { altEn: ['by bicycle', 'on a bike'] }],
        ['samolotem', 'by plane', { altEn: ['by air'] }],
        ['metrem', 'by Tube', { altEn: ['by underground', 'by metro', 'by subway', 'on the tube'] }],
        ['pieszo', 'on foot', { altEn: ['walking'] }],
      ],
      sentences: [
        ['Jadę do pracy autobusem.', 'I go to work by bus.', { altEn: ["I'm going to work by bus.", 'I take the bus to work.', 'I get the bus to work.'], altPl: ['Do pracy jadę autobusem.'], extra: ['autobus', 'idę'] }],
        ['Jedziemy pociągiem do Krakowa.', "We're going to Kraków by train.", { altEn: ["We're taking the train to Kraków.", 'We are going to Kraków by train.'], altPl: ['Jedziemy do Krakowa pociągiem.'], extra: ['pociąg', 'Kraków'] }],
        ['Chodzę do pracy pieszo.', 'I walk to work.', { altEn: ['I go to work on foot.'], altPl: ['Do pracy chodzę pieszo.'], extra: ['jeżdżę', 'jadę'] }],
        ['Wolę jeździć rowerem.', 'I prefer to cycle.', { altEn: ['I prefer cycling.', 'I prefer riding a bike.', 'I prefer to ride a bike.', 'I prefer going by bike.'], extra: ['rower', 'lubię'] }],
      ],
      drills: [
        ['Jadę ___.', "I'm going by train.", ['pociągiem', 'pociąg', 'pociągu'], 'pociągiem'],
        ['Lecimy ___.', "We're flying.", ['samolotem', 'samolot', 'samolocie'], 'samolotem'],
        ['Jeździsz ___?', 'Do you go by tram?', ['tramwajem', 'tramwaj', 'tramwaju'], 'tramwajem'],
      ],
      dialogue: [
        ['Kasia', 'Jak jeździsz do pracy?', 'How do you get to work?'],
        ['Tom', 'Autobusem. A ty?', 'By bus. And you?'],
        ['Kasia', 'Rowerem, a zimą tramwajem.', 'By bike, and by tram in winter.'],
      ],
    }),
  ],
);

export const u15 = unit(
  15,
  'A2',
  'Getting around',
  'W drodze',
  'Polish has different verbs for walking and riding, and for now and habitually. Plus "to" a place.',
  [
    lesson('u15-l1', 'Going on foot, going by car', 'Choose between iść, chodzić, jechać and jeździć.', {
      items: [
        ['idę', "I'm going (on foot)", { altEn: ["i'm going", "i'm walking", 'i go'], hint: 'On foot, now.' }],
        ['idziesz', "you're going (on foot)", { altEn: ["you're going", 'are you going', 'you are going'] }],
        ['jadę', "I'm going (by transport)", { altEn: ["i'm going", "i'm driving", "i'm travelling"], hint: 'By vehicle, now.' }],
        ['jedziesz', "you're going (by transport)", { altEn: ["you're going", 'are you going', "you're driving"] }],
        ['chodzę', 'I go (on foot, regularly)', { altEn: ['i go', 'i walk', 'i go (regularly)'], hint: 'On foot, regularly.' }],
        ['jeżdżę', 'I go (by transport, regularly)', { altEn: ['i go', 'i drive', 'i travel', 'i go (regularly, by transport)'], hint: 'By vehicle, regularly.' }],
        ['dokąd?', 'where to?', { altEn: ['where?'] }],
      ],
      sentences: [
        ['Dokąd idziesz?', 'Where are you going?', { altEn: ['Where are you off to?'], extra: ['gdzie', 'jadę'] }],
        ['Idę do domu.', "I'm going home.", { altEn: ['I am going home.', "I'm walking home."], extra: ['jadę', 'dom'] }],
        ['Jadę do Warszawy.', "I'm going to Warsaw.", { altEn: ["I'm travelling to Warsaw.", "I'm driving to Warsaw."], extra: ['idę', 'Warszawa'] }],
        ['Jeżdżę do pracy tramwajem.', 'I go to work by tram.', { altEn: ['I take the tram to work.', 'I get the tram to work.'], extra: ['jadę', 'tramwaj'] }],
      ],
      drills: [
        ['Teraz ___ do sklepu.', "I'm walking to the shop now.", ['idę', 'jadę', 'chodzę'], 'idę'],
        ['Codziennie ___ do pracy autobusem.', 'Every day I go to work by bus.', ['jeżdżę', 'jadę', 'chodzę'], 'jeżdżę', 'Regular + vehicle → jeździć.'],
        ['Jutro ___ do Krakowa pociągiem.', "Tomorrow I'm going to Kraków by train.", ['jadę', 'idę', 'chodzę'], 'jadę', 'One trip + vehicle → jechać.'],
        ['Często ___ do kina.', 'I often go to the cinema (on foot).', ['chodzę', 'idę', 'jadę'], 'chodzę'],
      ],
      spotlight: {
        title: 'Four verbs for "go"',
        body: [
          'Polish asks two questions English ignores: **on foot or by vehicle?** and **one trip now, or regularly?**',
        ],
        table: {
          head: ['', 'one trip / now', 'regularly'],
          rows: [
            ['on foot', 'iść — idę', 'chodzić — chodzę'],
            ['by vehicle', 'jechać — jadę', 'jeździć — jeżdżę'],
          ],
        },
      },
      dialogue: [
        ['Ola', 'Dokąd idziesz?', 'Where are you going?'],
        ['Jack', 'Idę do sklepu. A ty?', 'I\'m going to the shop. And you?'],
        ['Ola', 'Jadę do pracy. Codziennie jeżdżę tramwajem.', 'I\'m going to work. I go by tram every day.'],
      ],
    }),
    lesson('u15-l2', 'To the shop, to Poland', 'Use do + genitive for destinations.', {
      items: [
        ['do sklepu', 'to the shop', { altEn: ['to the shops'] }],
        ['do domu', 'home', { altEn: ['to the house'] }],
        ['do pracy', 'to work'],
        ['do kina', 'to the cinema', { altEn: ['to the pictures'] }],
        ['do Polski', 'to Poland'],
        ['do Londynu', 'to London'],
        ['do Krakowa', 'to Kraków', { altEn: ['to krakow', 'to cracow'] }],
        ['na dworzec', 'to the station'],
      ],
      sentences: [
        ['Idę do sklepu po chleb.', "I'm going to the shop for bread.", { altEn: ["I'm going to the shop to get bread.", "I'm popping to the shop for some bread.", "I'm going to the shop for some bread."], extra: ['w', 'sklepie'] }],
        ['Jedziemy do Polski na wakacje.', "We're going to Poland on holiday.", { altEn: ["We're going to Poland for the holidays.", 'We are going to Poland on holiday.', "We're going to Poland for our holidays."], extra: ['w', 'Polsce'] }],
        ['Idę na pocztę.', "I'm going to the post office.", { extra: ['do', 'poczcie'] }],
        ['Pojedziesz ze mną do Krakowa?', 'Will you go to Kraków with me?', { altEn: ['Will you come to Kraków with me?'], altPl: ['Czy pojedziesz ze mną do Krakowa?'], extra: ['ja', 'Kraków'] }],
      ],
      drills: [
        ['Idę do ___.', "I'm going to work.", ['pracy', 'pracę', 'praca'], 'pracy'],
        ['Jadę do ___.', "I'm going to London.", ['Londynu', 'Londyn', 'Londynie'], 'Londynu'],
        ['Idziemy do ___.', "We're going to the cinema.", ['kina', 'kino', 'kinie'], 'kina'],
        ['Idę ___ pocztę.', "I'm going to the post office.", ['na', 'do', 'w'], 'na', 'Places that take "na" for "at" also take "na" for "to".'],
      ],
      spotlight: {
        title: 'Where to? do + genitive',
        body: [
          '{Do} (to) takes the **genitive**: masculine -u or -a, feminine -y or -i, neuter -a.',
          'Places that use {na} for "at" ({na poczcie}) use {na} + accusative for "to": {na pocztę}, {na dworzec}.',
        ],
        table: {
          head: ['Where? (locative)', 'Where to? (genitive / accusative)'],
          rows: [
            ['w sklepie', 'do sklepu'],
            ['w pracy', 'do pracy'],
            ['w Polsce', 'do Polski'],
            ['w kinie', 'do kina'],
            ['na poczcie', 'na pocztę'],
          ],
        },
      },
      dialogue: [
        ['Marek', 'Jedziesz do Polski na wakacje?', 'Are you going to Poland on holiday?'],
        ['Emma', 'Tak, jadę do Krakowa. A ty?', 'Yes, I\'m going to Kraków. And you?'],
        ['Marek', 'Ja jadę do Londynu, do siostry.', 'I\'m going to London, to my sister\'s.'],
      ],
    }),
    lesson('u15-l3', 'At the station', 'Buy tickets and handle delays.', {
      items: [
        ['bilet', 'ticket', { g: 'm' }],
        ['pociąg', 'train', { g: 'm' }],
        ['autobus', 'bus', { altEn: ['coach'], g: 'm' }],
        ['przystanek', 'stop', { altEn: ['bus stop'], g: 'm' }],
        ['peron', 'platform', { g: 'm' }],
        ['lotnisko', 'airport', { g: 'n' }],
        ['przesiadka', 'change', { altEn: ['connection', 'transfer'], g: 'f' }],
        ['opóźniony', 'delayed', { altEn: ['late'] }],
      ],
      sentences: [
        ['Poproszę bilet do Krakowa.', 'A ticket to Kraków, please.', { altEn: ["I'd like a ticket to Kraków.", 'One ticket to Kraków, please.'], extra: ['Kraków', 'na'] }],
        ['Z którego peronu odjeżdża pociąg?', 'Which platform does the train leave from?', { altEn: ['Which platform does the train go from?', 'What platform does the train leave from?'], extra: ['peron', 'jedzie'] }],
        ['Pociąg jest opóźniony.', 'The train is delayed.', { altEn: ['The train is late.'], extra: ['autobus', 'był'] }],
        ['Gdzie jest przystanek autobusowy?', "Where's the bus stop?", { altEn: ['Where is the bus stop?'], extra: ['autobus', 'peron'] }],
      ],
      drills: [
        ['Poproszę bilet ___.', 'A ticket to Gdańsk, please.', ['do Gdańska', 'do Gdańsk', 'w Gdańsku'], 'do Gdańska'],
        ['Pociąg odjeżdża z ___ trzeciego.', 'The train leaves from platform three.', ['peronu', 'peron', 'peronie'], 'peronu', 'z (from) also takes the genitive.'],
      ],
      dialogue: [
        ['Podróżny', 'Dzień dobry. Poproszę bilet do Krakowa.', 'Hello. A ticket to Kraków, please.'],
        ['Kasjerka', 'Normalny czy ulgowy?', 'Standard or reduced?'],
        ['Podróżny', 'Normalny. Z którego peronu odjeżdża pociąg?', 'Standard. Which platform does the train leave from?'],
        ['Kasjerka', 'Z peronu drugiego. Pociąg jest opóźniony o dziesięć minut.', 'Platform two. The train is delayed by ten minutes.'],
      ],
    }),
  ],
);

export const u16 = unit(
  16,
  'A2',
  'Likes & gifts',
  'Komu? Czemu?',
  'The dative case: giving, helping, thanking — and the very Polish way of saying you like something.',
  [
    lesson('u16-l1', 'It pleases me', 'Say you like things with podobać się.', {
      items: [
        ['podoba mi się', 'I like it', { altEn: ['i like'], hint: 'Literally "it pleases me". For things you see or experience.' }],
        ['podoba ci się?', 'do you like it?', { altEn: ['do you like'] }],
        ['smakuje mi', 'I like the taste', { altEn: ['it tastes good', 'i like it'], hint: 'For food and drink.' }],
        ['zimno mi', "I'm cold", { altEn: ['i am cold'], altPl: ['jest mi zimno'] }],
        ['gorąco mi', "I'm hot", { altEn: ['i am hot'], altPl: ['jest mi gorąco'] }],
        ['przykro mi', "I'm sorry", { altEn: ['i am sorry'], altPl: ['jest mi przykro'], hint: 'Sympathy, not apology.' }],
        ['wszystko mi jedno', "I don't mind", { altEn: ["it's all the same to me", "i don't care"] }],
      ],
      sentences: [
        ['Bardzo mi się tu podoba.', 'I really like it here.', { altEn: ['I like it here very much.', 'I like it here a lot.'], altPl: ['Bardzo mi się tutaj podoba.', 'Bardzo podoba mi się tutaj.', 'Bardzo podoba mi się tu.'], extra: ['lubię', 'ja'] }],
        ['Czy smakuje ci zupa?', 'Do you like the soup?', { altEn: ['Are you enjoying the soup?', 'Is the soup nice?', 'Does the soup taste good?'], altPl: ['Smakuje ci zupa?'], extra: ['lubisz', 'zupę'] }],
        ['Jest mi zimno.', "I'm cold.", { altEn: ['I am cold.'], altPl: ['Zimno mi.'], extra: ['jestem', 'ja'] }],
        ['Kraków bardzo mi się podoba.', 'I really like Kraków.', { altEn: ['I like Kraków very much.', 'I like Kraków a lot.'], altPl: ['Bardzo podoba mi się Kraków.'], extra: ['Krakowa', 'lubię'] }],
      ],
      drills: [
        ['Czy ___ się podoba?', 'Do you like it?', ['ci', 'ty', 'cię'], 'ci', 'Dative "to you" is ci.'],
        ['Jest ___ zimno.', "I'm cold.", ['mi', 'ja', 'mnie'], 'mi'],
        ['Te buty ___ mi się.', 'I like these shoes.', ['podobają', 'podoba'], 'podobają', 'The things you like are the subject, so plural things → plural verb.'],
        ['Ta zupa bardzo ___ mi.', 'I really like this soup.', ['smakuje', 'smakują'], 'smakuje'],
      ],
      spotlight: {
        title: 'Things please you',
        body: [
          'Instead of "I like the city", Polish often says "the city pleases **to me**": {Miasto mi się podoba}. The person is in the **dative**.',
          'Many feelings work the same way: {Jest mi zimno} (it is cold to me), {Przykro mi} (it is sad to me = I\'m sorry).',
        ],
        table: {
          head: ['Person', 'Dative'],
          rows: [
            ['ja', 'mi / mnie'],
            ['ty', 'ci / tobie'],
            ['on', 'mu / jemu'],
            ['ona', 'jej'],
            ['my', 'nam'],
            ['oni', 'im'],
          ],
        },
      },
      dialogue: [
        ['Kasia', 'Podoba ci się Kraków?', 'Do you like Kraków?'],
        ['Tom', 'Bardzo mi się podoba!', 'I really like it!'],
        ['Kasia', 'A smakuje ci polska kuchnia?', 'And do you like Polish food?'],
        ['Tom', 'Tak, bardzo mi smakuje. Ale jest mi zimno!', 'Yes, it\'s delicious. But I\'m cold!'],
      ],
    }),
    lesson('u16-l2', 'Presents for Mum', 'Give things to people.', {
      items: [
        ['prezent', 'present', { altEn: ['gift'], g: 'm' }],
        ['urodziny', 'birthday', { g: 'pl', hint: 'Plural in Polish.' }],
        ['kwiaty', 'flowers', { g: 'pl' }],
        ['mamie', 'to Mum', { altEn: ['for mum', 'to my mum'] }],
        ['bratu', 'to my brother', { altEn: ['to brother', 'for my brother'] }],
        ['pomagam', 'I help', { altEn: ["i'm helping"] }],
        ['dziękuję ci', 'thank you (to a friend)', { altEn: ['thank you', 'thanks', 'thank you (to you)'] }],
        ['wszystkiego najlepszego', 'all the best', { altEn: ['happy birthday', 'best wishes'] }],
      ],
      sentences: [
        ['Kupiłam mamie kwiaty.', 'I bought Mum some flowers.', { altEn: ['I bought flowers for Mum.', 'I bought Mum flowers.', 'I bought my mum flowers.'], altPl: ['Kupiłem mamie kwiaty.'], extra: ['mama', 'mamę'] }],
        ['Co kupić bratu na urodziny?', 'What should I get my brother for his birthday?', { altEn: ['What should I buy my brother for his birthday?', 'What to buy my brother for his birthday?'], extra: ['brat', 'brata'] }],
        ['To jest prezent dla ciebie.', 'This is a present for you.', { altEn: ["This is a gift for you.", "Here's a present for you."], extra: ['ci', 'ty'] }],
        ['Pomagam siostrze.', "I'm helping my sister.", { altEn: ['I help my sister.'], extra: ['siostra', 'siostrę'] }],
      ],
      drills: [
        ['Kupiłem ___ kwiaty.', 'I bought Mum flowers.', ['mamie', 'mama', 'mamę'], 'mamie'],
        ['Daj to ___.', 'Give it to your brother.', ['bratu', 'brat', 'brata'], 'bratu'],
        ['Pomagam ___.', "I'm helping my sister.", ['siostrze', 'siostra', 'siostrę'], 'siostrze', 'pomagać takes the dative.'],
        ['Dziękuję ___!', 'Thank you (to you)!', ['ci', 'cię', 'ty'], 'ci'],
      ],
      spotlight: {
        title: 'The dative: to whom?',
        body: [
          'The person who receives something goes in the **dative**. Verbs like {dać} (give), {kupić} (buy for), {pomagać} (help) and {dziękować} (thank) use it.',
          'Note {dla} + genitive also means "for": {prezent dla mamy}.',
        ],
        table: {
          head: ['Noun', 'Dative'],
          rows: [
            ['brat', 'bratu'],
            ['Tomek', 'Tomkowi'],
            ['mama', 'mamie'],
            ['siostra', 'siostrze'],
            ['Kasia', 'Kasi'],
            ['dziecko', 'dziecku'],
          ],
        },
      },
      dialogue: [
        ['Ola', 'Co kupiłeś mamie na urodziny?', 'What did you buy Mum for her birthday?'],
        ['Adam', 'Kwiaty. A ty?', 'Flowers. And you?'],
        ['Ola', 'Kupiłam jej książkę.', 'I bought her a book.'],
        ['Adam', 'Świetny prezent!', 'Great present!'],
      ],
    }),
    lesson('u16-l3', 'I think that…', 'Give opinions and react.', {
      items: [
        ['myślę, że', 'I think that', { altEn: ['i think'] }],
        ['wydaje mi się', 'it seems to me', { altEn: ['i think', 'i reckon'] }],
        ['zgadzam się', 'I agree'],
        ['szkoda', "what a shame", { altEn: ['pity', "it's a pity", 'shame', "that's a shame"] }],
        ['na szczęście', 'luckily', { altEn: ['fortunately'] }],
        ['niestety', 'unfortunately', { altEn: ['sadly'] }],
        ['oczywiście', 'of course', { altEn: ['obviously', 'naturally'] }],
        ['naprawdę', 'really', { altEn: ['truly', 'honestly'] }],
      ],
      sentences: [
        ['Myślę, że to dobry pomysł.', "I think it's a good idea.", { altEn: ['I think that is a good idea.', "I think that's a good idea."], extra: ['myśli', 'dobra'] }],
        ['Niestety nie mogę przyjść.', "Unfortunately I can't come.", { altEn: ["Sadly, I can't come.", 'Unfortunately, I cannot come.', "Unfortunately, I can't come."], extra: ['może', 'na'] }],
        ['Szkoda, że cię nie było.', "Shame you weren't there.", { altEn: ["It's a pity you weren't there.", "What a shame you weren't there.", "Pity you weren't there."], extra: ['ty', 'byłeś'] }],
        ['Zgadzam się z tobą.', 'I agree with you.', { extra: ['ty', 'ci'] }],
      ],
      dialogue: [
        ['Piotr', 'Myślę, że to dobry pomysł.', 'I think it\'s a good idea.'],
        ['Emma', 'Zgadzam się. Ale niestety nie mam czasu.', 'I agree. But unfortunately I don\'t have time.'],
        ['Piotr', 'Szkoda! Naprawdę?', 'Shame! Really?'],
        ['Emma', 'Naprawdę. Może w przyszłym tygodniu.', 'Really. Maybe next week.'],
      ],
    }),
  ],
);

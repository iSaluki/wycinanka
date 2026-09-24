import { lesson, unit } from '../build';

export const u06 = unit(
  6,
  'A1',
  'At the café',
  'W kawiarni',
  'Order food and drink with "poproszę" — and meet your first case, the accusative.',
  [
    lesson('u06-l1', 'Something to drink', 'Order drinks politely.', {
      items: [
        ['poproszę', "I'd like (ordering)", { altEn: ["i'd like", 'please', 'i would like', "i'll have"], hint: 'The standard way to order: "po-PRO-sheh".' }],
        ['kawa', 'coffee', { g: 'f' }],
        ['sok', 'juice', { g: 'm' }],
        ['piwo', 'beer', { g: 'n' }],
        ['wino', 'wine', { g: 'n' }],
        ['mleko', 'milk', { g: 'n' }],
        ['cukier', 'sugar', { g: 'm' }],
        ['woda gazowana', 'sparkling water', { altEn: ['fizzy water'], g: 'f' }],
      ],
      sentences: [
        ['Poproszę kawę z mlekiem.', 'A coffee with milk, please.', { altEn: ['Coffee with milk, please.', "I'd like a coffee with milk.", 'A white coffee, please.'], extra: ['kawa', 'mleko'] }],
        ['Poproszę herbatę bez cukru.', 'A tea without sugar, please.', { altEn: ['Tea without sugar, please.', "I'd like a tea without sugar."], extra: ['herbata', 'cukier'] }],
        ['Dla mnie piwo.', 'A beer for me.', { altEn: ['Beer for me.', "I'll have a beer."], extra: ['wino', 'ja'] }],
        ['Dwie kawy, poproszę.', 'Two coffees, please.', { altEn: ["I'd like two coffees."], extra: ['dwa', 'kawę'] }],
      ],
      drills: [
        ['Poproszę ___.', 'A coffee, please.', ['kawę', 'kawa', 'kawy'], 'kawę', 'Feminine -a becomes -ę after poproszę (the accusative).'],
        ['Poproszę ___.', 'A tea, please.', ['herbatę', 'herbata', 'herbacie'], 'herbatę'],
        ['Poproszę ___.', 'A juice, please.', ['sok', 'soka', 'soku'], 'sok', 'Masculine things do not change in the accusative.'],
        ['Poproszę ___.', 'A beer, please.', ['piwo', 'piwę', 'piwa'], 'piwo', 'Neuter nouns never change in the accusative.'],
        ['Poproszę wodę ___.', 'Sparkling water, please.', ['gazowaną', 'gazowana', 'gazowanej'], 'gazowaną', 'Feminine adjectives change -a → -ą.'],
      ],
      spotlight: {
        title: 'Your first case: the accusative',
        body: [
          'Polish nouns change their endings depending on their job in the sentence. The **accusative** marks the thing you want, have or order.',
          'The good news: only feminine nouns visibly change. **-a becomes -ę**.',
        ],
        table: {
          head: ['Dictionary form', 'After poproszę'],
          rows: [
            ['kawa (f)', 'kawę'],
            ['herbata (f)', 'herbatę'],
            ['sok (m)', 'sok'],
            ['piwo (n)', 'piwo'],
          ],
        },
      },
    }),
    lesson('u06-l2', 'Something to eat', 'Order food and talk about meals.', {
      items: [
        ['kanapka', 'sandwich', { g: 'f' }],
        ['ciasto', 'cake', { g: 'n' }],
        ['zupa', 'soup', { g: 'f' }],
        ['pierogi', 'dumplings', { altEn: ['pierogi'], g: 'pl' }],
        ['sałatka', 'salad', { g: 'f' }],
        ['frytki', 'chips', { altEn: ['fries', 'french fries'], g: 'pl' }],
        ['lody', 'ice cream', { g: 'pl', hint: 'Always plural in Polish.' }],
        ['śniadanie', 'breakfast', { g: 'n' }],
        ['obiad', 'lunch', { altEn: ['dinner', 'main meal'], g: 'm', hint: 'The main hot meal, usually eaten mid-afternoon.' }],
      ],
      sentences: [
        ['Poproszę zupę i kanapkę.', 'Soup and a sandwich, please.', { altEn: ['A soup and a sandwich, please.', "I'd like soup and a sandwich."], extra: ['zupa', 'kanapka'] }],
        ['Czy są pierogi?', 'Are there any pierogi?', { altEn: ['Do you have pierogi?', 'Have you got pierogi?', 'Are there pierogi?', 'Do you have any pierogi?'], extra: ['jest', 'lody'] }],
        ['Pierogi są bardzo dobre.', 'The pierogi are very good.', { altEn: ['The dumplings are very good.', 'Pierogi are very good.'], extra: ['dobry', 'jest'] }],
        ['Obiad jest o trzeciej.', 'Lunch is at three.', { altEn: ["Dinner is at three.", "Lunch is at three o'clock."], extra: ['śniadanie', 'trzy'] }],
      ],
      drills: [
        ['Poproszę ___.', 'Soup, please.', ['zupę', 'zupa', 'zupy'], 'zupę'],
        ['Poproszę ___.', 'A sandwich, please.', ['kanapkę', 'kanapka', 'kanapki'], 'kanapkę'],
        ['Poproszę ___.', 'Cake, please.', ['ciasto', 'ciastę', 'ciasta'], 'ciasto'],
      ],
      spotlight: {
        title: 'Meals in Poland',
        body: [
          '{Śniadanie} is breakfast. {Obiad} is the main hot meal, traditionally eaten between 2 and 5 pm, often soup then a main course. {Kolacja} is a lighter supper.',
        ],
      },
    }),
    lesson('u06-l3', 'The bill, please', 'Handle the whole café visit.', {
      items: [
        ['rachunek', 'the bill', { altEn: ['bill', 'check'], g: 'm' }],
        ['na miejscu', 'to eat in', { altEn: ['for here', 'to have in', 'eat in'] }],
        ['na wynos', 'to take away', { altEn: ['takeaway', 'to go', 'take away'] }],
        ['smacznego', 'enjoy your meal', { altEn: ['bon appétit', 'bon appetit'] }],
        ['co podać?', 'what can I get you?', { altEn: ['what would you like?'] }],
        ['dla mnie', 'for me'],
        ['jeszcze', 'another', { altEn: ['more', 'still', 'yet'] }],
        ['to wszystko', "that's all", { altEn: ['that is all', "that's everything"] }],
      ],
      sentences: [
        ['Poproszę rachunek.', 'The bill, please.', { altEn: ['Could I have the bill, please?', 'Can I have the bill, please?'], altPl: ['Proszę rachunek.'], extra: ['rachunku', 'dla'] }],
        ['Kawa na miejscu czy na wynos?', 'Coffee to have in or take away?', { altEn: ['Is the coffee to eat in or take away?', 'Coffee for here or to go?', 'Coffee to have in or to take away?'], extra: ['i', 'tak'] }],
        ['To wszystko, dziękuję.', "That's all, thank you.", { altEn: ["That's all, thanks.", 'That is all, thank you.'], extra: ['jeszcze', 'proszę'] }],
        ['Jeszcze jedną kawę, proszę.', 'Another coffee, please.', { altEn: ['One more coffee, please.'], extra: ['jeden', 'kawa'] }],
      ],
      dialogue: [
        ['Kelnerka', 'Dzień dobry! Co podać?', 'Hello! What can I get you?'],
        ['Emma', 'Poproszę kawę z mlekiem i ciasto.', "I'd like a coffee with milk and some cake."],
        ['Kelnerka', 'Na miejscu czy na wynos?', 'To have in or take away?'],
        ['Emma', 'Na miejscu. To wszystko.', "To have in. That's all."],
        ['Kelnerka', 'Proszę bardzo. Smacznego!', 'Here you are. Enjoy!'],
        ['Emma', 'Dziękuję! Poproszę rachunek.', 'Thank you! Could I have the bill, please?'],
      ],
    }),
  ],
);

export const u07 = unit(
  7,
  'A1',
  'Everyday verbs',
  'Codzienne czasowniki',
  'Three patterns cover most Polish verbs in the present tense. Learn one verb from each.',
  [
    lesson('u07-l1', 'I read, I live: the -am group', 'Conjugate verbs like czytać.', {
      items: [
        ['czytam', 'I read', { altEn: ["i'm reading", 'i am reading'] }],
        ['czytasz', 'you read', { altEn: ["you're reading", 'you are reading'] }],
        ['czyta', 'he reads', { altEn: ['she reads', 'reads', 'is reading'] }],
        ['mieszkam', 'I live', { altEn: ['i am living', "i'm living"] }],
        ['słucham', "I'm listening", { altEn: ['i listen', 'i am listening', 'hello (on the phone)'] }],
        ['rozumiem', 'I understand', { altEn: ['i see'] }],
        ['nie rozumiem', "I don't understand", { altEn: ['i do not understand'] }],
        ['znam', 'I know', { altEn: ['i know (someone)'], hint: 'For knowing people and places. Knowing facts is wiem.' }],
      ],
      sentences: [
        ['Czytam książkę.', "I'm reading a book.", { altEn: ['I read a book.', 'I am reading a book.'], extra: ['książka', 'czyta'] }],
        ['Mieszkam w Manchesterze.', 'I live in Manchester.', { altEn: ["I'm living in Manchester."], extra: ['mieszka', 'na'] }],
        ['Przepraszam, nie rozumiem.', "Sorry, I don't understand.", { altEn: ['Sorry, I do not understand.', "Excuse me, I don't understand."], extra: ['rozumiesz', 'tak'] }],
        ['Słucham muzyki.', "I'm listening to music.", { altEn: ['I listen to music.', 'I am listening to music.'], extra: ['muzyka', 'czytam'] }],
      ],
      drills: [
        ['Ja ___ książkę.', "I'm reading a book.", ['czytam', 'czyta', 'czytasz'], 'czytam'],
        ['Ona ___ w Krakowie.', 'She lives in Kraków.', ['mieszka', 'mieszkam', 'mieszkają'], 'mieszka'],
        ['My ___ muzyki.', "We're listening to music.", ['słuchamy', 'słucham', 'słuchają'], 'słuchamy'],
        ['Czy ty ___ po polsku?', 'Do you understand Polish?', ['rozumiesz', 'rozumiem', 'rozumie'], 'rozumiesz'],
      ],
      spotlight: {
        title: 'The -am, -asz group',
        body: [
          'Polish has one present tense: {czytam} means both "I read" and "I\'m reading".',
          'Verbs whose infinitive ends in **-ać** usually follow this pattern.',
        ],
        table: {
          head: ['', 'czytać — to read'],
          rows: [
            ['ja', 'czytam'],
            ['ty', 'czytasz'],
            ['on / ona / ono', 'czyta'],
            ['my', 'czytamy'],
            ['wy', 'czytacie'],
            ['oni / one', 'czytają'],
          ],
        },
      },
    }),
    lesson('u07-l2', 'I want, I can, I must', 'Use the -ę, -esz group and modal verbs.', {
      items: [
        ['pracuję', 'I work', { altEn: ["i'm working", 'i am working'] }],
        ['piszę', "I'm writing", { altEn: ['i write', 'i am writing'] }],
        ['chcę', 'I want', { altEn: ["i'd like"] }],
        ['mogę', 'I can', { altEn: ['i may', 'i am able to'] }],
        ['muszę', 'I must', { altEn: ['i have to', 'i need to', "i've got to"] }],
        ['jem', "I'm eating", { altEn: ['i eat', 'i am eating'] }],
        ['piję', "I'm drinking", { altEn: ['i drink', 'i am drinking'] }],
      ],
      sentences: [
        ['Pracuję w Londynie.', 'I work in London.', { altEn: ["I'm working in London."], extra: ['pracuje', 'na'] }],
        ['Chcę kawę.', 'I want a coffee.', { altEn: ['I want coffee.', "I'd like a coffee."], extra: ['chce', 'kawa'] }],
        ['Muszę iść.', 'I have to go.', { altEn: ['I must go.', 'I need to go.', "I've got to go."], extra: ['mogę', 'idę'] }],
        ['Czy mogę zapłacić kartą?', 'Can I pay by card?', { altEn: ['May I pay by card?', 'Could I pay by card?'], altPl: ['Mogę zapłacić kartą?'], extra: ['muszę', 'gotówką'] }],
      ],
      drills: [
        ['On ___ w biurze.', 'He works in an office.', ['pracuje', 'pracuję', 'pracujesz'], 'pracuje', 'Careful: pracuję (I) vs pracuje (he/she).'],
        ['Czy ___ mi pomóc?', 'Can you help me?', ['możesz', 'mogę', 'może'], 'możesz'],
        ['Ja ___ kawę.', 'I want a coffee.', ['chcę', 'chce', 'chcesz'], 'chcę'],
        ['Oni ___ herbatę.', "They're drinking tea.", ['piją', 'pije', 'piję'], 'piją'],
      ],
      spotlight: {
        title: 'The -ę, -esz group',
        body: [
          'Many verbs, including every verb ending in **-ować**, take these endings. Note the tiny but vital difference between {pracuję} (I work) and {pracuje} (she works).',
          '{Chcę}, {mogę} and {muszę} are followed by an infinitive: {Muszę iść} (I have to go).',
        ],
        table: {
          head: ['', 'pracować — to work'],
          rows: [
            ['ja', 'pracuję'],
            ['ty', 'pracujesz'],
            ['on / ona / ono', 'pracuje'],
            ['my', 'pracujemy'],
            ['wy', 'pracujecie'],
            ['oni / one', 'pracują'],
          ],
        },
      },
    }),
    lesson('u07-l3', 'I speak, I like: the -isz group', 'Talk about languages and likes.', {
      items: [
        ['mówię', 'I speak', { altEn: ["i'm speaking", 'i say', 'i am speaking'] }],
        ['po polsku', 'in Polish', { altEn: ['polish'] }],
        ['po angielsku', 'in English', { altEn: ['english'] }],
        ['lubię', 'I like'],
        ['robię', "I'm doing", { altEn: ['i do', 'i make', "i'm making"] }],
        ['co robisz?', 'what are you doing?', { altEn: ['what do you do?'] }],
        ['uczę się', "I'm learning", { altEn: ['i learn', 'i study', "i'm studying"] }],
        ['trochę', 'a little', { altEn: ['a bit', 'some'] }],
      ],
      sentences: [
        ['Mówię trochę po polsku.', 'I speak a little Polish.', { altEn: ['I speak a bit of Polish.', 'I speak Polish a little.'], extra: ['mówi', 'angielsku'] }],
        ['Czy mówisz po angielsku?', 'Do you speak English?', { altEn: ['Can you speak English?'], altPl: ['Mówisz po angielsku?'], extra: ['mówię', 'polsku'] }],
        ['Lubię herbatę.', 'I like tea.', { extra: ['herbata', 'lubi'] }],
        ['Uczę się polskiego.', "I'm learning Polish.", { altEn: ['I learn Polish.', 'I study Polish.', 'I am learning Polish.'], extra: ['polski', 'uczy'] }],
      ],
      drills: [
        ['Ona ___ po polsku.', 'She speaks Polish.', ['mówi', 'mówię', 'mówisz'], 'mówi'],
        ['Co ___?', 'What are you doing?', ['robisz', 'robię', 'robi'], 'robisz'],
        ['___ się polskiego.', "I'm learning Polish.", ['Uczę', 'Uczy', 'Uczysz'], 'Uczę'],
        ['Oni ___ kawę.', 'They like coffee.', ['lubią', 'lubi', 'lubię'], 'lubią'],
      ],
      spotlight: {
        title: 'The -ę, -isz group',
        body: [
          'Verbs ending in **-ić** or **-yć** usually take these endings. {Lubię} takes the accusative, like {poproszę}: {Lubię kawę}.',
          'Languages: {po polsku} (in Polish), {po angielsku} (in English). But "I\'m learning Polish" is {Uczę się polskiego}.',
        ],
        table: {
          head: ['', 'mówić — to speak'],
          rows: [
            ['ja', 'mówię'],
            ['ty', 'mówisz'],
            ['on / ona / ono', 'mówi'],
            ['my', 'mówimy'],
            ['wy', 'mówicie'],
            ['oni / one', 'mówią'],
          ],
        },
      },
      dialogue: [
        ['Piotr', 'Co robisz?', 'What are you doing?'],
        ['Emma', 'Uczę się polskiego.', "I'm learning Polish."],
        ['Piotr', 'Super! Mówisz po polsku?', 'Great! Do you speak Polish?'],
        ['Emma', 'Trochę. Mówię powoli.', 'A little. I speak slowly.'],
      ],
    }),
  ],
);

export const u08 = unit(
  8,
  'A1',
  'Family & having',
  'Rodzina',
  'Talk about your family, say what you have — and what you don\'t, which brings in the genitive.',
  [
    lesson('u08-l1', 'My family', 'Name family members with my/your.', {
      items: [
        ['rodzina', 'family', { g: 'f' }],
        ['mama', 'mum', { altEn: ['mother', 'mom'], g: 'f' }],
        ['tata', 'dad', { altEn: ['father'], g: 'm', hint: 'Masculine, even though it ends in -a.' }],
        ['brat', 'brother', { g: 'm' }],
        ['siostra', 'sister', { g: 'f' }],
        ['syn', 'son', { g: 'm' }],
        ['córka', 'daughter', { g: 'f' }],
        ['mąż', 'husband', { g: 'm' }],
        ['żona', 'wife', { g: 'f' }],
      ],
      sentences: [
        ['To jest moja mama.', 'This is my mum.', { altEn: ['This is my mother.', 'This is my mom.'], extra: ['mój', 'tata'] }],
        ['To jest mój brat, Piotr.', 'This is my brother, Piotr.', { altEn: ['This is my brother Piotr.'], extra: ['moja', 'siostra'] }],
        ['Moja żona jest z Polski.', 'My wife is from Poland.', { altEn: ['My wife is Polish.'], extra: ['mój', 'mąż'] }],
        ['Mój syn mieszka w Leeds.', 'My son lives in Leeds.', { extra: ['moja', 'córka'] }],
      ],
      drills: [
        ['___ mama', 'my mum', ['moja', 'mój', 'moje'], 'moja'],
        ['___ brat', 'my brother', ['mój', 'moja', 'moje'], 'mój'],
        ['___ dziecko', 'my child', ['moje', 'mój', 'moja'], 'moje'],
        ['___ tata', 'my dad', ['mój', 'moja', 'moje'], 'mój', 'Tata means a man, so it is masculine despite the -a.'],
      ],
      spotlight: {
        title: 'My and your',
        body: ['Possessives agree with the noun, like adjectives.'],
        table: {
          head: ['', 'masculine', 'feminine', 'neuter'],
          rows: [
            ['my', 'mój', 'moja', 'moje'],
            ['your', 'twój', 'twoja', 'twoje'],
            ['his', 'jego', 'jego', 'jego'],
            ['her', 'jej', 'jej', 'jej'],
          ],
        },
      },
    }),
    lesson('u08-l2', 'I have', 'Use mieć (to have).', {
      items: [
        ['mam', 'I have', { altEn: ["i've got", 'i have got'] }],
        ['masz', 'you have', { altEn: ["you've got", 'have you got', 'do you have'] }],
        ['ma', 'he has', { altEn: ['she has', 'has', "he's got", "she's got"] }],
        ['mamy', 'we have', { altEn: ["we've got"] }],
        ['mają', 'they have', { altEn: ["they've got"] }],
        ['dziecko', 'child', { altEn: ['kid', 'baby'], g: 'n' }],
        ['dzieci', 'children', { altEn: ['kids'], g: 'pl' }],
        ['pies', 'dog', { g: 'm' }],
      ],
      sentences: [
        ['Mam brata i siostrę.', 'I have a brother and a sister.', { altEn: ["I've got a brother and a sister."], extra: ['brat', 'siostra'] }],
        ['Czy masz dzieci?', 'Do you have children?', { altEn: ['Have you got children?', 'Do you have any children?', 'Have you got any children?'], altPl: ['Masz dzieci?'], extra: ['mam', 'dziecko'] }],
        ['Mamy psa i kota.', 'We have a dog and a cat.', { altEn: ["We've got a dog and a cat."], extra: ['pies', 'kot'] }],
        ['Ile masz lat?', 'How old are you?', { extra: ['mam', 'jesteś'] }],
      ],
      drills: [
        ['Mam ___.', 'I have a sister.', ['siostrę', 'siostra', 'siostry'], 'siostrę'],
        ['Masz ___?', 'Have you got a brother?', ['brata', 'brat', 'bratu'], 'brata', 'Male people and animals take -a in the accusative.'],
        ['Ona ___ dwoje dzieci.', 'She has two children.', ['ma', 'mam', 'mają'], 'ma'],
        ['Mamy ___.', 'We have a dog.', ['psa', 'pies', 'psem'], 'psa', 'pies loses its e: psa. Animate masculine takes -a.'],
      ],
      spotlight: {
        title: 'Mieć + accusative',
        body: [
          'What you have goes in the accusative. Feminine -a → -ę as before. New rule: **masculine people and animals add -a** ({brat} → {brata}, {kot} → {kota}). Masculine things do not change ({mam samochód}).',
        ],
        table: {
          head: ['', 'mieć — to have'],
          rows: [
            ['ja', 'mam'],
            ['ty', 'masz'],
            ['on / ona', 'ma'],
            ['my', 'mamy'],
            ['wy', 'macie'],
            ['oni / one', 'mają'],
          ],
        },
      },
    }),
    lesson('u08-l3', "I don't have: negation", 'Say what you don\'t have using the genitive.', {
      items: [
        ['nie mam', "I don't have", { altEn: ["i haven't got", 'i do not have'] }],
        ['nie ma', "there isn't", { altEn: ['there is no', "there's no", "isn't here", 'there are no'] }],
        ['nie mam czasu', "I don't have time", { altEn: ["i haven't got time", 'i have no time'] }],
        ['nie ma problemu', 'no problem', { altEn: ['not a problem'] }],
        ['pieniądze', 'money', { g: 'pl', hint: 'Plural in Polish.' }],
        ['nie mam pieniędzy', "I don't have any money", { altEn: ['i have no money', "i haven't got any money", "i don't have money"] }],
        ['nikt', 'nobody', { altEn: ['no one', 'no-one'] }],
        ['nic', 'nothing'],
      ],
      sentences: [
        ['Przepraszam, nie mam czasu.', "Sorry, I don't have time.", { altEn: ["Sorry, I haven't got time.", 'Sorry, I have no time.'], extra: ['czas', 'masz'] }],
        ['Nie ma kawy.', "There's no coffee.", { altEn: ["There isn't any coffee.", 'There is no coffee.'], extra: ['kawa', 'kawę'] }],
        ['Nie mam samochodu.', "I don't have a car.", { altEn: ["I haven't got a car.", 'I have no car.'], extra: ['samochód', 'ma'] }],
        ['Mamy nie ma w domu.', "Mum isn't at home.", { altEn: ['Mum is not at home.', "Mum's not home.", "Mum isn't home."], extra: ['mama', 'jest'] }],
      ],
      drills: [
        ['Nie mam ___.', "I don't have a car.", ['samochodu', 'samochód', 'samochodem'], 'samochodu'],
        ['Nie ma ___.', "There's no coffee.", ['kawy', 'kawę', 'kawa'], 'kawy'],
        ['Nie mam ___.', "I haven't got a sister.", ['siostry', 'siostrę', 'siostra'], 'siostry'],
        ['Tu nie ma ___.', "There's no milk here.", ['mleka', 'mleko', 'mlekiem'], 'mleka'],
      ],
      spotlight: {
        title: 'Negation brings the genitive',
        body: [
          'When you negate a verb that normally takes the accusative, the object switches to the **genitive**. This is one of the most frequent patterns in Polish.',
          '{Nie ma} + genitive means "there isn\'t / isn\'t here": {Nie ma mleka} (there\'s no milk), {Mamy nie ma} (Mum isn\'t here).',
        ],
        table: {
          head: ['I have…', "I don't have…"],
          rows: [
            ['Mam kawę.', 'Nie mam kawy.'],
            ['Mam samochód.', 'Nie mam samochodu.'],
            ['Mam psa.', 'Nie mam psa.'],
            ['Mam mleko.', 'Nie mam mleka.'],
          ],
        },
      },
    }),
  ],
);

export const u09 = unit(
  9,
  'A1',
  'Where is it?',
  'Gdzie to jest?',
  'Find your way around town and say where things are, using the locative case.',
  [
    lesson('u09-l1', 'Places in town', 'Name places and ask where they are.', {
      items: [
        ['sklep', 'shop', { altEn: ['store'], g: 'm' }],
        ['apteka', 'chemist', { altEn: ["chemist's", 'pharmacy'], g: 'f' }],
        ['dworzec', 'station', { altEn: ['railway station', 'train station'], g: 'm' }],
        ['bank', 'bank', { g: 'm' }],
        ['poczta', 'post office', { g: 'f' }],
        ['kościół', 'church', { g: 'm' }],
        ['park', 'park', { g: 'm' }],
        ['restauracja', 'restaurant', { g: 'f' }],
        ['toaleta', 'toilet', { altEn: ['loo', 'toilets'], g: 'f' }],
      ],
      sentences: [
        ['Gdzie jest apteka?', "Where's the chemist?", { altEn: ["Where is the chemist's?", 'Where is the pharmacy?', 'Where is the chemist?'], extra: ['są', 'tam'] }],
        ['Przepraszam, gdzie jest toaleta?', 'Excuse me, where is the toilet?', { altEn: ["Excuse me, where's the toilet?", 'Sorry, where is the toilet?', 'Excuse me, where are the toilets?'], extra: ['proszę', 'bank'] }],
        ['Tam jest poczta.', "There's the post office.", { altEn: ['The post office is there.', 'There is the post office.', 'The post office is over there.'], extra: ['tutaj', 'dworzec'] }],
      ],
    }),
    lesson('u09-l2', 'In, at, on: the locative', 'Say where you are with w and na.', {
      items: [
        ['w domu', 'at home', { altEn: ['in the house', 'home'] }],
        ['w pracy', 'at work'],
        ['w sklepie', 'in the shop', { altEn: ['at the shop'] }],
        ['w banku', 'at the bank', { altEn: ['in the bank'] }],
        ['na poczcie', 'at the post office', { altEn: ['in the post office'] }],
        ['na dworcu', 'at the station'],
        ['w Polsce', 'in Poland'],
        ['w Anglii', 'in England'],
      ],
      sentences: [
        ['Jestem w domu.', "I'm at home.", { altEn: ['I am at home.', "I'm home."], extra: ['dom', 'na'] }],
        ['Ona jest w pracy.', "She's at work.", { altEn: ['She is at work.'], extra: ['praca', 'na'] }],
        ['Mieszkam w Anglii, ale pracuję w Polsce.', 'I live in England, but I work in Poland.', { altEn: ['I live in England but I work in Poland.', 'I live in England but work in Poland.'], extra: ['Polska', 'Anglia'] }],
        ['Spotkamy się na dworcu.', "We'll meet at the station.", { altEn: ["Let's meet at the station.", 'We will meet at the station.', 'See you at the station.'], extra: ['dworzec', 'w'] }],
      ],
      drills: [
        ['Jestem w ___.', "I'm at work.", ['pracy', 'praca', 'pracę'], 'pracy'],
        ['Mieszkam w ___.', 'I live in Poland.', ['Polsce', 'Polska', 'Polskę'], 'Polsce', 'k + e softens to c: Polska → Polsce.'],
        ['On jest na ___.', "He's at the post office.", ['poczcie', 'poczta', 'pocztę'], 'poczcie', 't + e softens to cie: poczta → poczcie.'],
        ['Czekam w ___.', "I'm waiting in the park.", ['parku', 'park', 'parkiem'], 'parku', 'Masculine nouns ending in k, g, ch take -u.'],
      ],
      spotlight: {
        title: 'The locative: where things are',
        body: [
          'After {w} (in) and {na} (on, at), nouns take the **locative**. Most take **-e**, which softens the consonant before it; nouns ending in k, g, ch and some others take **-u**.',
          'Use {na} for open spaces, events and a handful of places: {na poczcie}, {na dworcu}, {na uniwersytecie}. Learn which ones as you meet them.',
        ],
        table: {
          head: ['Place', 'Where?'],
          rows: [
            ['sklep', 'w sklepie'],
            ['Polska', 'w Polsce'],
            ['praca', 'w pracy'],
            ['dom', 'w domu'],
            ['bank', 'w banku'],
            ['poczta', 'na poczcie'],
          ],
        },
      },
    }),
    lesson('u09-l3', 'Left, right, straight on', 'Ask for and follow directions.', {
      items: [
        ['prosto', 'straight on', { altEn: ['straight ahead', 'straight'] }],
        ['w lewo', 'left', { altEn: ['to the left', 'turn left'] }],
        ['w prawo', 'right', { altEn: ['to the right', 'turn right'] }],
        ['blisko', 'near', { altEn: ['close', 'nearby', 'close by'] }],
        ['daleko', 'far', { altEn: ['far away'] }],
        ['obok', 'next to', { altEn: ['beside'] }],
        ['naprzeciwko', 'opposite', { altEn: ['across from'] }],
        ['na rogu', 'on the corner'],
      ],
      sentences: [
        ['Apteka jest blisko.', "The chemist's is nearby.", { altEn: ['The pharmacy is near.', 'The chemist is close.', 'The chemist is nearby.', "The chemist's is close."], extra: ['daleko', 'tam'] }],
        ['Proszę iść prosto, potem w lewo.', 'Go straight on, then left.', { altEn: ['Go straight ahead, then turn left.', 'Please go straight on, then left.'], extra: ['prawo', 'obok'] }],
        ['Bank jest obok poczty.', 'The bank is next to the post office.', { altEn: ['The bank is beside the post office.'], extra: ['poczta', 'na'] }],
        ['Czy to daleko?', 'Is it far?', { altEn: ['Is that far?', 'Is it far away?'], altPl: ['To daleko?'], extra: ['blisko', 'jest'] }],
      ],
      dialogue: [
        ['Turysta', 'Przepraszam, gdzie jest dworzec?', 'Excuse me, where is the station?'],
        ['Pani', 'Proszę iść prosto, potem w prawo.', 'Go straight on, then right.'],
        ['Turysta', 'Czy to daleko?', 'Is it far?'],
        ['Pani', 'Nie, blisko. Pięć minut.', "No, it's close. Five minutes."],
        ['Turysta', 'Dziękuję bardzo!', 'Thank you very much!'],
      ],
    }),
  ],
);

export const u10 = unit(
  10,
  'A1',
  'Time & days',
  'Czas i dni',
  'Days of the week, telling the time and describing your daily routine.',
  [
    lesson('u10-l1', 'Days of the week', 'Name the days and say "on Monday".', {
      items: [
        ['poniedziałek', 'Monday', { g: 'm', hint: 'Literally "after Sunday".' }],
        ['wtorek', 'Tuesday', { g: 'm' }],
        ['środa', 'Wednesday', { g: 'f', hint: 'From "middle" — the middle of the week.' }],
        ['czwartek', 'Thursday', { g: 'm', hint: 'From "fourth".' }],
        ['piątek', 'Friday', { g: 'm', hint: 'From "fifth".' }],
        ['sobota', 'Saturday', { g: 'f' }],
        ['niedziela', 'Sunday', { g: 'f', hint: 'From "not working".' }],
        ['dzisiaj', 'today', { altPl: ['dziś'] }],
        ['jutro', 'tomorrow'],
        ['wczoraj', 'yesterday'],
      ],
      sentences: [
        ['Dzisiaj jest piątek.', "Today is Friday.", { altEn: ["It's Friday today.", 'It is Friday today.'], altPl: ['Dziś jest piątek.'], extra: ['jutro', 'piątku'] }],
        ['W sobotę mam czas.', "I'm free on Saturday.", { altEn: ['I have time on Saturday.', "I've got time on Saturday."], altPl: ['Mam czas w sobotę.'], extra: ['sobota', 'nie'] }],
        ['Jutro pracuję.', "I'm working tomorrow.", { altEn: ['Tomorrow I work.', 'I work tomorrow.', "Tomorrow I'm working."], altPl: ['Pracuję jutro.'], extra: ['wczoraj', 'pracuje'] }],
        ['Do zobaczenia w poniedziałek!', 'See you on Monday!', { extra: ['we', 'poniedziałku'] }],
      ],
      drills: [
        ['w ___', 'on Wednesday', ['środę', 'środa', 'środzie'], 'środę', 'Days ending in -a take -ę after w (accusative).'],
        ['___ wtorek', 'on Tuesday', ['we', 'w', 'na'], 'we', 'w becomes we before a w-: we wtorek.'],
        ['w ___', 'on Sunday', ['niedzielę', 'niedziela', 'niedzieli'], 'niedzielę'],
        ['w ___', 'on Friday', ['piątek', 'piątku', 'piątkiem'], 'piątek'],
      ],
    }),
    lesson('u10-l2', 'What time is it?', 'Tell the time on the hour.', {
      items: [
        ['która jest godzina?', 'what time is it?', { altEn: ["what's the time?", 'what is the time?'] }],
        ['o której?', 'at what time?', { altEn: ['what time?', 'when?'] }],
        ['godzina', 'hour', { altEn: ["o'clock", 'time'], g: 'f' }],
        ['minuta', 'minute', { g: 'f' }],
        ['rano', 'in the morning', { altEn: ['morning', 'early'] }],
        ['po południu', 'in the afternoon', { altEn: ['afternoon', 'pm'] }],
        ['wieczorem', 'in the evening', { altEn: ['evening', 'this evening', 'tonight'] }],
        ['w nocy', 'at night', { altEn: ['in the night'] }],
        ['teraz', 'now', { altEn: ['right now'] }],
      ],
      sentences: [
        ['Jest druga.', "It's two o'clock.", { altEn: ["It's two.", 'It is two.', "It is two o'clock."], extra: ['dwa', 'drugiej'] }],
        ['Pracuję od dziewiątej do piątej.', 'I work from nine to five.', { altEn: ['I work nine to five.', "I work from nine till five."], extra: ['dziewięć', 'pięć'] }],
        ['O której jest pociąg?', 'What time is the train?', { altEn: ['When is the train?', 'At what time is the train?'], extra: ['która', 'godzina'] }],
        ['Wieczorem czytam.', 'I read in the evening.', { altEn: ['In the evening I read.', "In the evening I'm reading."], altPl: ['Czytam wieczorem.'], extra: ['rano', 'czyta'] }],
      ],
      drills: [
        ['Jest ___.', "It's three o'clock.", ['trzecia', 'trzy', 'trzeciej'], 'trzecia', 'Hours use ordinal numbers: "the third (hour)".'],
        ['Spotkanie jest o ___.', 'The meeting is at five.', ['piątej', 'piąta', 'pięć'], 'piątej', '"At" an hour: o + -ej.'],
        ['Jest ___.', "It's eight o'clock.", ['ósma', 'osiem', 'ósmej'], 'ósma'],
        ['Wstaję o ___.', 'I get up at seven.', ['siódmej', 'siódma', 'siedem'], 'siódmej'],
      ],
      spotlight: {
        title: 'Hours are "the first", "the second"…',
        body: [
          'Polish tells the time with feminine ordinal numbers (agreeing with {godzina}). "It is three" is {Jest trzecia}; "at three" is {o trzeciej}.',
          'Timetables use the 24-hour clock: {o siedemnastej} is at 17:00.',
        ],
        table: {
          head: ['Time', 'It is…', 'At…'],
          rows: [
            ['1:00', 'pierwsza', 'o pierwszej'],
            ['2:00', 'druga', 'o drugiej'],
            ['3:00', 'trzecia', 'o trzeciej'],
            ['4:00', 'czwarta', 'o czwartej'],
            ['5:00', 'piąta', 'o piątej'],
            ['6:00', 'szósta', 'o szóstej'],
            ['7:00', 'siódma', 'o siódmej'],
            ['8:00', 'ósma', 'o ósmej'],
            ['9:00', 'dziewiąta', 'o dziewiątej'],
            ['10:00', 'dziesiąta', 'o dziesiątej'],
            ['11:00', 'jedenasta', 'o jedenastej'],
            ['12:00', 'dwunasta', 'o dwunastej'],
          ],
        },
      },
    }),
    lesson('u10-l3', 'My day', 'Describe your daily routine.', {
      items: [
        ['wstaję', 'I get up', { altEn: ['i wake up', 'i am getting up'] }],
        ['myję się', 'I wash', { altEn: ['i have a wash', "i'm washing"] }],
        ['jem śniadanie', 'I have breakfast', { altEn: ['i eat breakfast', "i'm having breakfast"] }],
        ['idę do pracy', 'I go to work', { altEn: ["i'm going to work"] }],
        ['wracam do domu', 'I come home', { altEn: ['i go home', 'i come back home', 'i return home', 'i get home'] }],
        ['gotuję', 'I cook', { altEn: ["i'm cooking"] }],
        ['oglądam telewizję', 'I watch TV', { altEn: ['i watch television', "i'm watching tv", 'i watch telly'] }],
        ['idę spać', 'I go to bed', { altEn: ["i'm going to bed", 'i go to sleep'] }],
        ['zwykle', 'usually', { altEn: ['normally'] }],
      ],
      sentences: [
        ['Wstaję o siódmej.', 'I get up at seven.', { altEn: ["I get up at seven o'clock.", 'I wake up at seven.'], extra: ['siedem', 'wstaje'] }],
        ['Zwykle jem śniadanie w domu.', 'I usually have breakfast at home.', { altEn: ['I usually eat breakfast at home.', 'Usually I have breakfast at home.'], altPl: ['Zwykle jem śniadanie w domu.', 'Śniadanie zwykle jem w domu.'], extra: ['obiad', 'pracy'] }],
        ['Wracam do domu o szóstej.', 'I get home at six.', { altEn: ['I come home at six.', 'I come back home at six.', 'I go home at six.', "I get home at six o'clock."], extra: ['sześć', 'w'] }],
        ['Wieczorem oglądam telewizję.', 'In the evening I watch TV.', { altEn: ['I watch TV in the evening.', 'I watch television in the evening.', 'In the evening I watch television.'], altPl: ['Oglądam telewizję wieczorem.'], extra: ['rano', 'telewizja'] }],
      ],
      spotlight: {
        title: 'Się: doing it to yourself',
        body: [
          'Some verbs need {się} ("oneself"): {myję się} (I wash myself), {uczę się} (I teach myself = I learn), {nazywam się} (I call myself).',
          '{Się} never goes first in a sentence and likes to sit near the start: {Jak się masz?}',
        ],
      },
    }),
  ],
);

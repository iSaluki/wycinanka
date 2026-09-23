import { lesson, unit } from '../build';

export const u01 = unit(
  1,
  'A1',
  'Sounds of Polish',
  'Dźwięki',
  'Polish is spelt the way it sounds. Learn the letters that trip English speakers up and you can read anything aloud.',
  [
    lesson('u01-l1', 'Vowels and friendly letters', 'Read short words aloud: vowels, w, j and c.', {
      items: [
        ['tak', 'yes', { hint: 'Rhymes with "tuck" said with an open "a".' }],
        ['nie', 'no', { altEn: ['not'], hint: 'One syllable: "nyeh".' }],
        ['dom', 'house', { altEn: ['home'], g: 'm', hint: 'o as in "dog".' }],
        ['kot', 'cat', { g: 'm' }],
        ['woda', 'water', { g: 'f', hint: 'w sounds like English v: "VO-da".' }],
        ['jajko', 'egg', { g: 'n', hint: 'j sounds like English y: "YAY-ko".' }],
        ['ser', 'cheese', { g: 'm', hint: 'Roll or tap the r.' }],
        ['noc', 'night', { g: 'f', hint: 'c is always "ts": "nots".' }],
      ],
      sentences: [
        ['To jest kot.', 'This is a cat.', { altEn: ['It is a cat.', "It's a cat.", 'That is a cat.'], extra: ['dom', 'nie'] }],
        ['To jest dom.', 'This is a house.', { altEn: ['It is a house.', 'This is a home.', 'That is a house.'], extra: ['kot', 'tak'] }],
        ['Tak, to woda.', "Yes, it's water.", { altEn: ['Yes, it is water.', 'Yes, this is water.', "Yes, that's water."], extra: ['nie', 'ser'] }],
      ],
      drills: [
        ['___oda (water)', 'Which letter makes the English "v" sound?', ['w', 'v', 'f'], 'w', 'Polish uses w for the "v" sound. The letter v only appears in foreign words.'],
        ['___ajko (egg)', 'Which letter makes the English "y" sound?', ['j', 'y', 'i'], 'j', 'j is always "y" as in "yes". Polish y is a vowel.'],
        ['no___ (night)', 'Which letter says "ts"?', ['c', 'ts', 'z'], 'c', 'c is always "ts", never "k" or "s".'],
      ],
      spotlight: {
        title: 'Polish is spelt as it sounds',
        body: [
          'Once you know the rules, every Polish word can be read aloud. Vowels are short and pure: **a e i o u**, plus **y**, which sounds like the "i" in "bit".',
          'Stress almost always falls on the **second-to-last syllable**: {WO-da}, {JAJ-ko}.',
        ],
        table: {
          head: ['Letter', 'Sounds like', 'Example'],
          rows: [
            ['w', 'v in "van"', 'woda'],
            ['j', 'y in "yes"', 'jajko'],
            ['c', 'ts in "cats"', 'noc'],
            ['y', 'i in "bit"', 'ty'],
            ['ó', 'the same as u', 'ósmy'],
          ],
        },
      },
    }),
    lesson('u01-l2', 'Ł, ch and the digraphs', 'Say ł, ch, sz, cz and rz.', {
      items: [
        ['mały', 'small', { altEn: ['little'], hint: 'ł sounds like English w: "MA-wy".' }],
        ['chleb', 'bread', { g: 'm', hint: 'ch as in Scottish "loch"; final b sounds like p: "khlep".' }],
        ['herbata', 'tea', { g: 'f', hint: 'h sounds the same as ch.' }],
        ['szkoła', 'school', { g: 'f', hint: 'sz = "sh": "SHKO-wa".' }],
        ['czas', 'time', { g: 'm', hint: 'cz = "ch" as in "church".' }],
        ['rzeka', 'river', { g: 'f', hint: 'rz sounds like the "s" in "pleasure".' }],
        ['żaba', 'frog', { g: 'f', hint: 'ż sounds exactly like rz.' }],
      ],
      sentences: [
        ['To jest szkoła.', 'This is a school.', { altEn: ['It is a school.', "It's a school.", 'That is a school.'], extra: ['rzeka', 'czas'] }],
        ['Chleb i ser.', 'Bread and cheese.', { altEn: ['Bread and some cheese.'], extra: ['woda', 'herbata'] }],
        ['Mały kot.', 'A small cat.', { altEn: ['Small cat.', 'A little cat.', 'Little cat.'], extra: ['mała', 'dom'] }],
      ],
      drills: [
        ['___koła (school)', 'Which spelling makes the "sh" sound?', ['sz', 'cz', 'ś'], 'sz'],
        ['___as (time)', 'Which spelling makes the "ch" in "church"?', ['cz', 'ch', 'sz'], 'cz', 'ch is the throaty "loch" sound; cz is "church".'],
        ['___eka (river)', 'Pick the correct spelling.', ['rz', 'ż', 'sz'], 'rz', 'rz and ż sound identical, so the spelling has to be learnt word by word.'],
        ['ma___y (small)', 'Which letter sounds like English "w"?', ['ł', 'l', 'w'], 'ł'],
      ],
      spotlight: {
        title: 'Two letters, one sound',
        body: [
          'Polish writes several single sounds with two letters. Learn these five and most words open up.',
          'At the end of a word, voiced consonants lose their voice: {chleb} sounds like "khlep", {żabka} like "zhapka".',
        ],
        table: {
          head: ['Spelling', 'Sounds like', 'Example'],
          rows: [
            ['sz', 'sh in "shop"', 'szkoła'],
            ['cz', 'ch in "church"', 'czas'],
            ['rz / ż', 's in "pleasure"', 'rzeka, żaba'],
            ['ch / h', 'ch in "loch"', 'chleb, herbata'],
            ['ł', 'w in "wet"', 'mały'],
          ],
        },
      },
    }),
    lesson('u01-l3', 'Soft sounds and nasal vowels', 'Hear the difference between sz and ś, and say ą and ę.', {
      items: [
        ['cześć', 'hi', { altEn: ['hello', 'bye'], hint: 'cz + e + ś + ć: "cheshch". Informal.' }],
        ['ciocia', 'aunt', { altEn: ['auntie'], g: 'f', hint: 'ci = soft "ch", tongue tip down: "CHO-cha".' }],
        ['siedem', 'seven', { hint: 'si = soft "sh": "SHE-dem".' }],
        ['koń', 'horse', { g: 'm', hint: 'ń is like the "ny" in "canyon".' }],
        ['źle', 'badly', { altEn: ['bad', 'wrong'], hint: 'ź is a soft "zh".' }],
        ['ręka', 'hand', { altEn: ['arm'], g: 'f', hint: 'ę before k sounds like "en": "REN-ka".' }],
        ['mięso', 'meat', { g: 'n', hint: 'ę before s is nasal: "MYEN-so".' }],
        ['są', 'they are', { altEn: ['are'], hint: 'ą at the end sounds like French "on": "sown".' }],
      ],
      sentences: [
        ['Cześć, Kasia!', 'Hi, Kasia!', { altEn: ['Hello, Kasia!', 'Hi Kasia!'], extra: ['Kasza', 'nie'] }],
        ['To jest ciocia.', 'This is my aunt.', { altEn: ['This is auntie.', 'This is an aunt.', "It's my aunt.", 'This is aunt.'], extra: ['koń', 'mięso'] }],
        ['To jest koń.', 'This is a horse.', { altEn: ['It is a horse.', "It's a horse.", 'That is a horse.'], extra: ['kot', 'ręka'] }],
      ],
      drills: [
        ['cze___ć (hi)', 'Which sibilant is soft here?', ['ś', 'sz', 's'], 'ś', 'ś is the soft, "smiling" sh. Tongue tip down behind the lower teeth.'],
        ['___ocia (aunt)', 'Before a vowel, the soft "ć" is written…', ['ci', 'ć', 'cz'], 'ci', 'Before a vowel, soft sounds are written with i: ci, si, zi, ni, dzi.'],
        ['ko___ (horse)', 'Which letter is the soft n?', ['ń', 'n', 'ni'], 'ń', 'At the end of a word the soft n is written ń.'],
        ['r___ka (hand)', 'Which nasal vowel?', ['ę', 'ą', 'e'], 'ę'],
      ],
      spotlight: {
        title: 'The sounds English does not have',
        body: [
          'Polish has three families of hissing sounds. The **soft** family (ś ć ź ń dź) is made with the tongue tip *down* and the middle of the tongue raised, as if smiling.',
          'Before a vowel they are spelt with **i**: {ś} → {si}, {ć} → {ci}, {ź} → {zi}, {ń} → {ni}. So {Kasia} has a soft "sh", while {kasza} (buckwheat) has a hard one.',
          '**ą** and **ę** are nasal vowels. At the end of a word **ę** is usually said as a plain e: {dziękuję} ends in "-ye".',
        ],
        table: {
          head: ['Hard', 'Soft', 'Soft before vowel'],
          rows: [
            ['sz', 'ś', 'si'],
            ['cz', 'ć', 'ci'],
            ['ż / rz', 'ź', 'zi'],
            ['dż', 'dź', 'dzi'],
            ['n', 'ń', 'ni'],
          ],
        },
      },
    }),
  ],
);

export const u02 = unit(
  2,
  'A1',
  'Hello & goodbye',
  'Powitania',
  'Greet people properly, thank them, apologise, and learn when to be formal.',
  [
    lesson('u02-l1', 'Greetings', 'Say hello and goodbye at any time of day.', {
      items: [
        ['dzień dobry', 'hello', { altEn: ['good morning', 'good afternoon', 'good day'], hint: 'Literally "good day". Use until evening, with anyone.' }],
        ['dobry wieczór', 'good evening'],
        ['do widzenia', 'goodbye', { hint: 'Formal. Literally "until seeing".' }],
        ['na razie', 'see you', { altEn: ['bye', 'see you later', 'for now'], hint: 'Casual, with friends.' }],
        ['dobranoc', 'good night'],
        ['hej', 'hey', { altEn: ['hi'] }],
        ['do zobaczenia', 'see you soon', { altEn: ['see you', 'see you later'] }],
      ],
      sentences: [
        ['Dzień dobry, pani Anno!', 'Good morning, Anna!', { altEn: ['Hello, Anna!', 'Good afternoon, Anna!', 'Hello, Mrs Anna!'], extra: ['wieczór', 'dobranoc'] }],
        ['Na razie, do zobaczenia!', 'Bye, see you soon!', { altEn: ['See you, see you soon!', 'Bye, see you later!', 'See you later!'], extra: ['dobranoc', 'widzenia'] }],
        ['Dobranoc, mamo.', 'Good night, Mum.', { altEn: ['Good night, mum.', 'Goodnight, Mum.'], extra: ['dzień', 'mama'] }],
      ],
      dialogue: [
        ['Ola', 'Hej, Tom!', 'Hey, Tom!'],
        ['Tom', 'Cześć, Ola! Na razie!', 'Hi, Ola! See you!'],
        ['Ola', 'Do zobaczenia!', 'See you soon!'],
      ],
    }),
    lesson('u02-l2', 'Please, thank you, sorry', 'Be polite: please, thanks, sorry and "no problem".', {
      items: [
        ['proszę', 'please', { altEn: ['here you are', "you're welcome"], hint: 'The Swiss army knife of Polish politeness.' }],
        ['dziękuję', 'thank you', { altEn: ['thanks'], hint: '"jen-KOO-yeh".' }],
        ['dzięki', 'thanks', { altEn: ['cheers'] }],
        ['przepraszam', 'sorry', { altEn: ['excuse me', "i'm sorry"], hint: '"pshe-PRA-sham".' }],
        ['nie ma za co', "you're welcome", { altEn: ["don't mention it", 'no problem', 'not at all'] }],
        ['dobrze', 'fine', { altEn: ['good', 'well', 'ok', 'okay'] }],
        ['w porządku', 'all right', { altEn: ['alright', 'ok', 'okay', 'fine'] }],
        ['bardzo', 'very', { altEn: ['very much', 'a lot'] }],
      ],
      sentences: [
        ['Dziękuję bardzo!', 'Thank you very much!', { altEn: ['Thanks a lot!', 'Thank you so much!'], extra: ['proszę', 'dzięki'] }],
        ['Przepraszam, proszę.', 'Excuse me, please.', { altEn: ['Sorry, please.'], extra: ['dobrze', 'tak'] }],
        ['Nie ma za co.', "You're welcome.", { altEn: ["Don't mention it.", 'No problem.', 'Not at all.'], extra: ['jest', 'to'] }],
        ['Tak, w porządku.', "Yes, that's all right.", { altEn: ['Yes, all right.', "Yes, it's fine.", 'Yes, OK.', "Yes, it's all right.", 'Yes, alright.'], extra: ['nie', 'dobrze'] }],
      ],
      spotlight: {
        title: 'Proszę does a lot of work',
        body: [
          '{Proszę} means "please", but also "here you are" when handing something over, "you\'re welcome" after thanks, and "pardon?" when said as a question: {Proszę?}',
          'In a shop you will hear it constantly. Answer {dziękuję} and you are already sounding polite.',
        ],
        examples: [
          ['Proszę.', 'Here you are.'],
          ['Proszę?', 'Pardon?'],
        ],
      },
    }),
    lesson('u02-l3', 'How are you? Pan and pani', 'Ask how someone is, formally and informally.', {
      items: [
        ['jak się masz?', 'how are you?', { hint: 'Informal: friends, family, children.' }],
        ['jak się pan ma?', 'how are you? (to a man, formal)', { altEn: ['how are you?', 'how are you sir?'] }],
        ['jak się pani ma?', 'how are you? (to a woman, formal)', { altEn: ['how are you?', 'how are you madam?'] }],
        ['pan', 'sir', { altEn: ['mr', 'you (formal, to a man)', 'gentleman'], g: 'm' }],
        ['pani', 'madam', { altEn: ['mrs', 'ms', 'you (formal, to a woman)', 'lady'], g: 'f' }],
        ['a ty?', 'and you?', { altEn: ['what about you?', 'and yourself?'] }],
        ['świetnie', 'great', { altEn: ['brilliant', 'excellent', 'fantastic'] }],
        ['tak sobie', 'so-so', { altEn: ['so so', 'not bad', 'okay-ish'] }],
      ],
      sentences: [
        ['Dobrze, dziękuję. A ty?', 'Fine, thanks. And you?', { altEn: ['Good, thank you. And you?', 'Fine, thank you. And you?', 'Well, thanks. And you?'], extra: ['pan', 'masz'] }],
        ['Jak się pani ma?', 'How are you?', { altEn: ['How are you, madam?'], extra: ['pan', 'masz'] }],
        ['Świetnie, dziękuję!', 'Great, thanks!', { altEn: ['Great, thank you!', 'Brilliant, thanks!'], extra: ['tak', 'sobie'] }],
      ],
      drills: [
        ['Jak się ___? (to a friend)', 'Informal "you"', ['masz', 'pan ma', 'ma'], 'masz'],
        ['Jak się ___ ma? (to a woman you have just met)', 'Formal "you" for a woman', ['pani', 'pan', 'ty'], 'pani'],
        ['Jak się ___ ma? (to an older man)', 'Formal "you" for a man', ['pan', 'pani', 'ty'], 'pan'],
      ],
      spotlight: {
        title: 'Formal "you": pan and pani',
        body: [
          'With strangers, shop staff and older people, Poles do not say {ty} (you). They say {pan} (to a man) or {pani} (to a woman), with the verb in the "he/she" form.',
          'So "How are you?" to a woman you have just met is {Jak się pani ma?} — literally "How does the lady have herself?". Switch to {ty} when they suggest it.',
        ],
        table: {
          head: ['Talking to', 'Say'],
          rows: [
            ['a friend', 'Jak się masz?'],
            ['a man (formal)', 'Jak się pan ma?'],
            ['a woman (formal)', 'Jak się pani ma?'],
          ],
        },
      },
      dialogue: [
        ['Pani Nowak', 'Dzień dobry!', 'Good morning!'],
        ['Pan Smith', 'Dzień dobry! Jak się pani ma?', 'Good morning! How are you?'],
        ['Pani Nowak', 'Dobrze, dziękuję. A pan?', 'Fine, thank you. And you?'],
        ['Pan Smith', 'Świetnie, dziękuję.', 'Great, thanks.'],
      ],
    }),
  ],
);

export const u03 = unit(
  3,
  'A1',
  'Who I am',
  'Kim jestem',
  'Introduce yourself: your name, where you are from, and the verb "to be".',
  [
    lesson('u03-l1', 'I am, you are', 'Use the verb być (to be).', {
      items: [
        ['ja', 'I'],
        ['ty', 'you', { hint: 'Informal, one person.' }],
        ['on', 'he'],
        ['ona', 'she'],
        ['jestem', 'I am', { altEn: ["i'm"] }],
        ['jesteś', 'you are', { altEn: ["you're"] }],
        ['jest', 'is', { altEn: ['he is', 'she is', 'it is'] }],
        ['jesteśmy', 'we are', { altEn: ["we're"] }],
        ['oni', 'they', { hint: 'For men or mixed groups. For women or things: one.' }],
      ],
      sentences: [
        ['Jestem Tom.', "I'm Tom.", { altEn: ['I am Tom.'], altPl: ['Ja jestem Tom.'], extra: ['jest', 'jesteś'] }],
        ['Ona jest w domu.', 'She is at home.', { altEn: ["She's at home.", 'She is home.'], extra: ['on', 'są'] }],
        ['My jesteśmy tutaj.', 'We are here.', { altEn: ["We're here."], altPl: ['Jesteśmy tutaj.', 'Jesteśmy tu.', 'My jesteśmy tu.'], extra: ['są', 'tam'] }],
        ['Oni są razem.', 'They are together.', { altEn: ["They're together."], altPl: ['Są razem.'], extra: ['jest', 'ona'] }],
      ],
      drills: [
        ['Ja ___ Anna.', 'I am Anna.', ['jestem', 'jest', 'jesteś'], 'jestem'],
        ['Oni ___ w domu.', 'They are at home.', ['są', 'jest', 'jesteśmy'], 'są'],
        ['Ty ___ z Anglii?', 'Are you from England?', ['jesteś', 'jestem', 'są'], 'jesteś'],
        ['Marek ___ tutaj.', 'Marek is here.', ['jest', 'są', 'jestem'], 'jest'],
      ],
      spotlight: {
        title: 'Być — to be',
        body: [
          'The verb ending already tells you who is doing it, so Poles usually leave out {ja}, {ty} and the rest: {Jestem Tom} is enough.',
        ],
        table: {
          head: ['', 'singular', 'plural'],
          rows: [
            ['1st', 'jestem — I am', 'jesteśmy — we are'],
            ['2nd', 'jesteś — you are', 'jesteście — you (all) are'],
            ['3rd', 'jest — he/she/it is', 'są — they are'],
          ],
        },
      },
    }),
    lesson('u03-l2', 'My name is…', 'Give your name and introduce a friend.', {
      items: [
        ['nazywam się', 'my name is', { altEn: ["i'm called", 'i am called'], hint: 'Often used with your full name.' }],
        ['jak się nazywasz?', "what's your name?", { altEn: ['what is your name?'] }],
        ['mam na imię', 'my first name is', { altEn: ['my name is'] }],
        ['miło mi', 'nice to meet you', { altEn: ['pleased to meet you', 'pleasure'] }],
        ['bardzo mi miło', 'very nice to meet you', { altEn: ['lovely to meet you', 'very pleased to meet you'] }],
        ['to jest', 'this is', { altEn: ['it is', 'that is'] }],
        ['mój przyjaciel', 'my friend', { altEn: ['my friend (man)'], hint: 'A male friend.' }],
        ['moja przyjaciółka', 'my friend', { altEn: ['my friend (woman)', 'my girlfriend'], hint: 'A female friend.' }],
      ],
      sentences: [
        ['Nazywam się Emma Smith.', 'My name is Emma Smith.', { altEn: ["I'm Emma Smith.", 'I am called Emma Smith.'], extra: ['mam', 'jest'] }],
        ['Mam na imię Jack.', 'My name is Jack.', { altEn: ['My first name is Jack.', "I'm Jack."], extra: ['nazywam', 'się'] }],
        ['To jest mój przyjaciel, Adam.', 'This is my friend, Adam.', { altEn: ['This is my friend Adam.'], extra: ['moja', 'przyjaciółka'] }],
        ['Miło mi, jestem Kasia.', "Nice to meet you, I'm Kasia.", { altEn: ['Nice to meet you, I am Kasia.', "Pleased to meet you, I'm Kasia."], extra: ['jest', 'mam'] }],
      ],
      dialogue: [
        ['Kasia', 'Cześć! Jak się nazywasz?', "Hi! What's your name?"],
        ['Jack', 'Mam na imię Jack. A ty?', 'My name is Jack. And you?'],
        ['Kasia', 'Kasia. Miło mi!', 'Kasia. Nice to meet you!'],
        ['Jack', 'Bardzo mi miło. To jest moja przyjaciółka, Emma.', "Lovely to meet you. This is my friend, Emma."],
      ],
    }),
    lesson('u03-l3', 'Where are you from?', 'Say where you are from and where you live.', {
      items: [
        ['skąd jesteś?', 'where are you from?'],
        ['z Anglii', 'from England'],
        ['z Wielkiej Brytanii', 'from Great Britain', { altEn: ['from the uk', 'from britain'] }],
        ['ze Szkocji', 'from Scotland', { hint: 'z becomes ze before awkward clusters like "sz-k".' }],
        ['z Walii', 'from Wales'],
        ['z Polski', 'from Poland'],
        ['Anglik', 'Englishman', { altEn: ['an englishman'], g: 'm' }],
        ['Angielka', 'Englishwoman', { altEn: ['an englishwoman'], g: 'f' }],
        ['Polka', 'Polish woman', { altEn: ['a polish woman', 'pole'], g: 'f' }],
        ['mieszkam w Londynie', 'I live in London'],
      ],
      sentences: [
        ['Jestem z Anglii.', "I'm from England.", { altEn: ['I am from England.'], extra: ['Polski', 'jest'] }],
        ['Skąd jesteś? Z Polski?', 'Where are you from? Poland?', { altEn: ['Where are you from? From Poland?'], extra: ['jestem', 'Anglii'] }],
        ['Kasia to Polka.', 'Kasia is Polish.', { altEn: ['Kasia is a Pole.', 'Kasia is a Polish woman.'], extra: ['Polak', 'jestem'] }],
        ['Mieszkam w Londynie, ale jestem ze Szkocji.', "I live in London, but I'm from Scotland.", { altEn: ['I live in London but I am from Scotland.', 'I live in London, but I am from Scotland.'], extra: ['z', 'Walii'] }],
      ],
      drills: [
        ['Jestem ___ Szkocji.', "I'm from Scotland.", ['ze', 'z', 'w'], 'ze', 'z becomes ze before clusters that start with s, z, sz, ż…'],
        ['Kasia to ___.', 'Kasia is a Polish woman.', ['Polka', 'Polak', 'Polski'], 'Polka'],
        ['Tom to ___.', 'Tom is an Englishman.', ['Anglik', 'Angielka', 'Anglii'], 'Anglik'],
        ['Jestem z ___.', "I'm from Wales.", ['Walii', 'Walia', 'Walię'], 'Walii'],
      ],
      spotlight: {
        title: 'Nationalities have gender',
        body: [
          'Nationality words change for men and women: {Anglik} / {Angielka}, {Polak} / {Polka}, {Szkot} / {Szkotka}, {Brytyjczyk} / {Brytyjka}.',
          '"From" is {z} + a special form of the country (the genitive case). Learn them as phrases for now: {z Anglii}, {z Polski}, {z Irlandii}.',
        ],
      },
    }),
  ],
);

export const u04 = unit(
  4,
  'A1',
  'This & that',
  'To i tamto',
  'Every Polish noun is masculine, feminine or neuter. Spot the gender and adjectives fall into place.',
  [
    lesson('u04-l1', 'He, she or it?', 'Tell a noun\'s gender from its ending.', {
      items: [
        ['telefon', 'phone', { altEn: ['mobile', 'telephone'], g: 'm' }],
        ['samochód', 'car', { g: 'm', hint: 'ó = u, final d = t: "sa-MO-khoot".' }],
        ['stół', 'table', { g: 'm' }],
        ['książka', 'book', { g: 'f' }],
        ['torba', 'bag', { g: 'f' }],
        ['ulica', 'street', { altEn: ['road'], g: 'f' }],
        ['okno', 'window', { g: 'n' }],
        ['krzesło', 'chair', { g: 'n' }],
        ['mieszkanie', 'flat', { altEn: ['apartment'], g: 'n' }],
      ],
      sentences: [
        ['Gdzie jest mój telefon?', "Where's my phone?", { altEn: ['Where is my phone?', 'Where is my mobile?'], extra: ['moja', 'torba'] }],
        ['Gdzie jest moja torba?', "Where's my bag?", { altEn: ['Where is my bag?'], extra: ['mój', 'telefon'] }],
        ['To jest moje mieszkanie.', 'This is my flat.', { altEn: ['This is my apartment.', "It's my flat."], extra: ['mój', 'moja'] }],
      ],
      drills: [
        ['___ telefon', 'this phone', ['ten', 'ta', 'to'], 'ten', 'Ends in a consonant → masculine.'],
        ['___ książka', 'this book', ['ta', 'ten', 'to'], 'ta', 'Ends in -a → feminine.'],
        ['___ okno', 'this window', ['to', 'ten', 'ta'], 'to', 'Ends in -o → neuter.'],
        ['___ mieszkanie', 'this flat', ['to', 'ta', 'ten'], 'to', 'Ends in -e → neuter.'],
      ],
      spotlight: {
        title: 'Gender from the ending',
        body: [
          'Look at the last letter. It is right about 95% of the time.',
          'Words for men that end in -a (like {tata}, dad) are still masculine — meaning beats spelling.',
        ],
        table: {
          head: ['Ending', 'Gender', '"this"', 'Example'],
          rows: [
            ['consonant', 'masculine', 'ten', 'ten telefon'],
            ['-a', 'feminine', 'ta', 'ta torba'],
            ['-o, -e, -ę, -um', 'neuter', 'to', 'to okno'],
          ],
        },
      },
    }),
    lesson('u04-l2', 'Big, small, new, old', 'Make adjectives agree with nouns.', {
      items: [
        ['duży', 'big', { altEn: ['large'] }],
        ['nowy', 'new'],
        ['stary', 'old'],
        ['dobry', 'good'],
        ['ładny', 'pretty', { altEn: ['nice', 'lovely', 'beautiful'] }],
        ['drogi', 'expensive', { altEn: ['dear'] }],
        ['tani', 'cheap', { altEn: ['inexpensive'] }],
        ['zimny', 'cold'],
      ],
      sentences: [
        ['To jest nowy telefon.', 'This is a new phone.', { altEn: ["It's a new phone.", 'This is a new mobile.'], extra: ['nowa', 'stary'] }],
        ['Ta książka jest dobra.', 'This book is good.', { altEn: ['The book is good.', 'That book is good.'], extra: ['dobry', 'ten'] }],
        ['Moje mieszkanie jest małe.', 'My flat is small.', { altEn: ['My apartment is small.', 'My flat is little.'], extra: ['mały', 'moja'] }],
        ['Samochód jest drogi, ale ładny.', 'The car is expensive, but nice.', { altEn: ['The car is expensive but pretty.', 'The car is expensive, but pretty.', 'The car is expensive but nice.', 'The car is dear, but nice.'], extra: ['tania', 'droga'] }],
      ],
      drills: [
        ['To jest ___ książka.', 'This is a new book.', ['nowa', 'nowy', 'nowe'], 'nowa'],
        ['To jest ___ okno.', 'This is a big window.', ['duże', 'duży', 'duża'], 'duże'],
        ['Mój samochód jest ___.', 'My car is old.', ['stary', 'stara', 'stare'], 'stary'],
        ['Kawa jest ___.', 'The coffee is cold.', ['zimna', 'zimny', 'zimne'], 'zimna'],
      ],
      spotlight: {
        title: 'Adjectives match the noun',
        body: ['The adjective takes the gender of its noun. Dictionaries list the masculine form.'],
        table: {
          head: ['masculine', 'feminine', 'neuter'],
          rows: [
            ['nowy telefon', 'nowa torba', 'nowe okno'],
            ['duży stół', 'duża ulica', 'duże mieszkanie'],
            ['tani samochód', 'tania książka', 'tanie krzesło'],
          ],
        },
      },
    }),
    lesson('u04-l3', 'What is it? Where is it?', 'Ask simple questions.', {
      items: [
        ['co to jest?', 'what is it?', { altEn: ["what's this?", 'what is this?', 'what is that?'] }],
        ['kto to jest?', 'who is it?', { altEn: ["who's this?", 'who is this?', 'who is that?'] }],
        ['gdzie', 'where'],
        ['tutaj', 'here', { altPl: ['tu'] }],
        ['tam', 'there'],
        ['czy', 'question word', { altEn: ['whether', 'if'], hint: 'Turns a statement into a yes/no question.' }],
        ['i', 'and'],
        ['ale', 'but'],
      ],
      sentences: [
        ['Co to jest? To jest herbata.', "What's this? It's tea.", { altEn: ['What is it? It is tea.', "What is this? It's tea.", 'What is this? This is tea.'], extra: ['kto', 'woda'] }],
        ['Kto to jest? To jest Marek.', "Who's this? It's Marek.", { altEn: ['Who is it? It is Marek.', 'Who is this? This is Marek.', "Who is that? That's Marek."], extra: ['co', 'gdzie'] }],
        ['Czy to jest twój telefon?', 'Is this your phone?', { altEn: ['Is that your phone?', 'Is this your mobile?'], altPl: ['To jest twój telefon?', 'Czy to twój telefon?'], extra: ['mój', 'twoja'] }],
        ['Telefon jest tutaj, ale torba jest tam.', 'The phone is here, but the bag is there.', { altEn: ['The phone is here but the bag is there.'], extra: ['gdzie', 'i'] }],
      ],
      spotlight: {
        title: 'Yes/no questions with czy',
        body: [
          'Put {czy} in front of a statement to make a yes/no question. Word order stays the same.',
          'In speech you can also just raise your voice at the end, as in English "It\'s your phone?"',
        ],
        examples: [
          ['To jest kawa.', 'This is coffee.'],
          ['Czy to jest kawa?', 'Is this coffee?'],
        ],
      },
    }),
  ],
);

export const u05 = unit(
  5,
  'A1',
  'Numbers & money',
  'Liczby i pieniądze',
  'Count to a hundred, understand prices and pay in złoty.',
  [
    lesson('u05-l1', 'One to ten', 'Count from one to ten.', {
      items: [
        ['jeden', 'one', { altEn: ['1'] }],
        ['dwa', 'two', { altEn: ['2'] }],
        ['trzy', 'three', { altEn: ['3'], hint: 'trz = "tsh": "tshy".' }],
        ['cztery', 'four', { altEn: ['4'] }],
        ['pięć', 'five', { altEn: ['5'], hint: '"pyench".' }],
        ['sześć', 'six', { altEn: ['6'], hint: '"sheshch".' }],
        ['osiem', 'eight', { altEn: ['8'] }],
        ['dziewięć', 'nine', { altEn: ['9'], hint: '"JE-vyench".' }],
        ['dziesięć', 'ten', { altEn: ['10'], hint: '"JE-shench".' }],
      ],
      sentences: [
        ['Dwa i dwa to cztery.', 'Two and two is four.', { altEn: ['Two plus two is four.', 'Two and two make four.', 'Two plus two equals four.'], extra: ['trzy', 'pięć'] }],
        ['Pięć i pięć to dziesięć.', 'Five and five is ten.', { altEn: ['Five plus five is ten.', 'Five and five make ten.', 'Five plus five equals ten.'], extra: ['sześć', 'dziewięć'] }],
        ['Trzy i sześć to dziewięć.', 'Three and six is nine.', { altEn: ['Three plus six is nine.', 'Three and six make nine.', 'Three plus six equals nine.'], extra: ['osiem', 'siedem'] }],
      ],
      drills: [
        ['dwa + trzy = ___', '2 + 3', ['pięć', 'sześć', 'cztery'], 'pięć'],
        ['cztery + cztery = ___', '4 + 4', ['osiem', 'siedem', 'dziewięć'], 'osiem'],
        ['jeden + dwa = ___', '1 + 2', ['trzy', 'dwa', 'cztery'], 'trzy'],
        ['pięć + pięć = ___', '5 + 5', ['dziesięć', 'dziewięć', 'sześć'], 'dziesięć'],
      ],
    }),
    lesson('u05-l2', 'Eleven to a hundred', 'Build any number up to 100.', {
      items: [
        ['jedenaście', 'eleven', { altEn: ['11'] }],
        ['dwanaście', 'twelve', { altEn: ['12'] }],
        ['piętnaście', 'fifteen', { altEn: ['15'] }],
        ['dwadzieścia', 'twenty', { altEn: ['20'] }],
        ['trzydzieści', 'thirty', { altEn: ['30'] }],
        ['czterdzieści', 'forty', { altEn: ['40'] }],
        ['pięćdziesiąt', 'fifty', { altEn: ['50'] }],
        ['sto', 'a hundred', { altEn: ['one hundred', 'hundred', '100'] }],
      ],
      sentences: [
        ['Mam dwadzieścia lat.', "I'm twenty.", { altEn: ['I am twenty years old.', "I'm twenty years old.", 'I am twenty.'], extra: ['dwanaście', 'jestem'] }],
        ['On ma trzydzieści pięć lat.', "He's thirty-five.", { altEn: ['He is thirty-five years old.', "He's thirty-five years old.", 'He is thirty five.', 'He is thirty-five.'], extra: ['jest', 'piętnaście'] }],
        ['To kosztuje piętnaście złotych.', 'It costs fifteen złoty.', { altEn: ['That costs fifteen zloty.', 'It costs fifteen zloty.', 'This costs fifteen złoty.'], extra: ['pięćdziesiąt', 'złote'] }],
      ],
      drills: [
        ['20 = ___', 'twenty', ['dwadzieścia', 'dwanaście', 'dwieście'], 'dwadzieścia'],
        ['50 = ___', 'fifty', ['pięćdziesiąt', 'piętnaście', 'pięćset'], 'pięćdziesiąt'],
        ['12 = ___', 'twelve', ['dwanaście', 'dwadzieścia', 'dwa'], 'dwanaście'],
        ['45 = czterdzieści ___', 'forty-five', ['pięć', 'piętnaście', 'pięćdziesiąt'], 'pięć'],
      ],
      spotlight: {
        title: 'Building numbers',
        body: [
          'Teens end in **-naście**, 20–40 in **-dzieści/-dzieścia**, and 50–90 in **-dziesiąt**. Compounds are simply added: {dwadzieścia pięć} (25), {sześćdziesiąt trzy} (63).',
          'Age uses "have": {Mam dwadzieścia lat} — "I have twenty years".',
        ],
        table: {
          head: ['Number', 'Polish'],
          rows: [
            ['13', 'trzynaście'],
            ['16', 'szesnaście'],
            ['60', 'sześćdziesiąt'],
            ['70', 'siedemdziesiąt'],
            ['90', 'dziewięćdziesiąt'],
          ],
        },
      },
    }),
    lesson('u05-l3', 'How much is it?', 'Ask prices and pay.', {
      items: [
        ['ile to kosztuje?', 'how much is it?', { altEn: ['how much does it cost?', 'how much is this?'] }],
        ['złoty', 'złoty', { altEn: ['zloty'], g: 'm', hint: 'The Polish currency, written zł or PLN.' }],
        ['grosz', 'grosz', { altEn: ['penny'], g: 'm', hint: '100 groszy = 1 złoty.' }],
        ['drogo', 'expensive', { altEn: ['dear', "it's expensive"] }],
        ['tanio', 'cheap', { altEn: ["it's cheap", 'cheaply'] }],
        ['płacę kartą', "I'll pay by card", { altEn: ['i pay by card', "i'm paying by card"] }],
        ['gotówką', 'in cash', { altEn: ['cash', 'with cash'] }],
        ['paragon', 'receipt', { g: 'm' }],
      ],
      sentences: [
        ['Ile to kosztuje?', 'How much is it?', { altEn: ['How much does it cost?', 'How much is this?', 'How much does this cost?'], extra: ['co', 'jest'] }],
        ['To kosztuje dwa złote.', 'It costs two złoty.', { altEn: ["It's two złoty.", 'It costs two zloty.', 'That costs two złoty.'], extra: ['złotych', 'złoty'] }],
        ['Płacę kartą, dziękuję.', "I'll pay by card, thanks.", { altEn: ["I'm paying by card, thank you.", 'I pay by card, thanks.', "I'll pay by card, thank you."], extra: ['gotówką', 'proszę'] }],
      ],
      drills: [
        ['jeden ___', '1 złoty', ['złoty', 'złote', 'złotych'], 'złoty'],
        ['dwa ___', '2 złoty', ['złote', 'złoty', 'złotych'], 'złote', '2, 3 and 4 take the plural form.'],
        ['pięć ___', '5 złoty', ['złotych', 'złote', 'złoty'], 'złotych', '5 and above take the "of" form (genitive plural).'],
        ['dwanaście ___', '12 złoty', ['złotych', 'złote', 'złoty'], 'złotych', '12–14 behave like 5+, not like 2–4.'],
        ['dwadzieścia trzy ___', '23 złoty', ['złote', 'złotych', 'złoty'], 'złote', 'Numbers ending in 2, 3, 4 (except 12–14) take the plural form.'],
      ],
      spotlight: {
        title: 'One złoty, two złote, five złotych',
        body: ['The noun after a number changes form. This pattern works for almost every noun, so it is worth learning now.'],
        table: {
          head: ['Number', 'Form', 'Example'],
          rows: [
            ['1', 'singular', 'jeden złoty'],
            ['2, 3, 4 (22, 23, 34…)', 'plural', 'trzy złote'],
            ['5–21, 25–31…', '"of" form', 'piętnaście złotych'],
          ],
        },
      },
      dialogue: [
        ['Klient', 'Dzień dobry. Ile to kosztuje?', 'Hello. How much is this?'],
        ['Sprzedawczyni', 'Dwanaście złotych.', 'Twelve złoty.'],
        ['Klient', 'Płacę kartą.', "I'll pay by card."],
        ['Sprzedawczyni', 'Proszę. Paragon?', 'Here you are. Receipt?'],
        ['Klient', 'Nie, dziękuję.', 'No, thank you.'],
      ],
    }),
  ],
);

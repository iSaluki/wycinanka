import { lesson, unit } from '../build';

/**
 * Unit 0 — the alphabet and phonics. Items are sounds, not words: `pl` is the spelling,
 * `en` the nearest English sound, `ex` example words. These become review cards like any other,
 * so letter–sound links keep coming back until they stick.
 */
export const u00 = unit(
  0,
  'A1',
  'Alphabet & phonics',
  'Alfabet i wymowa',
  'Polish spelling is regular: learn which letters make which sounds and you can read any word aloud. Start here if the letters look like a puzzle.',
  [
    lesson(
      'u00-l1',
      'Seven vowels',
      'Every Polish vowel has one short, pure sound.',
      {
        phonics: true,
        items: [
          ['a', 'a in "father", but short', { key: 'a', ex: ['tak', 'mama', 'kawa'], hint: 'Mouth open. Never the "ay" of "cake".' }],
          ['e', 'e in "bed"', { key: 'e', ex: ['ser', 'jest', 'teraz'], hint: 'Never silent, even at the end of a word: {proste} ends in a clear e.' }],
          ['i', 'ee in "see", but short', { key: 'i', ex: ['pić', 'kino', 'ile'] }],
          ['o', 'o in "hot"', { key: 'o', ex: ['dom', 'kot', 'okno'], hint: 'Never the "oh" of "go".' }],
          ['u', 'oo in "book"', { key: 'u', ex: ['tu', 'zupa', 'ul'] }],
          ['ó', 'the same as u', { key: 'o-kreska', ex: ['mój', 'król', 'ósmy'], hint: 'ó and u sound identical. The spelling is history — learn it word by word.' }],
          ['y', 'i in "bit", said further back', { key: 'y', ex: ['ty', 'być', 'my'], hint: 'Always a vowel in Polish, never a consonant like "yes".' }],
        ],
        sentences: [],
        drills: [
          ['t___ (you)', 'Which vowel sounds like the i in "bit"?', ['y', 'i', 'e'], 'y'],
          ['k___t (cat)', 'Which vowel sounds like the o in "hot"?', ['o', 'u', 'ó'], 'o'],
          ['m___j (my)', 'This "oo" sound is spelt with an accent here.', ['ó', 'u', 'o'], 'ó', 'ó and u sound the same; mój is always written with ó.'],
          ['s___r (cheese)', 'Which vowel sounds like the e in "bed"?', ['e', 'i', 'y'], 'e'],
        ],
        spotlight: {
          title: 'Short, pure, never silent',
          body: [
            'English vowels glide ("go" is really "go-oo"). Polish vowels hold one sound. Say each one short and steady.',
            'Every vowel is pronounced, so the number of vowels is the number of syllables: {ka-wa}, {ok-no}, {ki-no}.',
          ],
        },
      },
    ),
    lesson(
      'u00-l2',
      'Letters that surprise',
      'Familiar letters with different sounds: w, ł, j, c, ch and r.',
      {
        phonics: true,
        items: [
          ['w', 'v in "van"', { key: 'w', ex: ['woda', 'wino', 'Warszawa'], hint: 'Polish has no separate v. Every w is a v.' }],
          ['ł', 'w in "wet"', { key: 'l-kreska', ex: ['mały', 'szkoła', 'łódź'], hint: 'The line through the l turns it into an English w.' }],
          ['j', 'y in "yes"', { key: 'j', ex: ['ja', 'jajko', 'jest'], hint: 'Never the j of "jam".' }],
          ['c', 'ts in "cats"', { key: 'c', ex: ['noc', 'co', 'ulica'], hint: 'Always "ts" — never k, never s.' }],
          ['ch / h', 'ch in Scottish "loch"', { key: 'ch', ex: ['chleb', 'herbata', 'ucho'], hint: 'ch and h are the same sound: a breathy k.' }],
          ['r', 'a rolled or tapped r', { key: 'r', ex: ['rok', 'ser', 'rower'], hint: 'Tap the tongue behind your top teeth, like a Scottish r.' }],
        ],
        sentences: [],
        drills: [
          ['___oda (water)', 'Which letter makes the English "v" sound?', ['w', 'v', 'f'], 'w'],
          ['ma___y (small)', 'Which letter sounds like English "w"?', ['ł', 'l', 'w'], 'ł'],
          ['no___ (night)', 'Which letter says "ts"?', ['c', 'ts', 'k'], 'c'],
          ['___a (I)', 'Which letter sounds like the y in "yes"?', ['j', 'y', 'i'], 'j'],
        ],
        spotlight: {
          title: 'Unlearn four English habits',
          body: [
            'Read **w** as v, **ł** as w, **j** as y and **c** as ts. That single swap makes most words readable.',
            'So {woda} is "VO-da", {mały} is "MA-wi", {jajko} is "YAY-ko" and {noc} is "nots".',
          ],
        },
      },
    ),
    lesson(
      'u00-l3',
      'Two letters, one sound',
      'Read sz, cz, rz, ż, dż and dz.',
      {
        phonics: true,
        items: [
          ['sz', 'sh in "shop"', { key: 'sz', ex: ['szkoła', 'kasza', 'szafa'], hint: 'Tongue tip up, lips slightly rounded.' }],
          ['cz', 'ch in "church"', { key: 'cz', ex: ['czas', 'czy', 'oczy'] }],
          ['rz', 's in "pleasure"', { key: 'rz', ex: ['rzeka', 'morze', 'rzecz'], hint: 'Not an r at all. After p, t, k or ch it turns into "sh": {przez} is "pshes".' }],
          ['ż', 's in "pleasure" — same as rz', { key: 'z-kropka', ex: ['żaba', 'może', 'żona'], hint: 'rz and ż are one sound written two ways.' }],
          ['dż', 'j in "jam"', { key: 'dz-kropka', ex: ['dżem', 'dżungla', 'dżinsy'] }],
          ['dz', 'ds in "roads"', { key: 'dz', ex: ['dzwon', 'bardzo', 'dzban'] }],
        ],
        sentences: [],
        drills: [
          ['___koła (school)', 'Which spelling makes the "sh" sound?', ['sz', 'cz', 'ś'], 'sz'],
          ['___as (time)', 'Which spelling makes the "ch" in "church"?', ['cz', 'ch', 'sz'], 'cz', 'ch is the throaty "loch" sound; cz is "church".'],
          ['mo___e (sea)', 'Two spellings make this sound. Which one is in "morze"?', ['rz', 'ż', 'sz'], 'rz', 'morze (sea) and może (maybe) sound identical. Only the spelling differs.'],
          ['mo___e (maybe)', 'And in "może"?', ['ż', 'rz', 'sz'], 'ż'],
        ],
        spotlight: {
          title: 'Pairs of letters that work as one',
          body: [
            'Treat each pair as a single letter. {szkoła} has just five sounds: sz-k-o-ł-a.',
            'Polish can stack them: {szcz} is "shch", as in {szczęście} (happiness) — say "fresh cheese" quickly.',
          ],
        },
      },
    ),
    lesson(
      'u00-l4',
      'The soft family',
      'Make the sounds English lacks: ś, ć, ź, dź and ń.',
      {
        phonics: true,
        items: [
          ['ś / si', 'a soft "sh", said smiling', { key: 's-soft', ex: ['coś', 'siedem', 'Kasia'], hint: 'Tongue tip down behind the lower teeth, middle of the tongue up.' }],
          ['ć / ci', 'a soft "ch", said smiling', { key: 'c-soft', ex: ['pić', 'ciocia', 'cicho'], hint: 'Softer and higher than cz. Think "cheese" with a wide smile.' }],
          ['ź / zi', 'a soft "zh"', { key: 'z-soft', ex: ['źle', 'zima', 'ziemia'] }],
          ['dź / dzi', 'a soft "j", as in "jeep"', { key: 'dz-soft', ex: ['dzień', 'dziecko', 'dźwięk'] }],
          ['ń / ni', 'ny in "canyon"', { key: 'n-soft', ex: ['koń', 'nie', 'niebo'] }],
        ],
        sentences: [],
        drills: [
          ['Ka___a', 'Kasia has a soft sound. How is it spelt before a vowel?', ['si', 'sz', 's'], 'si', 'Before a vowel, the soft sounds are written with i: si, ci, zi, dzi, ni.'],
          ['___ocia (aunt)', 'Soft "ch" before a vowel is written…', ['ci', 'cz', 'ć'], 'ci'],
          ['ko___ (horse)', 'Soft n at the end of a word is written…', ['ń', 'ni', 'n'], 'ń', 'Without a following vowel, softness is shown with an accent: ś, ć, ź, dź, ń.'],
          ['wie___ (village)', 'Soft "sh" at the end of a word is written…', ['ś', 'sz', 'si'], 'ś'],
        ],
        spotlight: {
          title: 'One sound, two spellings',
          body: [
            'The soft sounds are written with an accent (**ś ć ź dź ń**) when no vowel follows, and with **i** (**si ci zi dzi ni**) when a vowel does.',
            'In that case the i is not a separate vowel: {Kasia} is two syllables, "KA-sha".',
            'Hear the difference: {kasza} (buckwheat, hard sz) and {Kasia} (a name, soft si).',
          ],
          table: {
            head: ['Sound', 'At the end', 'Before a vowel'],
            rows: [
              ['soft sh', 'ś', 'si'],
              ['soft ch', 'ć', 'ci'],
              ['soft zh', 'ź', 'zi'],
              ['soft j', 'dź', 'dzi'],
              ['ny', 'ń', 'ni'],
            ],
          },
        },
      },
    ),
    lesson(
      'u00-l5',
      'Nasal vowels',
      'Say ą and ę, and know when they change.',
      {
        phonics: true,
        items: [
          ['ą', '"on", nasal, like French "bon"', { key: 'a-ogonek', ex: ['są', 'mąż', 'idą'] }],
          ['ę', '"en", nasal', { key: 'e-ogonek', ex: ['ręka', 'mięso', 'język'] }],
          ['-ę at the end', 'a plain e', { key: 'e-end', ex: ['się', 'proszę', 'dziękuję'], hint: 'In everyday speech a final ę loses its nasal sound.' }],
          ['ą / ę + p, b', '"om" / "em"', { key: 'nasal-m', ex: ['ząb', 'zęby', 'kąpiel'] }],
          ['ą / ę + t, d, k', '"on" / "en" / "eng"', { key: 'nasal-n', ex: ['kąt', 'będę', 'ręka'] }],
        ],
        sentences: [],
        drills: [
          ['r___ka (hand)', 'Which nasal vowel?', ['ę', 'ą', 'e'], 'ę'],
          ['s___ (they are)', 'Which nasal vowel?', ['ą', 'ę', 'o'], 'ą'],
          ['dzięku___ (thank you)', 'At the end, this sounds like a plain e. How is it spelt?', ['ję', 'je', 'ją'], 'ję', 'dziękuję ends in ę, but you say "-ye".'],
        ],
        spotlight: {
          title: 'Nasal vowels change with their neighbours',
          body: [
            'The little hook (**ogonek**, "tail") makes a vowel nasal. What you actually say depends on the next letter.',
            'Before p or b you hear an m: {ząb} ("zomp"). Before t, d or k you hear an n: {ręka} ("RENG-ka"). At the end of a word, ę is just e: {proszę} ("PRO-she").',
          ],
        },
      },
    ),
    lesson(
      'u00-l6',
      'Reading rules',
      'Clusters, final devoicing and where the stress goes.',
      {
        phonics: true,
        items: [
          ['szcz', 'shch, as in "fresh cheese"', { key: 'szcz', ex: ['szczęście', 'deszcz', 'szczur'] }],
          ['prz', 'psh', { key: 'prz', ex: ['przepraszam', 'przez', 'przed'], hint: 'rz after p, t, k or ch is said as "sh".' }],
          ['trz', 'tsh', { key: 'trz', ex: ['trzy', 'patrzeć', 'trzeba'] }],
          ['chrz', 'khsh', { key: 'chrz', ex: ['chrząszcz', 'chrzan'], hint: 'The famous beetle: {chrząszcz}. Take it slowly.' }],
          ['b → p at the end', 'final consonants lose their voice', { key: 'devoicing', ex: ['chleb', 'ząb', 'Kraków'], hint: 'b, d, g, w, z, ż at the end of a word sound like p, t, k, f, s, sz.' }],
          ['WO-da', 'stress the second-to-last syllable', { key: 'stress', ex: ['woda', 'dziękuję', 'telewizor'], hint: 'Almost every Polish word is stressed on its second-to-last syllable.' }],
        ],
        sentences: [],
        drills: [
          ['t___y (three)', 'Which spelling gives "tsh-" here?', ['rz', 'sz', 'ż'], 'rz', 'trzy is written with rz, but after t it sounds like sh.'],
          ['___ęście (happiness)', 'Which cluster says "shch"?', ['szcz', 'sch', 'ść'], 'szcz'],
          ['chle___ (bread)', 'It sounds like "khlep". How is the last letter spelt?', ['b', 'p'], 'b', 'Final consonants lose their voice: chleb is spelt with b but said with p.'],
        ],
        spotlight: {
          title: 'Three rules that fix most mistakes',
          body: [
            '**Stress** falls on the second-to-last syllable: {POL-ska}, {War-SZA-wa}, {dzię-KU-ję}.',
            '**Final devoicing**: at the end of a word, voiced consonants go voiceless. {Kraków} ends in "f".',
            '**rz after p, t, k, ch** is "sh": {przepraszam} is "pshe-PRA-sham".',
          ],
        },
      },
    ),
  ],
);

/** Survival phrases, grouped by situation. Formal "pan / pani" versions where it matters. */

export interface PhraseGroup {
  id: string;
  title: string;
  titlePl: string;
  phrases: Array<[pl: string, en: string]>;
}

export const PHRASEBOOK: PhraseGroup[] = [
  {
    id: 'basics',
    title: 'Essentials',
    titlePl: 'Podstawy',
    phrases: [
      ['Dzień dobry.', 'Hello. (formal, until evening)'],
      ['Cześć!', 'Hi! / Bye! (informal)'],
      ['Proszę.', 'Please. / Here you are.'],
      ['Dziękuję.', 'Thank you.'],
      ['Przepraszam.', 'Sorry. / Excuse me.'],
      ['Nie rozumiem.', "I don't understand."],
      ['Czy mówi pan po angielsku?', 'Do you speak English? (to a man)'],
      ['Czy mówi pani po angielsku?', 'Do you speak English? (to a woman)'],
      ['Proszę mówić wolniej.', 'Please speak more slowly.'],
      ['Jak to się mówi po polsku?', 'How do you say that in Polish?'],
      ['Nie wiem.', "I don't know."],
    ],
  },
  {
    id: 'cafe',
    title: 'Café & shop',
    titlePl: 'Kawiarnia i sklep',
    phrases: [
      ['Poproszę kawę z mlekiem.', 'A coffee with milk, please.'],
      ['Ile to kosztuje?', 'How much is it?'],
      ['Czy mogę zapłacić kartą?', 'Can I pay by card?'],
      ['Na miejscu czy na wynos?', 'To have in or take away?'],
      ['Czy jest coś wegetariańskiego?', 'Is there anything vegetarian?'],
      ['Poproszę rachunek.', 'The bill, please.'],
      ['Reszty nie trzeba.', 'Keep the change.'],
      ['Smacznego!', 'Enjoy your meal!'],
    ],
  },
  {
    id: 'travel',
    title: 'Getting around',
    titlePl: 'W podróży',
    phrases: [
      ['Gdzie jest dworzec?', 'Where is the station?'],
      ['Jak dojść do centrum?', 'How do I get to the centre (on foot)?'],
      ['Poproszę bilet do Krakowa.', 'A ticket to Kraków, please.'],
      ['Czy ten autobus jedzie do centrum?', 'Does this bus go to the centre?'],
      ['Gdzie jest przystanek?', "Where's the stop?"],
      ['Proszę iść prosto, potem w lewo.', 'Go straight on, then left.'],
      ['Czy to daleko?', 'Is it far?'],
    ],
  },
  {
    id: 'help',
    title: 'Emergencies',
    titlePl: 'Pomoc',
    phrases: [
      ['Pomocy!', 'Help!'],
      ['Proszę wezwać karetkę.', 'Please call an ambulance.'],
      ['Proszę zadzwonić na policję.', 'Please call the police.'],
      ['Źle się czuję.', 'I feel unwell.'],
      ['Gdzie jest apteka?', "Where's the chemist's?"],
      ['Zgubiłem się.', "I'm lost. (a man)"],
      ['Zgubiłam się.', "I'm lost. (a woman)"],
      ['Numer alarmowy to sto dwanaście.', 'The emergency number is 112.'],
    ],
  },
  {
    id: 'people',
    title: 'Small talk',
    titlePl: 'Rozmowa',
    phrases: [
      ['Jak się masz?', 'How are you? (informal)'],
      ['Skąd jesteś?', 'Where are you from?'],
      ['Jestem z Anglii.', "I'm from England."],
      ['Uczę się polskiego.', "I'm learning Polish."],
      ['Miło cię poznać.', 'Nice to meet you.'],
      ['Na zdrowie!', 'Cheers! / Bless you!'],
      ['Wszystkiego najlepszego!', 'All the best! / Happy birthday!'],
      ['Do zobaczenia!', 'See you!'],
    ],
  },
  {
    id: 'home',
    title: 'Work & family',
    titlePl: 'Praca i dom',
    phrases: [
      ['Dzień dobry wszystkim!', 'Good morning, everyone!'],
      ['Jak minął weekend?', 'How was the weekend?'],
      ['Miłego dnia!', 'Have a nice day!'],
      ['Do jutra!', 'See you tomorrow!'],
      ['Smacznego, mamo!', 'Enjoy your meal, Mum!'],
      ['Kocham cię.', 'I love you.'],
      ['Dobranoc.', 'Good night.'],
    ],
  },
];

import { CHUNKS } from '../content/chunks';
import { cardIdsForWord, LESSONS, UNITS } from '../content/course';
import { FREQUENCY } from '../content/frequency';
import { PICTURES } from '../content/pictures';
import type { Level } from '../content/types';
import type { ProgressState } from './engine';
import { addDays } from './progress';

/**
 * Badges for milestones, for learners with an account. Each is worked out from the progress the account already
 * stores (lessons, review cards, daily activity), so it can't drift from what the learner has actually done; the
 * only thing saved is when the learner was first told about it (settings.badges).
 */

/** Colours from the Łowicz palette in styles.css, one per kind of badge. */
export type BadgeTone = 'czerwien' | 'zielen' | 'zolc' | 'blekit' | 'pomarancz' | 'amarant';

export interface BadgeStats {
  lessons: number;
  /** Lessons with a best score of 100%. */
  perfect: number;
  /** Lessons finished at each level (A0 is the alphabet unit). */
  levels: Record<Level | 'A0', number>;
  /** Longest run of consecutive days with practice. */
  bestStreak: number;
  reviews: number;
  xp: number;
  cards: number;
  /** Of the 500 most frequent words, those in the review deck. */
  words: number;
  pictures: number;
  phrases: number;
}

export interface Badge {
  id: string;
  /** Polish name, shown large. */
  pl: string;
  en: string;
  /** What earns it. */
  how: string;
  /** A few characters on the medal. */
  mark: string;
  tone: BadgeTone;
  target: number;
  /** Progress towards the target. */
  value: (s: BadgeStats) => number;
  /** How to show progress: "7 of 10 lessons". */
  unit: string;
}

const levelTotal = (level: Level | 'A0') =>
  UNITS.filter((u) => (level === 'A0' ? u.n === 0 : u.level === level && u.n > 0)).reduce((n, u) => n + u.lessons.length, 0);

const TOTAL = LESSONS.length;

export const BADGES: Badge[] = [
  { id: 'first-lesson', pl: 'Pierwszy krok', en: 'First step', how: 'Finish your first lesson.', mark: '1', tone: 'czerwien', target: 1, value: (s) => s.lessons, unit: 'lesson' },
  { id: 'lessons-10', pl: 'Dziesiątka', en: 'Ten lessons', how: 'Finish 10 lessons.', mark: '10', tone: 'czerwien', target: 10, value: (s) => s.lessons, unit: 'lessons' },
  { id: 'lessons-25', pl: 'Na dobrej drodze', en: 'On the right track', how: 'Finish 25 lessons.', mark: '25', tone: 'czerwien', target: 25, value: (s) => s.lessons, unit: 'lessons' },
  { id: 'halfway', pl: 'Półmetek', en: 'Halfway', how: 'Finish half the course.', mark: '½', tone: 'czerwien', target: Math.ceil(TOTAL / 2), value: (s) => s.lessons, unit: 'lessons' },
  { id: 'all-lessons', pl: 'Cała wycinanka', en: 'The whole rosette', how: 'Finish every lesson in the course.', mark: '★', tone: 'czerwien', target: TOTAL, value: (s) => s.lessons, unit: 'lessons' },

  { id: 'alphabet', pl: 'Alfabet', en: 'Letters and sounds', how: 'Finish the alphabet and phonics unit.', mark: 'Ą', tone: 'zolc', target: levelTotal('A0'), value: (s) => s.levels.A0, unit: 'lessons' },
  { id: 'level-a1', pl: 'Poziom A1', en: 'Beginner', how: 'Finish every A1 lesson.', mark: 'A1', tone: 'zolc', target: levelTotal('A1'), value: (s) => s.levels.A1, unit: 'lessons' },
  { id: 'level-a2', pl: 'Poziom A2', en: 'Elementary', how: 'Finish every A2 lesson.', mark: 'A2', tone: 'zolc', target: levelTotal('A2'), value: (s) => s.levels.A2, unit: 'lessons' },
  { id: 'level-b1', pl: 'Poziom B1', en: 'Intermediate', how: 'Finish every B1 lesson.', mark: 'B1', tone: 'zolc', target: levelTotal('B1'), value: (s) => s.levels.B1, unit: 'lessons' },

  { id: 'perfect', pl: 'Bez błędu', en: 'Flawless', how: 'Score 100% in a lesson.', mark: '100', tone: 'zielen', target: 1, value: (s) => s.perfect, unit: 'perfect lesson' },
  { id: 'perfect-10', pl: 'Perfekcjonista', en: 'Perfectionist', how: 'Score 100% in 10 lessons.', mark: '10×', tone: 'zielen', target: 10, value: (s) => s.perfect, unit: 'perfect lessons' },

  { id: 'streak-3', pl: 'Trzy dni', en: 'Three in a row', how: 'Practise three days in a row.', mark: '3', tone: 'pomarancz', target: 3, value: (s) => s.bestStreak, unit: 'days' },
  { id: 'streak-7', pl: 'Tydzień', en: 'A whole week', how: 'Practise seven days in a row.', mark: '7', tone: 'pomarancz', target: 7, value: (s) => s.bestStreak, unit: 'days' },
  { id: 'streak-30', pl: 'Miesiąc', en: 'A whole month', how: 'Practise 30 days in a row.', mark: '30', tone: 'pomarancz', target: 30, value: (s) => s.bestStreak, unit: 'days' },
  { id: 'streak-100', pl: 'Sto dni', en: 'A hundred days', how: 'Practise 100 days in a row.', mark: '100', tone: 'pomarancz', target: 100, value: (s) => s.bestStreak, unit: 'days' },

  { id: 'reviews-100', pl: 'Powtórka', en: 'Reviewer', how: 'Answer 100 review questions.', mark: '↻', tone: 'blekit', target: 100, value: (s) => s.reviews, unit: 'reviews' },
  { id: 'reviews-1000', pl: 'Mistrz powtórek', en: 'Master of review', how: 'Answer 1,000 review questions.', mark: '1k', tone: 'blekit', target: 1000, value: (s) => s.reviews, unit: 'reviews' },
  { id: 'xp-1000', pl: 'Tysiąc punktów', en: '1,000 XP', how: 'Earn 1,000 XP.', mark: 'XP', tone: 'blekit', target: 1000, value: (s) => s.xp, unit: 'XP' },

  { id: 'cards-250', pl: 'Kolekcjoner', en: 'Collector', how: 'Have 250 cards in your review deck.', mark: '250', tone: 'amarant', target: 250, value: (s) => s.cards, unit: 'cards' },
  { id: 'cards-1000', pl: 'Tysiąc kart', en: 'A thousand cards', how: 'Have 1,000 cards in your review deck.', mark: '1k', tone: 'amarant', target: 1000, value: (s) => s.cards, unit: 'cards' },
  { id: 'words-100', pl: 'Sto słów', en: 'A hundred words', how: 'Learn 100 of the 500 most frequent words.', mark: 'Aa', tone: 'amarant', target: 100, value: (s) => s.words, unit: 'words' },
  { id: 'words-500', pl: 'Pięćset słów', en: 'All 500 words', how: 'Learn all of the 500 most frequent words.', mark: '500', tone: 'amarant', target: FREQUENCY.length, value: (s) => s.words, unit: 'words' },
  { id: 'pictures', pl: 'Obrazki', en: 'Picture perfect', how: 'Learn every picture flashcard.', mark: '◉', tone: 'amarant', target: PICTURES.length, value: (s) => s.pictures, unit: 'pictures' },
  { id: 'phrases', pl: 'Zwroty', en: 'Phrasebook', how: 'Learn every everyday phrase.', mark: '„”', tone: 'amarant', target: CHUNKS.length, value: (s) => s.phrases, unit: 'phrases' },
];

const LEVEL_OF = new Map<string, Level | 'A0'>(UNITS.flatMap((u) => u.lessons.map((l) => [l.id, u.n === 0 ? 'A0' : u.level] as const)));
/**
 * Each of the 500 words with every card id it may have been learnt under: its own, and the lesson card that
 * teaches the same word where there is one. Nearly a third of the list is also taught in a lesson, and the
 * frequency deck doesn't teach those a second time, so counting only its own ids would leave "all 500 words"
 * out of anyone's reach.
 */
const WORD_CARDS = FREQUENCY.map((w) => cardIdsForWord(w));
const PICTURE_IDS = new Set(PICTURES.map((p) => p.id));
const PHRASE_IDS = new Set(CHUNKS.map((c) => c.id));

/** The longest run of consecutive practice days. */
export function bestStreak(days: Iterable<string>): number {
  const set = new Set(days);
  let best = 0;
  for (const day of set) {
    // Count only from the first day of a run.
    if (set.has(addDays(day, -1))) continue;
    let n = 1;
    while (set.has(addDays(day, n))) n++;
    best = Math.max(best, n);
  }
  return best;
}

export function badgeStats(p: ProgressState): BadgeStats {
  const levels: BadgeStats['levels'] = { A0: 0, A1: 0, A2: 0, B1: 0 };
  let perfect = 0;
  for (const [id, rec] of p.lessons) {
    const level = LEVEL_OF.get(id);
    if (!level) continue;
    levels[level]++;
    if (rec.best >= 100) perfect++;
  }
  let pictures = 0;
  let phrases = 0;
  for (const id of p.cards.keys()) {
    if (PICTURE_IDS.has(id)) pictures++;
    else if (PHRASE_IDS.has(id)) phrases++;
  }
  // One word counts once, whichever of its cards is in the deck.
  const words = WORD_CARDS.filter((ids) => ids.some((id) => p.cards.has(id))).length;
  let reviews = 0;
  let xp = 0;
  for (const d of p.activity.values()) {
    reviews += d.reviews;
    xp += d.xp;
  }
  const active = [...p.activity.entries()].filter(([, d]) => d.xp > 0).map(([day]) => day);
  return {
    lessons: [...p.lessons.keys()].filter((id) => LEVEL_OF.has(id)).length,
    perfect,
    levels,
    bestStreak: bestStreak(active),
    reviews,
    xp,
    cards: p.cards.size,
    words,
    pictures,
    phrases,
  };
}

export interface BadgeState {
  badge: Badge;
  value: number;
  earned: boolean;
}

/** Every badge with the learner's progress towards it, in the order they are listed. */
export function badgeStates(p: ProgressState): BadgeState[] {
  const s = badgeStats(p);
  return BADGES.map((badge) => {
    const value = Math.min(badge.value(s), badge.target);
    return { badge, value, earned: value >= badge.target };
  });
}

export const earnedBadges = (p: ProgressState) => badgeStates(p).filter((b) => b.earned).map((b) => b.badge.id);
export const getBadge = (id: string) => BADGES.find((b) => b.id === id);

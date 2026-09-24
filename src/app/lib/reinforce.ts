import { getUnitOfLesson, lessonOfCard, UNITS } from '../../content/course';
import { getLesson } from '../../content/course';
import { getSkill, skillOfLesson, SKILLS, type Skill } from '../../content/skills';
import type { Spotlight } from '../../content/types';
import type { ProgressState } from '../../shared/engine';
import { retrievability, type Card } from '../../shared/fsrs';

/**
 * Decides what to bring back: the cards and skills a learner struggles with most.
 * Struggle is measured from the scheduler's own memory model — lapses (times forgotten),
 * difficulty (raised by every miss, including first attempts in lessons) and current recall odds.
 */

const DAY = 86_400_000;

/** Higher = shakier. */
export function struggle(card: Card, now = Date.now()): number {
  const r = card.last ? retrievability((now - card.last) / DAY, card.stability) : 1;
  return card.lapses * 2 + Math.max(0, card.difficulty - 5) + (1 - r) * 2;
}

export function weakest(p: ProgressState, ids: Iterable<string>, n: number, now = Date.now()): Array<{ id: string; reps: number }> {
  return [...ids]
    .flatMap((id) => {
      const c = p.cards.get(id);
      return c ? [{ id, reps: c.reps, s: struggle(c, now) }] : [];
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(({ id, reps }) => ({ id, reps }));
}

export interface TroubleSpot {
  skill: Skill;
  /** Average struggle across the skill's cards in the deck. */
  score: number;
  cardIds: string[];
  /** Cards forgotten at least once. */
  lapses: number;
}

/** Skills ranked by how much trouble the learner has had with them. Needs a few cards to judge. */
export function troubleSpots(p: ProgressState, now = Date.now()): TroubleSpot[] {
  const bySkill = new Map<string, { total: number; ids: string[]; lapses: number }>();
  for (const [id, card] of p.cards) {
    const lesson = lessonOfCard(id);
    const skill = lesson && skillOfLesson(lesson.id);
    if (!skill) continue;
    const entry = bySkill.get(skill) ?? { total: 0, ids: [], lapses: 0 };
    entry.total += struggle(card, now);
    entry.ids.push(id);
    entry.lapses += card.lapses;
    bySkill.set(skill, entry);
  }
  return [...bySkill.entries()]
    .filter(([, e]) => e.ids.length >= 4)
    .map(([id, e]) => ({ skill: getSkill(id)!, score: e.total / e.ids.length, cardIds: e.ids, lapses: e.lapses }))
    .filter((t) => t.score >= 1.2 || t.lapses > 0)
    .sort((a, b) => b.score - a.score);
}

/** Cards forgotten twice or more: the words that will not stick. */
export function trickyCards(p: ProgressState): string[] {
  return [...p.cards.entries()]
    .filter(([, c]) => c.lapses >= 2)
    .sort((a, b) => b[1].lapses - a[1].lapses)
    .map(([id]) => id);
}

/** Three cards from earlier lessons to open a new lesson with: due ones first, then the shakiest. */
export function warmupCards(p: ProgressState, lessonId: string, n = 3, now = Date.now()): Array<{ id: string; reps: number }> {
  const others = [...p.cards.keys()].filter((id) => !id.startsWith(`${lessonId}:`) && lessonOfCard(id));
  const due = others.filter((id) => p.cards.get(id)!.due <= now);
  const picked = weakest(p, due, n, now);
  if (picked.length < n) {
    const rest = others.filter((id) => !picked.some((x) => x.id === id));
    picked.push(...weakest(p, rest, n - picked.length, now));
  }
  return picked;
}

/**
 * How much a card deserves revisiting. Mistakes dominate: every lapse (a review forgotten) and every miss
 * in a lesson (which raises difficulty) add weight, and fading memory adds a little more. A card never
 * answered wrongly still has a small chance, so revision isn't only ever about mistakes.
 */
export function revisionWeight(card: Card, now = Date.now()): number {
  const r = card.last ? retrievability((now - card.last) / DAY, card.stability) : 1;
  return 1 + card.lapses * 4 + Math.max(0, card.difficulty - 5) * 2 + (1 - r) * 3 + (card.due <= now ? 1 : 0);
}

/**
 * Cards from earlier lessons to revise part-way through a lesson: a weighted random sample (without
 * replacement), so each lesson brings something different but skews heavily towards wrong answers.
 */
export function revisionCards(
  p: ProgressState,
  lessonId: string,
  n: number,
  exclude: Iterable<string> = [],
  now = Date.now(),
  rand = Math.random,
): Array<{ id: string; reps: number }> {
  const skip = new Set(exclude);
  return [...p.cards.entries()]
    .filter(([id]) => !skip.has(id) && !id.startsWith(`${lessonId}:`) && lessonOfCard(id))
    // Efraimidis–Spirakis: key = u^(1/w); the n largest keys are a weighted sample.
    .map(([id, c]) => ({ id, reps: c.reps, key: Math.pow(rand(), 1 / revisionWeight(c, now)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map(({ id, reps }) => ({ id, reps }));
}

/** Spreads `extra` exercises evenly through `main`, never before `from` (the lesson's introduction). */
export function sprinkle<T>(main: T[], extra: T[], from: number, until = main.length): T[] {
  if (!extra.length) return main;
  const out = main.slice(0, from);
  const body = main.slice(from, until);
  const gap = body.length / (extra.length + 1);
  let k = 0;
  body.forEach((e, i) => {
    out.push(e);
    while (k < extra.length && i + 1 >= Math.round(gap * (k + 1))) out.push(extra[k++]);
  });
  out.push(...extra.slice(k), ...main.slice(until));
  return out;
}

/** The grammar spotlights that explain a skill, so practice starts with the rule. */
export function skillSpotlights(skillId: string): Spotlight[] {
  const skill = getSkill(skillId);
  if (!skill) return [];
  return UNITS.flatMap((u) => u.lessons)
    .filter((l) => skillOfLesson(l.id) === skillId && l.spotlight)
    .map((l) => l.spotlight!);
}

/** Cards from a unit already in the deck. */
export function unitCardIds(p: ProgressState, unitId: string): string[] {
  return [...p.cards.keys()].filter((id) => {
    const l = lessonOfCard(id);
    return l && getUnitOfLesson(l.id)?.id === unitId;
  });
}

export const skillList = SKILLS;
export const lessonTitle = (id: string) => getLesson(id)?.title ?? '';

/**
 * Whether an answer came promptly or after a struggle.
 *
 * Recalling a word slowly is not the same as knowing it. Two learners who both answer correctly, one at once and
 * one after ten seconds of hunting, do not have the same memory of the word, and the one who hunted will need it
 * back sooner. A hesitant right answer is therefore rated "Hard" rather than "Good", which shortens the next gap
 * without ever marking the answer wrong.
 *
 * The allowances below are deliberately generous. Getting this wrong in the strict direction would shorten
 * intervals for people who simply read carefully, type on a phone, or were interrupted, so the rule only fires
 * on a clear struggle — and an answer that took minutes is treated as an interruption, not as hesitation.
 */

export interface PaceInput {
  /** How the answer was given: tapped from a list, typed out, or put together from tiles. */
  how: 'pick' | 'type' | 'build';
  /** Characters to type, or to read in the prompt. */
  length: number;
  /** How many options there were to read through. */
  options?: number;
  /** Something had to be listened to first, perhaps more than once. */
  audio?: boolean;
}

/** Longer than this and the learner was interrupted rather than hesitating, so nothing is concluded. */
export const AWAY_MS = 120_000;

/** How long a confident answer may take, in milliseconds. */
export function budgetMs({ how, length, options = 0, audio = false }: PaceInput): number {
  const read = 25 * Math.min(length, 80);
  const base =
    how === 'type'
      ? 5_000 + 500 * Math.min(length, 60)
      : how === 'build'
        ? 4_000 + 1_200 * Math.max(1, options)
        : 3_000 + 900 * options + read;
  // Listening takes as long as the recording, and it can be played again.
  return base + (audio ? 2_000 + 2 * read : 0);
}

/** Whether a correct answer took long enough to count as a struggle rather than recall. */
export function answeredSlowly(input: PaceInput, ms: number): boolean {
  return ms > budgetMs(input) && ms < AWAY_MS;
}

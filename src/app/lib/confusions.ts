import { normalise } from '../../shared/grade';

/**
 * The wrong answers this learner has actually chosen, kept on the device.
 *
 * A wrong answer someone picked once is the best wrong answer to offer again: it names a confusion they really
 * have, rather than one the content guessed at. Offering it back until they stop choosing it turns a mistake
 * into the thing being practised.
 *
 * Nothing here leaves the device, nothing is sent with progress, and a missing or full storage just means the
 * app picks wrong answers the way it would without any history. It is kept per device rather than per learner:
 * two people sharing a phone steer each other's wrong answers a little, which costs nothing, since this only
 * ever decides which words are offered to rule out.
 */

const KEY = 'wycinanka:confusions';
/** Wrong answers remembered per card, newest first. */
const PER_CARD = 3;
/** Cards remembered at all, so storage can't grow without limit. */
const MAX_CARDS = 400;

type Store = Record<string, string[]>;

let cache: Store | undefined;

function read(): Store {
  if (cache) return cache;
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    cache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Store) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(s: Store) {
  cache = s;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Full or unavailable: the history lives for this visit only.
  }
}

/** Remember that this wrong answer was chosen for this card. */
export function noteConfusion(cardId: string, chosen: string): void {
  const text = chosen.trim();
  if (!cardId || !text) return;
  const s = { ...read() };
  const kept = [text, ...(s[cardId] ?? []).filter((x) => normalise(x) !== normalise(text))].slice(0, PER_CARD);
  s[cardId] = kept;
  const ids = Object.keys(s);
  // Oldest entries go first: the most recently missed cards are the ones worth pressing on.
  if (ids.length > MAX_CARDS) for (const id of ids.slice(0, ids.length - MAX_CARDS)) delete s[id];
  write(s);
}

/** Wrong answers already chosen for this card, newest first. */
export const knownConfusions = (cardId: string): string[] => read()[cardId] ?? [];

/**
 * A bonus for a candidate this learner has fallen for before, so it comes back until it stops working — or
 * `undefined` when nothing is recorded for the card, which lets the caller skip the check altogether.
 */
export function confusionBonus(cardId: string): ((text: string) => number) | undefined {
  const seen = knownConfusions(cardId);
  if (!seen.length) return undefined;
  const keys = seen.map((x) => normalise(x));
  return (text) => {
    const at = keys.indexOf(normalise(text));
    return at < 0 ? 0 : 0.5 - at * 0.1;
  };
}

/** Testing only: forget everything remembered on this device. */
export function clearConfusions(): void {
  cache = {};
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

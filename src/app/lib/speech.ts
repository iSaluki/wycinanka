/**
 * Polish text-to-speech using the browser's built-in voices (free, no network).
 * Most desktop and mobile systems ship a pl-PL voice; when none exists, speak() is a no-op
 * and the UI shows spelling-based pronunciation guidance instead.
 */

let voice: SpeechSynthesisVoice | null = null;
let ready = false;
const listeners = new Set<() => void>();

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return;
  const voices = speechSynthesis.getVoices();
  const polish = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('pl'));
  // Prefer higher-quality network/"natural" voices where the platform offers them.
  voice = polish.find((v) => /natural|enhanced|premium|google/i.test(v.name)) ?? polish[0] ?? null;
  ready = true;
  listeners.forEach((l) => l());
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const speechSupported = () => typeof speechSynthesis !== 'undefined';
export const hasPolishVoice = () => voice !== null;
export const voicesReady = () => ready;

export function onVoicesChanged(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let rate = 0.9;
export const setSpeechRate = (r: number) => {
  rate = r;
};

/**
 * The part of a prompt that should be read aloud. English glosses in brackets, gaps, the slash between
 * spelling alternatives and a figure before "=" are for the eye only: a filled-in "woda (water)" is read
 * as "woda", and "20 = dwadzieścia" as "dwadzieścia".
 */
export function speakable(text: string): string {
  return text
    .replace(/^[^=]*=\s*/, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/_{2,}/g, '')
    .replace(/\s+\/\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/ ([.,!?])/g, '$1')
    .trim();
}

export function speak(text: string, opts: { slow?: boolean; onEnd?: () => void } = {}): void {
  text = speakable(text);
  if (!speechSupported() || !voice || !text) {
    opts.onEnd?.();
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = opts.slow ? Math.max(0.5, rate * 0.65) : rate;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  speechSynthesis.speak(u);
}

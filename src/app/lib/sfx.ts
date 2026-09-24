/**
 * Small feedback sounds, synthesised with Web Audio so there are no files to download: a soft rising chime
 * for a right answer, a low, muted two-note fall for a wrong one, and a short arpeggio when a lesson is
 * finished. Quiet by design, and off with a setting. Nothing plays where Web Audio is unavailable.
 */

let ctx: AudioContext | null = null;
let enabled = true;

export const setSoundEffects = (on: boolean) => {
  enabled = on;
};
export const soundEffectsOn = () => enabled;

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    // Browsers start the context suspended until the page has been touched; every call here follows a tap.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One soft note: a quick attack and an exponential fade, like a struck bell or a muted key. */
function note(c: AudioContext, out: AudioNode, freq: number, at: number, length: number, type: OscillatorType, level: number) {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(level, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(env).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

/** A gentle low-pass on the way out takes the edge off every sound. */
function output(c: AudioContext, cutoff: number): AudioNode {
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  filter.connect(c.destination);
  return filter;
}

function play(build: (c: AudioContext, out: AudioNode, t: number) => void, cutoff = 4000) {
  const c = audio();
  if (!c) return;
  try {
    build(c, output(c, cutoff), c.currentTime + 0.02);
  } catch {
    // A sound is never worth an error.
  }
}

/** Right: two quick rising notes (E5, then A5). */
export const playCorrect = () =>
  play((c, out, t) => {
    note(c, out, 659.25, t, 0.28, 'sine', 0.09);
    note(c, out, 880, t + 0.09, 0.42, 'sine', 0.09);
  });

/** Wrong: a soft, low falling pair, muffled so it never feels like a buzzer. */
export const playWrong = () =>
  play(
    (c, out, t) => {
      note(c, out, 311.13, t, 0.24, 'triangle', 0.08);
      note(c, out, 233.08, t + 0.12, 0.34, 'triangle', 0.08);
    },
    1200,
  );

/** Lesson finished: a light C major arpeggio, with a faint octave above each note for a bell-like shimmer. */
export const playFinished = () =>
  play((c, out, t) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const at = t + i * 0.1;
      const length = i === 3 ? 1.1 : 0.5;
      note(c, out, f, at, length, 'sine', 0.075);
      note(c, out, f * 2, at, length * 0.6, 'sine', 0.012);
    });
  });

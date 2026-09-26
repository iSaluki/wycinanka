import { api, ApiError } from './api';

/**
 * Listening to the learner speak Polish. Three ways, best first:
 *
 * 1. The browser's own speech recognition (Chrome, Edge, Safari): instant, with several guesses to compare.
 * 2. Record a short clip and have the Worker transcribe it with Whisper on Workers AI (Firefox and any browser
 *    without the first). Also keeps the clip, so learners can hear themselves.
 * 3. Neither: record (or just speak), then listen back next to the recorded voice and mark it yourself.
 *
 * Whichever fails for good (unsupported language, no network service, the day's allowance used up) is skipped
 * for the rest of the visit and the next one takes over.
 */

export type Engine = 'browser' | 'server' | 'self';

export type ListenError =
  /** The microphone permission was refused. */
  | 'denied'
  /** No microphone, or it's in use elsewhere. */
  | 'no-mic'
  /** Nothing that sounded like speech was heard. */
  | 'no-speech'
  /** Recognition isn't available (any more): the next engine takes over. */
  | 'unavailable'
  | 'aborted';

export type Heard =
  | { ok: true; alternatives: string[]; recording?: string }
  | { ok: false; error: ListenError; message?: string; recording?: string };

export interface Listening {
  done: Promise<Heard>;
  /** Stop listening and use what has been heard so far. */
  stop(): void;
  /** Stop and throw it away. */
  cancel(): void;
}

export interface ListenOptions {
  /** Input level, 0–1, while recording a clip (for the meter). */
  onLevel?: (level: number) => void;
  /** Words heard so far (browser recognition only). */
  onInterim?: (text: string) => void;
  /** Recording is over and the clip is being checked. */
  onChecking?: () => void;
}

/* ---------- What this browser can do ---------- */

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [i: number]: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [i: number]: RecognitionResult };
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

const recognitionCtor = (): RecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

type AudioContextCtor = typeof AudioContext;
const audioContextCtor = (): AudioContextCtor | undefined =>
  typeof window === 'undefined'
    ? undefined
    : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext);

/**
 * Whether this browser can record a clip as WAV. The microphone's samples are taken straight from Web Audio,
 * so nothing depends on MediaRecorder or on decoding its output (Safari on iPad records fragmented MP4 that
 * its own decodeAudioData often refuses, which used to leave iPad learners marking themselves).
 */
export const canRecord = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!audioContextCtor();

/**
 * iPhone and iPad. Safari there has a recogniser, but it goes through Siri's servers, often ends without a
 * word or refuses Polish, so these devices send a clip to the Worker first and keep the recogniser as a fallback.
 */
const appleTouch = () =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

const broken = new Set<Engine>();
const listeners = new Set<() => void>();
const markBroken = (e: Engine) => {
  broken.add(e);
  listeners.forEach((l) => l());
};

export function onEngineChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** How speech will be checked on this device right now. */
export function engine(): Engine {
  const browser = !!recognitionCtor() && !broken.has('browser');
  const server = canRecord() && !broken.has('server');
  if (browser && !(server && appleTouch())) return 'browser';
  if (server) return 'server';
  return 'self';
}

export const ENGINE_NOTE: Record<Engine, string> = {
  browser: "Your browser's speech recognition checks what you say. It's run by the browser maker (Chrome's sends audio to Google).",
  server: 'What you say is recorded and checked by the app’s speech recognition. Recordings are never stored.',
  self: "This browser can't check speech, so you'll say it, listen back and mark it yourself.",
};

/* ---------- Pausing speaking ---------- */

const PAUSE_KEY = 'wycinanka:speaking-paused-until';
/** "Can't speak now" leaves speaking out of lessons for this long. */
export const PAUSE_MS = 15 * 60_000;

export function pauseSpeaking(now = Date.now()) {
  try {
    localStorage.setItem(PAUSE_KEY, String(now + PAUSE_MS));
  } catch {
    // Private mode: the pause lasts for this lesson only.
  }
}

export function speakingPaused(now = Date.now()): boolean {
  try {
    return Number(localStorage.getItem(PAUSE_KEY) ?? 0) > now;
  } catch {
    return false;
  }
}

/* ---------- Listening ---------- */

export function listen(opts: ListenOptions = {}, use: Engine = engine()): Listening {
  if (use === 'browser') return withBrowser(opts);
  return withRecording(opts, use === 'server');
}

/** One result with several guesses, or (rarely) several results in a row: then their best guesses joined. */
const guesses = (finals: string[][]) => (finals.length === 1 ? finals[0] : [finals.map((a) => a[0]).join(' ')]);

/** Longest a browser recogniser may listen before it is asked to stop. */
const BROWSER_MAX_MS = 12_000;

function withBrowser(opts: ListenOptions): Listening {
  const Ctor = recognitionCtor()!;
  let settle: (h: Heard) => void = () => undefined;
  const done = new Promise<Heard>((r) => (settle = r));
  let finished = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const finish = (h: Heard) => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    settle(h);
  };
  let finals: string[][] = [];
  /** What was heard so far, final or not: some Android versions end without ever marking a result final. */
  let latest: string[] = [];
  let events = 0;
  let rec: Recognition;
  try {
    rec = new Ctor();
    rec.lang = 'pl-PL';
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.continuous = false;
  } catch {
    markBroken('browser');
    finish({ ok: false, error: 'unavailable' });
    return { done, stop: () => undefined, cancel: () => undefined };
  }
  rec.onresult = (e) => {
    events++;
    finals = [];
    let interim = '';
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      const alts = Array.from({ length: r.length }, (_, k) => r[k].transcript.trim()).filter(Boolean);
      if (r.isFinal) finals.push(alts);
      else interim += ` ${alts[0] ?? ''}`;
    }
    const sofar = [...finals.map((a) => a[0]), interim.trim()].join(' ').trim();
    // Android can also repeat earlier words in each new result ("dzień", "dzień dobry"): the last result on its
    // own is offered as a guess too, and scoring keeps whichever matches best.
    const last = e.results.length ? e.results[e.results.length - 1][0]?.transcript.trim() : '';
    if (sofar) latest = [...new Set([sofar, ...(last ? [last] : [])])];
    if (sofar) opts.onInterim?.(sofar);
  };
  const heardSoFar = (): Heard | null => {
    if (finals.length) return { ok: true, alternatives: [...new Set([...guesses(finals), ...latest])] };
    if (latest.length) return { ok: true, alternatives: latest };
    return null;
  };
  rec.onerror = (e) => {
    events++;
    switch (e.error) {
      case 'no-speech':
        return finish(heardSoFar() ?? { ok: false, error: 'no-speech' });
      case 'not-allowed':
        return finish({ ok: false, error: 'denied' });
      case 'audio-capture':
        return finish({ ok: false, error: 'no-mic' });
      case 'aborted':
        return finish(heardSoFar() ?? { ok: false, error: 'aborted' });
      default:
        // 'network', 'service-not-allowed', 'language-not-supported'…: this browser can't do it.
        markBroken('browser');
        return finish({ ok: false, error: 'unavailable', message: e.error });
    }
  };
  rec.onend = () => finish(heardSoFar() ?? { ok: false, error: 'no-speech' });
  try {
    rec.start();
  } catch {
    markBroken('browser');
    finish({ ok: false, error: 'unavailable' });
  }
  // A recogniser that never answers (no service behind it) mustn't leave the learner stuck: ask it to stop,
  // and if it still says nothing, move on to the next way of listening.
  watchdog = setTimeout(() => {
    try {
      rec.stop();
    } catch {
      // Already stopped.
    }
    watchdog = setTimeout(() => {
      const heard = heardSoFar();
      if (heard) return finish(heard);
      if (!events) markBroken('browser');
      finish({ ok: false, error: events ? 'no-speech' : 'unavailable' });
      try {
        rec.abort();
      } catch {
        // Already stopped.
      }
    }, 2_500);
  }, BROWSER_MAX_MS);
  return {
    done,
    stop: () => {
      try {
        rec.stop();
      } catch {
        // Already stopped.
      }
    },
    cancel: () => {
      finish({ ok: false, error: 'aborted' });
      try {
        rec.abort();
      } catch {
        // Already stopped.
      }
    },
  };
}

/** Longest clip: long enough for a tongue twister, short enough to send quickly. */
const MAX_MS = 9_000;
/** Give up if nothing is said for this long. */
const WAIT_MS = 6_000;
/** Stop this long after the learner stops speaking. */
const TRAILING_MS = 1_300;

function withRecording(opts: ListenOptions, transcribe: boolean): Listening {
  let settle: (h: Heard) => void = () => undefined;
  const done = new Promise<Heard>((r) => (settle = r));
  let state: 'starting' | 'recording' | 'stopping' | 'over' = 'starting';
  let cancelled = false;
  let stopNow: () => void = () => undefined;

  // Made now, while the tap that started this is still being handled: iOS keeps an audio context made later
  // suspended, and a suspended context hears nothing.
  let ctx: AudioContext | null = null;
  try {
    const AC = audioContextCtor();
    if (AC) ctx = new AC();
    void ctx?.resume().catch(() => undefined);
  } catch {
    ctx = null;
  }

  const run = async () => {
    if (!ctx) throw new Error('No Web Audio');
    const audio = ctx;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      state = 'over';
      void audio.close().catch(() => undefined);
      return settle({ ok: false, error: name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'no-mic' });
    }
    if (cancelled) {
      stream.getTracks().forEach((t) => t.stop());
      void audio.close().catch(() => undefined);
      return;
    }
    if (audio.state === 'suspended') await audio.resume().catch(() => undefined);

    // Collect the raw samples. ScriptProcessorNode is old, but it is in every browser and needs no extra file
    // (an AudioWorklet module would); a clip lasts seconds, so its cost on the main thread doesn't matter.
    const source = audio.createMediaStreamSource(stream);
    const tap = audio.createScriptProcessor(4096, 1, 1);
    const parts: Float32Array[] = [];
    let taken = 0;
    const limit = audio.sampleRate * (MAX_MS / 1000 + 1);
    let floor = 0.01;
    let spoke = false;
    let lastLoud = 0;
    const started = Date.now();
    tap.onaudioprocess = (e) => {
      if (state !== 'recording') return;
      const data = e.inputBuffer.getChannelData(0);
      if (taken < limit) {
        parts.push(new Float32Array(data));
        taken += data.length;
      }
      // A level meter, which also notices when the learner has finished speaking.
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const now = Date.now();
      // The first moment sets the room's noise level.
      if (now - started < 300) floor = Math.max(floor, rms);
      if (rms > Math.max(0.02, floor * 2.5)) {
        spoke = true;
        lastLoud = now;
      }
      opts.onLevel?.(Math.min(1, rms * 8));
    };
    source.connect(tap);
    // Some browsers only run a processor that is connected to the output. It writes nothing, so it stays silent.
    tap.connect(audio.destination);

    let finished: () => void = () => undefined;
    const stopped = new Promise<void>((r) => (finished = r));
    const timer = setInterval(() => {
      const now = Date.now();
      if ((spoke && now - lastLoud > TRAILING_MS) || (!spoke && now - started > WAIT_MS) || now - started > MAX_MS) stopNow();
    }, 50);
    stopNow = () => {
      if (state !== 'recording') return;
      state = 'stopping';
      clearInterval(timer);
      finished();
    };
    state = 'recording';
    await stopped;
    tap.onaudioprocess = null;
    source.disconnect();
    tap.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    const rate = audio.sampleRate;
    void audio.close().catch(() => undefined);
    state = 'over';
    if (cancelled) return;
    opts.onLevel?.(0);

    const samples = resample(join(parts), rate, RATE);
    const wav = encodeWav(samples, RATE);
    const recording = samples.length ? URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })) : undefined;
    if (!spoke) return settle({ ok: false, error: 'no-speech', recording });
    if (!transcribe) return settle({ ok: true, alternatives: [], recording });
    opts.onChecking?.();
    try {
      const { text } = await api<{ text: string }>('POST', '/speech/transcribe', { audio: base64(wav) });
      if (!text.trim()) return settle({ ok: false, error: 'no-speech', recording });
      settle({ ok: true, alternatives: [text], recording });
    } catch (e) {
      // Out of allowance or a preview without recognition: mark yourself from here on. A dropped connection or a
      // busy moment is only this once.
      if (e instanceof ApiError && (e.status === 503 || e.status === 404)) markBroken('server');
      settle({ ok: false, error: 'unavailable', message: e instanceof ApiError ? e.message : undefined, recording });
    }
  };
  void run().catch(() => {
    markBroken('server');
    void ctx?.close().catch(() => undefined);
    settle({ ok: false, error: 'unavailable' });
  });

  return {
    done,
    stop: () => stopNow(),
    cancel: () => {
      cancelled = true;
      settle({ ok: false, error: 'aborted' });
      stopNow();
    },
  };
}

/* ---------- WAV ---------- */

const RATE = 16_000;
const MAX_SECONDS = 10;

function join(parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Down to Whisper's 16 kHz, averaging the samples that fall into each new one (a simple low-pass). */
export function resample(input: Float32Array, from: number, to: number): Float32Array {
  const limit = Math.min(input.length, Math.floor(from * MAX_SECONDS));
  if (from === to) return input.slice(0, limit);
  const ratio = from / to;
  const out = new Float32Array(Math.floor(limit / ratio));
  for (let i = 0; i < out.length; i++) {
    const a = Math.floor(i * ratio);
    const b = Math.min(limit, Math.max(a + 1, Math.floor((i + 1) * ratio)));
    let sum = 0;
    for (let k = a; k < b; k++) sum += input[k];
    out[i] = sum / (b - a);
  }
  return out;
}

export function encodeWav(samples: Float32Array, rate: number): Uint8Array<ArrayBuffer> {
  const out = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (at: number, s: string) => [...s].forEach((c, i) => out.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  out.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true); // PCM
  out.setUint16(22, 1, true); // mono
  out.setUint32(24, rate, true);
  out.setUint32(28, rate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  text(36, 'data');
  out.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(out.buffer);
}

function base64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

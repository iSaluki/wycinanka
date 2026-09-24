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

/** Whether this browser can record a clip and turn it into WAV. */
export const canRecord = () =>
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof MediaRecorder !== 'undefined' &&
  typeof AudioContext !== 'undefined' &&
  typeof OfflineAudioContext !== 'undefined';

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
  if (recognitionCtor() && !broken.has('browser')) return 'browser';
  if (canRecord() && !broken.has('server')) return 'server';
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
    if (sofar) opts.onInterim?.(sofar);
  };
  rec.onerror = (e) => {
    events++;
    switch (e.error) {
      case 'no-speech':
        return finish({ ok: false, error: 'no-speech' });
      case 'not-allowed':
        return finish({ ok: false, error: 'denied' });
      case 'audio-capture':
        return finish({ ok: false, error: 'no-mic' });
      case 'aborted':
        return finish({ ok: false, error: 'aborted' });
      default:
        // 'network', 'service-not-allowed', 'language-not-supported'…: this browser can't do it.
        markBroken('browser');
        return finish({ ok: false, error: 'unavailable', message: e.error });
    }
  };
  rec.onend = () => {
    if (!finals.length) return finish({ ok: false, error: 'no-speech' });
    finish({ ok: true, alternatives: guesses(finals) });
  };
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
      if (finals.length) return finish({ ok: true, alternatives: guesses(finals) });
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

  const run = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      state = 'over';
      return settle({ ok: false, error: name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'no-mic' });
    }
    if (cancelled) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    const type = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported?.(t));
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const stopped = new Promise<void>((r) => (recorder.onstop = () => r()));

    // A level meter, which also notices when the learner has finished speaking.
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Float32Array(analyser.fftSize);
    const started = Date.now();
    let floor = 0.01;
    let spoke = false;
    let lastLoud = 0;
    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      const now = Date.now();
      // The first moment sets the room's noise level.
      if (now - started < 300) floor = Math.max(floor, rms);
      const loud = rms > Math.max(0.02, floor * 2.5);
      if (loud) {
        spoke = true;
        lastLoud = now;
      }
      opts.onLevel?.(Math.min(1, rms * 8));
      if ((spoke && now - lastLoud > TRAILING_MS) || (!spoke && now - started > WAIT_MS) || now - started > MAX_MS) stopNow();
    }, 50);

    stopNow = () => {
      if (state !== 'recording') return;
      state = 'stopping';
      clearInterval(timer);
      try {
        recorder.stop();
      } catch {
        // Already stopped.
      }
    };
    state = 'recording';
    recorder.start(250);
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close().catch(() => undefined);
    state = 'over';
    if (cancelled) return;
    opts.onLevel?.(0);
    const blob = new Blob(chunks, { type: recorder.mimeType || type || 'audio/webm' });
    const recording = blob.size ? URL.createObjectURL(blob) : undefined;
    if (!spoke) return settle({ ok: false, error: 'no-speech', recording });
    if (!transcribe) return settle({ ok: true, alternatives: [], recording });
    opts.onChecking?.();
    try {
      const audio = await toWavBase64(blob);
      const { text } = await api<{ text: string }>('POST', '/speech/transcribe', { audio });
      if (!text.trim()) return settle({ ok: false, error: 'no-speech', recording });
      settle({ ok: true, alternatives: [text], recording });
    } catch (e) {
      // Out of allowance, a preview without recognition, or offline: mark yourself from here on.
      if (!(e instanceof ApiError) || e.status === 503 || e.status === 0 || e.status === 404) markBroken('server');
      settle({ ok: false, error: 'unavailable', message: e instanceof ApiError ? e.message : undefined, recording });
    }
  };
  void run().catch(() => {
    markBroken('server');
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

/** Decode a recorded clip and re-encode it as 16 kHz 16-bit mono WAV, which Whisper reads directly. */
export async function toWavBase64(blob: Blob): Promise<string> {
  const data = await blob.arrayBuffer();
  const ctx = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(data);
  } finally {
    void ctx.close().catch(() => undefined);
  }
  const seconds = Math.min(MAX_SECONDS, decoded.duration);
  const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(seconds * RATE)), RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return base64(encodeWav(rendered.getChannelData(0), RATE));
}

export function encodeWav(samples: Float32Array, rate: number): Uint8Array {
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

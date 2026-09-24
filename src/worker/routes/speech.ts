import { Hono } from 'hono';
import { transcribeSchema } from '../../shared/schemas';
import type { AppEnv } from '../env';
import { clientIp, HttpError, readJson } from '../http';
import { hit, lockedFor, POLICIES, retryMinutes } from '../throttle';

/**
 * Speech to text for speaking practice, for browsers without their own speech recognition (Firefox, most
 * in-app browsers). The browser records a short WAV and this runs it through Whisper on Workers AI. Nothing
 * is stored: the recording and the text exist only for this request. Open to guests as well, throttled by IP.
 */

export const TRANSCRIBE_PATH = '/api/speech/transcribe';
export const SPEECH_BODY_LIMIT = 450 * 1024;
export const WHISPER = '@cf/openai/whisper-large-v3-turbo';

/**
 * Whisper was trained on subtitled video, and on near-silence it sometimes "hears" the credits. These are the
 * Polish ones it is known for. None is anything a learner would be asked to say.
 */
const PHANTOMS = [
  /napisy (stworzone|wykonane|przygotowane)[^!?]*?amara\.org/gi,
  /napisy (stworzone|wykonane|przygotowane)[^.!?]*/gi,
  /dzięki za (obejrzenie|oglądanie)[^.!?]*[.!?]?/gi,
  /dziękuję za (obejrzenie|oglądanie|uwagę)[^.!?]*[.!?]?/gi,
  /(subskrybuj|zasubskrybuj)[^.!?]*[.!?]?/gi,
  /tłumaczenie[^.!?]*napisy[^.!?]*[.!?]?/gi,
];

export function cleanTranscript(text: string): string {
  let t = text;
  for (const re of PHANTOMS) t = t.replace(re, ' ');
  return t.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export const speech = new Hono<AppEnv>();

speech.post('/transcribe', async (c) => {
  const ai = c.env.AI;
  if (!ai) throw new HttpError(503, "Speech recognition isn't available here.");
  const now = Date.now();
  const key = `speech:ip:${clientIp(c)}`;
  const locked = await lockedFor(c.env.DB, key, now);
  if (locked) throw new HttpError(429, `That's a lot of speaking! Speech checking is resting for ${retryMinutes(locked)} minutes.`);
  const { audio } = await readJson(c, transcribeSchema);
  await hit(c.env.DB, key, POLICIES.speechIp, now);
  let text: string;
  try {
    const out = await ai.run(WHISPER, { audio, language: 'pl', task: 'transcribe', vad_filter: true, condition_on_previous_text: false });
    text = typeof out?.text === 'string' ? out.text : '';
  } catch (err) {
    // Usually the free plan's daily allowance running out: the learner can still check themselves.
    console.error(JSON.stringify({ event: 'transcribe_failed', message: err instanceof Error ? err.message : String(err) }));
    throw new HttpError(503, "Speech checking isn't available right now.");
  }
  return c.json({ text: cleanTranscript(text) });
});

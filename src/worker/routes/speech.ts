import { Hono } from 'hono';
import { transcribeSchema } from '../../shared/schemas';
import type { AppEnv, Env } from '../env';
import { currentUser } from '../session';
import { clientIp, HttpError, readJson } from '../http';
import { hit, lockedFor, POLICIES, retryMinutes } from '../throttle';

/**
 * Speech to text for speaking practice, for browsers without their own speech recognition (Firefox, most
 * in-app browsers). The browser records a short WAV and this runs it through Whisper on Workers AI. Nothing
 * is stored: the recording and the text exist only for this request. Open to guests as well, throttled by IP
 * (and by account when signed in), within a daily budget for everyone together.
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

const DAY = 86_400_000;
/** Transcriptions a day, for everyone together (see SPEECH_DAILY_LIMIT in wrangler.jsonc). */
export const dailyBudget = (env: Env) => {
  const n = Number(env.SPEECH_DAILY_LIMIT ?? 2000);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 2000;
};

speech.post('/transcribe', async (c) => {
  const ai = c.env.AI;
  if (!ai) throw new HttpError(503, "Speech recognition isn't available here.");
  const now = Date.now();
  const db = c.env.DB;
  const user = await currentUser(c);
  const keys = [`speech:ip:${clientIp(c)}`, ...(user ? [`speech:user:${user.id}`] : [])];
  for (const key of keys) {
    const locked = await lockedFor(db, key, now);
    if (locked) throw new HttpError(429, `That's a lot of speaking! Speech checking is resting for ${retryMinutes(locked)} minutes.`);
  }
  // Workers AI has one daily allowance for everyone. Stop before it runs out, and keep part of it for learners
  // with an account, so a flood of anonymous requests can't take speech checking away from them.
  const budget = dailyBudget(c.env);
  const pools = user ? [['speech:day', budget]] : [['speech:day', budget], ['speech:guest-day', Math.floor(budget / 2)]];
  for (const [key] of pools) {
    if (await lockedFor(db, key as string, now)) throw new HttpError(503, "Speech checking has reached today's limit. It will be back tomorrow.");
  }
  const { audio } = await readJson(c, transcribeSchema);
  await hit(db, keys[0], POLICIES.speechIp, now);
  if (user) await hit(db, keys[1], POLICIES.speechUser, now);
  for (const [key, limit] of pools) await hit(db, key as string, { limit: limit as number, windowMs: DAY, lockMs: 60 * 60_000 }, now);
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

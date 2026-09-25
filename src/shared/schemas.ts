import { z } from 'zod';

/** Shared request/response contracts. The Worker validates every body with these (strict: unknown keys rejected). */

import { PASSWORD_MAX, USERNAME_RE } from './limits';
export { PASSWORD_MAX, PASSWORD_MIN, USERNAME_RE } from './limits';

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a date as YYYY-MM-DD');
const contentId = z.string().regex(/^[a-z0-9:-]{1,64}$/);
const lessonId = z.string().regex(/^u\d{2}-l\d$/);

export const credentialsSchema = z
  .object({
    username: z.string().regex(USERNAME_RE, 'Use 3–24 letters, numbers, dots, dashes or underscores.'),
    password: z.string().min(1).max(PASSWORD_MAX),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(PASSWORD_MAX),
    newPassword: z.string().min(1).max(PASSWORD_MAX),
  })
  .strict();

export const deleteAccountSchema = z.object({ password: z.string().min(1).max(PASSWORD_MAX) }).strict();

export const settingsSchema = z
  .object({
    /** A unit's key (the number in its id, u06 → 6), not its position in the course. */
    startUnit: z.number().int().min(0).max(99).optional(),
    placementBand: z.number().int().min(0).max(6).optional(),
    dailyGoal: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(50)]).optional(),
    speechRate: z.number().min(0.5).max(1.3).optional(),
    theme: z.enum(['system', 'light', 'dark']).optional(),
    reduceMotion: z.boolean().optional(),
    speaker: z.enum(['m', 'f']).optional(),
    /** Read Polish with the device's own voice instead of the recorded one. */
    deviceVoice: z.boolean().optional(),
    /** Speaking exercises in lessons. On unless switched off. */
    speaking: z.boolean().optional(),
    /** Little sounds for right and wrong answers and a finished lesson. On unless switched off. */
    sounds: z.boolean().optional(),
    /** Daily practice reminder by push notification, at `reminderHour` o'clock in `timeZone`. */
    reminders: z.boolean().optional(),
    reminderHour: z.number().int().min(0).max(23).optional(),
    /** Badges the learner has been told about, and when (ms). Badges themselves are worked out from progress. */
    badges: z
      .record(z.string().regex(/^[a-z0-9-]{1,40}$/), z.number().int().positive())
      .refine((b) => Object.keys(b).length <= 100, 'Too many badges')
      .optional(),
    timeZone: z
      .string()
      .max(64)
      .regex(/^[A-Za-z][A-Za-z0-9_+\-/]*$/, 'Expected an IANA time zone such as Europe/London')
      .optional(),
  })
  .strict();
export type Settings = z.infer<typeof settingsSchema>;

export const lessonResultSchema = z
  .object({
    lessonId,
    correct: z.number().int().min(0).max(200),
    total: z.number().int().min(1).max(200),
    /** Card ids from this lesson the learner got wrong at least once. */
    missed: z.array(contentId).max(60).default([]),
    day,
    /** When the lesson was finished, if it is sent later than that (saved while offline). */
    at: z.number().int().positive().optional(),
    /** Unique per finished lesson, so a result sent twice after a lost connection is counted once. */
    key: z.string().regex(/^[A-Za-z0-9_-]{8,40}$/).optional(),
  })
  .strict()
  .refine((r) => r.correct <= r.total, { message: 'correct cannot exceed total' });
export type LessonResult = z.infer<typeof lessonResultSchema>;

export const reviewSchema = z
  .object({
    cardId: contentId,
    rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    at: z.number().int().positive(),
  })
  .strict();
export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewBatchSchema = z
  .object({
    day,
    reviews: z.array(reviewSchema).min(1).max(100),
  })
  .strict();

export const pushSubscriptionSchema = z
  .object({
    endpoint: z.string().url().max(1024),
    keys: z.object({ p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,100}={0,2}$/), auth: z.string().regex(/^[A-Za-z0-9_-]{16,32}={0,2}$/) }).strict(),
  })
  .strict();

export const pushEndpointSchema = z.object({ endpoint: z.string().url().max(1024) }).strict();

/**
 * A spoken answer to transcribe: a WAV recording (16 kHz, 16-bit mono, at most about 10 seconds), base64-encoded
 * so the request stays JSON like every other state-changing request.
 */
export const TRANSCRIBE_MAX_CHARS = 440_000;
export const transcribeSchema = z
  .object({
    audio: z
      .string()
      .max(TRANSCRIBE_MAX_CHARS)
      .regex(/^UklGR[A-Za-z0-9+/]+={0,2}$/, 'Expected a WAV recording'),
  })
  .strict();

/** A guest's progress (saved on their device), replayed server-side once when they create an account. */
export const importSchema = z
  .object({
    lessons: z.array(lessonResultSchema.and(z.object({ at: z.number().int().positive() }))).max(300),
    reviews: z.array(reviewSchema.extend({ day })).max(3000),
    settings: settingsSchema.optional(),
  })
  .strict();
export type ImportInput = z.infer<typeof importSchema>;

/** Server → client snapshot. */
export interface CardRow {
  cardId: string;
  due: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2;
  last: number;
}

export interface Snapshot {
  user: { username: string; createdAt: number } | null;
  settings: Settings;
  lessons: Record<string, { best: number; completions: number; at: number }>;
  cards: CardRow[];
  activity: Array<{ day: string; xp: number; lessons: number; reviews: number }>;
}

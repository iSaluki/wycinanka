import { z } from 'zod';

/** Shared request/response contracts. The Worker validates every body with these (strict: unknown keys rejected). */

export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

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
    startUnit: z.number().int().min(1).max(18).optional(),
    placementBand: z.number().int().min(0).max(6).optional(),
    dailyGoal: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(50)]).optional(),
    speechRate: z.number().min(0.5).max(1.3).optional(),
    theme: z.enum(['system', 'light', 'dark']).optional(),
    reduceMotion: z.boolean().optional(),
    speaker: z.enum(['m', 'f']).optional(),
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

/** A guest's session, replayed server-side once when they create an account. */
export const importSchema = z
  .object({
    lessons: z.array(lessonResultSchema.and(z.object({ at: z.number().int().positive() }))).max(60),
    reviews: z.array(reviewSchema.extend({ day })).max(500),
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

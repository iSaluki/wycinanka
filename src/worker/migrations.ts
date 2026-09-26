// Mirrors migrations/*.sql for the Worker's own migration runner (see migrate.ts).
// test/unit/migrations.test.ts fails if the two drift apart. Add new files to both.

export const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: "0001_init.sql",
    sql: `-- Wycinanka initial schema. All per-user rows cascade when a user is deleted.

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  settings      TEXT NOT NULL DEFAULT '{}'
);

-- Only a SHA-256 hash of each session token is stored.
CREATE TABLE sessions (
  id_hash    TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

CREATE TABLE lesson_progress (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL,
  best_score   INTEGER NOT NULL,
  completions  INTEGER NOT NULL DEFAULT 1,
  completed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE cards (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id     TEXT NOT NULL,
  due         INTEGER NOT NULL,
  stability   REAL NOT NULL,
  difficulty  REAL NOT NULL,
  reps        INTEGER NOT NULL,
  lapses      INTEGER NOT NULL,
  state       INTEGER NOT NULL,
  last_review INTEGER NOT NULL,
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE activity (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     TEXT NOT NULL,
  xp      INTEGER NOT NULL DEFAULT 0,
  lessons INTEGER NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- Sliding-window counters for login and registration throttling.
CREATE TABLE auth_throttle (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL,
  window_start INTEGER NOT NULL,
  locked_until INTEGER NOT NULL DEFAULT 0
);
`,
  },
  {
    name: "0002_push.sql",
    sql: `-- Daily practice reminders (Web Push). One row per browser that has subscribed.
CREATE TABLE push_subscriptions (
  endpoint      TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  last_sent_day TEXT
);
CREATE INDEX push_subscriptions_user ON push_subscriptions(user_id);

-- Server-generated keys, such as the VAPID key pair that signs push messages.
CREATE TABLE app_keys (
  name  TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`,
  },
  {
    name: "0003_sync.sql",
    sql: `-- Lesson results sent again after a lost connection: each carries a key, and a key already seen is not counted twice.
CREATE TABLE sync_keys (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key)
);
`,
  },
  {
    name: "0004_push_status.sql",
    sql: `-- When each device was last sent a daily reminder, and whether the push service took it, for the profile page.
ALTER TABLE push_subscriptions ADD COLUMN last_sent_at INTEGER;
ALTER TABLE push_subscriptions ADD COLUMN last_result TEXT;
`,
  },
];

/** Splits a migration file into statements. Our migrations never put ';' inside strings. */
export function statements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

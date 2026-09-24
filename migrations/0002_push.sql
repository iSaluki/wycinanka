-- Daily practice reminders (Web Push). One row per browser that has subscribed.
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

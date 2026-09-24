-- Lesson results sent again after a lost connection: each carries a key, and a key already seen is not counted twice.
CREATE TABLE sync_keys (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key)
);

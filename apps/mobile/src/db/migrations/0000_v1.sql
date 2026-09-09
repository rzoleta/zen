PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY NOT NULL,
  deck_order INTEGER NOT NULL UNIQUE,
  word TEXT NOT NULL,
  word_furigana TEXT NOT NULL,
  meaning TEXT NOT NULL,
  sentence TEXT NOT NULL,
  sentence_target_start INTEGER NOT NULL,
  sentence_target_length INTEGER NOT NULL,
  sentence_furigana TEXT NOT NULL,
  sentence_meaning TEXT NOT NULL,
  word_audio TEXT,
  sentence_audio TEXT
);

CREATE TABLE IF NOT EXISTS cards (
  word_id INTEGER PRIMARY KEY NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  state INTEGER NOT NULL DEFAULT 0,
  due INTEGER NOT NULL,
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  learning_steps INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_review INTEGER,
  suspended TEXT NOT NULL DEFAULT 'none',
  known INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  card_id INTEGER NOT NULL REFERENCES cards(word_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  previous_card TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS review_log_card_idx ON review_log(card_id);
CREATE INDEX IF NOT EXISTS review_log_date_idx ON review_log(reviewed_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

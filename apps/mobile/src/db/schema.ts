import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const words = sqliteTable("words", {
  id: integer("id").primaryKey(),
  deckOrder: integer("deck_order").notNull().unique(),
  word: text("word").notNull(),
  wordFurigana: text("word_furigana").notNull(),
  meaning: text("meaning").notNull(),
  sentence: text("sentence").notNull(),
  sentenceTargetStart: integer("sentence_target_start").notNull(),
  sentenceTargetLength: integer("sentence_target_length").notNull(),
  sentenceFurigana: text("sentence_furigana").notNull(),
  sentenceMeaning: text("sentence_meaning").notNull(),
  wordAudio: text("word_audio"),
  sentenceAudio: text("sentence_audio"),
});

export const cards = sqliteTable("cards", {
  wordId: integer("word_id")
    .primaryKey()
    .references(() => words.id, { onDelete: "cascade" }),
  state: integer("state").notNull().default(0),
  due: integer("due").notNull(),
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  elapsedDays: integer("elapsed_days").notNull().default(0),
  scheduledDays: integer("scheduled_days").notNull().default(0),
  learningSteps: integer("learning_steps").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  lastReview: integer("last_review"),
  suspended: text("suspended", { enum: ["none", "manual", "leech"] })
    .notNull()
    .default("none"),
  known: integer("known", { mode: "boolean" }).notNull().default(false),
});

export const reviewLog = sqliteTable("review_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.wordId, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  previousCard: text("previous_card").notNull(),
  reviewedAt: integer("reviewed_at").notNull(),
  durationMs: integer("duration_ms").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Word = typeof words.$inferSelect;
export type CardRow = typeof cards.$inferSelect;

import { createEmptyCard } from "ts-fsrs";

import bundledDeck from "@/assets/deck/kaishi.json";
import type { ZenDatabase } from "@/db/client";
import { cards, settings, words } from "@/db/schema";

export const DEFAULT_SETTINGS = {
  new_per_day: "10",
  desired_retention: "0.90",
  leech_threshold: "8",
  learn_ahead_limit: "20",
  autoplay: "true",
  word_audio: "true",
  highlight_word: "true",
  card_front: "word_sentence",
  card_back: "word_sentence",
  jp_font: "gothic",
  theme: "system",
} as const;

interface SeedWord {
  id: number;
  deck_order: number;
  word: string;
  word_furigana: string;
  word_reading: string;
  word_romaji: string;
  meaning: string;
  sentence: string;
  sentence_target_start: number;
  sentence_target_length: number;
  sentence_furigana: string;
  sentence_meaning: string;
  word_audio: string | null;
  sentence_audio: string | null;
}

export async function seedDatabase(db: ZenDatabase): Promise<void> {
  const existing = await db.select({ id: words.id }).from(words).limit(1);
  if (existing.length > 0) return;

  const source = bundledDeck as unknown;
  const deck = (
    Array.isArray(source) ? source : (source as { words: unknown }).words
  ) as SeedWord[];
  const now = Date.now();
  const empty = createEmptyCard(new Date(now));
  db.transaction((tx) => {
    for (const item of deck) {
      tx.insert(words)
        .values({
          id: item.id,
          deckOrder: item.deck_order,
          word: item.word,
          wordFurigana: item.word_furigana,
          wordReading: item.word_reading,
          wordRomaji: item.word_romaji,
          meaning: item.meaning,
          sentence: item.sentence,
          sentenceTargetStart: item.sentence_target_start,
          sentenceTargetLength: item.sentence_target_length,
          sentenceFurigana: item.sentence_furigana,
          sentenceMeaning: item.sentence_meaning,
          wordAudio: item.word_audio,
          sentenceAudio: item.sentence_audio,
        })
        .run();
      tx.insert(cards)
        .values({
          wordId: item.id,
          state: empty.state,
          due: empty.due.getTime(),
          stability: empty.stability,
          difficulty: empty.difficulty,
          elapsedDays: empty.elapsed_days,
          scheduledDays: empty.scheduled_days,
          learningSteps: empty.learning_steps,
          reps: empty.reps,
          lapses: empty.lapses,
        })
        .run();
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      tx.insert(settings).values({ key, value }).onConflictDoNothing().run();
    }
  });
}

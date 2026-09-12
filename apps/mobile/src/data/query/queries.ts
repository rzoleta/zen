import { eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";

import { getDatabase } from "@/db/client";
import { cards, reviewLog, settings, words } from "@/db/schema";
import { queryKeys } from "@/data/query/keys";

export async function fetchSettings() {
  return getDatabase().select().from(settings);
}

export async function fetchDeckRows() {
  return getDatabase()
    .select()
    .from(cards)
    .innerJoin(words, eq(words.id, cards.wordId));
}

export async function fetchReviewLogs() {
  return getDatabase().select().from(reviewLog);
}

export async function fetchWordDetail(wordId: number) {
  const rows = await getDatabase()
    .select()
    .from(words)
    .innerJoin(cards, eq(cards.wordId, words.id))
    .where(eq(words.id, wordId))
    .limit(1);
  return rows[0] ?? null;
}

export function settingsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
  });
}

export function deckQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.deck,
    queryFn: fetchDeckRows,
  });
}

export function reviewLogsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.reviewLogs,
    queryFn: fetchReviewLogs,
  });
}

export function wordQueryOptions(wordId: number) {
  return queryOptions({
    queryKey: queryKeys.word(wordId),
    queryFn: () => fetchWordDetail(wordId),
    enabled: wordId > 0,
  });
}

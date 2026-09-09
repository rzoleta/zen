import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "@/db/client";
import { cards, reviewLog, words } from "@/db/schema";
import { useSettings } from "@/hooks/use-settings";
import {
  composePendingLearningQueue,
  composeQueue,
  studyDayBounds,
} from "@/scheduler";

export type WordStatus =
  | "new"
  | "learning"
  | "young"
  | "mature"
  | "known"
  | "suspended";

export function cardStatus(card: typeof cards.$inferSelect): WordStatus {
  if (card.known) return "known";
  if (card.suspended !== "none") return "suspended";
  if (card.state === 0) return "new";
  if (card.state === 1 || card.state === 3) return "learning";
  return card.scheduledDays >= 21 ? "mature" : "young";
}

export function useDeckRows() {
  // useLiveQuery watches the base table, so cards must come first here.
  return (
    useLiveQuery(
      db.select().from(cards).innerJoin(words, eq(words.id, cards.wordId)),
    ).data ?? []
  );
}

export function useQueue(now = new Date()) {
  const rows = useDeckRows();
  const logs = useLiveQuery(db.select().from(reviewLog)).data ?? [];
  const { newPerDay } = useSettings();
  const bounds = studyDayBounds(now);
  const introduced = new Set(
    logs
      .filter(
        (log) =>
          log.reviewedAt >= bounds.start.getTime() &&
          log.reviewedAt < bounds.end.getTime(),
      )
      .filter(
        (log) =>
          (JSON.parse(log.previousCard) as { state?: number }).state === 0,
      )
      .map((log) => log.cardId),
  ).size;
  const cardsWithOrder = rows.map((row) => ({
    ...row.cards,
    deckOrder: row.words.deckOrder,
  }));
  const queue = composeQueue(cardsWithOrder, introduced, newPerDay, now);
  const pendingQueue = composePendingLearningQueue(cardsWithOrder, now);
  return {
    queue,
    pendingQueue,
    newCount: queue.filter((item) => item.kind === "new").length,
    reviewCount: queue.filter((item) => item.kind !== "new").length,
  };
}

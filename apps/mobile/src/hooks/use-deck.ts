import { useQuery } from "@tanstack/react-query";
import { State } from "ts-fsrs";

import { cards } from "@/db/schema";
import { deckQueryOptions, reviewLogsQueryOptions } from "@/data/query/queries";
import { useSettings } from "@/hooks/use-settings";
import {
  composeExtraNewQueue,
  composePendingLearningQueue,
  composeQueue,
  studyDayBounds,
} from "@/domain/study";
import { isReady } from "@/stores/session";

export type WordStatus = "new" | "learning" | "mature" | "known" | "suspended";

export function cardStatus(card: typeof cards.$inferSelect): WordStatus {
  if (card.known) return "known";
  if (card.suspended !== "none") return "suspended";
  if (card.state === State.New) return "new";
  if (card.state === State.Learning || card.state === State.Relearning)
    return "learning";
  return card.scheduledDays >= 21 ? "mature" : "learning";
}

export function useDeckRows() {
  return useQuery(deckQueryOptions()).data ?? [];
}

export function useReviewLogs() {
  return useQuery(reviewLogsQueryOptions()).data ?? [];
}

export function useQueue(now = new Date()) {
  const rows = useDeckRows();
  const logs = useReviewLogs();
  const { newPerDay, learnAheadLimit } = useSettings();
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
          (JSON.parse(log.previousCard) as { state?: number }).state ===
          State.New,
      )
      .map((log) => log.cardId),
  ).size;
  const cardsWithOrder = rows.map((row) => ({
    ...row.cards,
    deckOrder: row.words.deckOrder,
  }));
  const pending = composePendingLearningQueue(cardsWithOrder, now);
  const queue = [
    ...composeQueue(cardsWithOrder, introduced, newPerDay, now),
    ...pending.filter((item) => isReady(item, now.getTime(), learnAheadLimit)),
  ];
  const pendingQueue = pending.filter(
    (item) => !isReady(item, now.getTime(), learnAheadLimit),
  );
  return {
    queue,
    pendingQueue,
    extraNewQueue: composeExtraNewQueue(cardsWithOrder, introduced, newPerDay),
    newCount: queue.filter((item) => item.kind === "new").length,
    reviewCount: queue.filter((item) => item.kind !== "new").length,
  };
}

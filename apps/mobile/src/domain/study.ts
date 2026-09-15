import { addDays, format, setHours, startOfDay, subHours } from "date-fns";
import { fsrs, Rating, State, type Card } from "ts-fsrs";

import type { CardRow } from "@/db/schema";

export type BinaryGrade = "pass" | "fail";
export type QueueKind = "learning" | "review" | "new";

export interface QueueItem {
  wordId: number;
  kind: QueueKind;
  due: number;
  /** Introduced past the daily new-card limit (endless mode only). */
  extra?: boolean;
}

export function currentStudyDay(now: Date): string {
  return format(subHours(now, 4), "yyyy-MM-dd");
}

export function studyDayBounds(now: Date): { start: Date; end: Date } {
  const start = setHours(startOfDay(subHours(now, 4)), 4);
  return {
    start,
    end: addDays(start, 1),
  };
}

function eligibleNewCards(
  rows: (CardRow & { deckOrder: number })[],
): (CardRow & { deckOrder: number })[] {
  return rows
    .filter(
      (row) =>
        row.suspended === "none" && !row.known && row.state === State.New,
    )
    .sort((a, b) => a.deckOrder - b.deckOrder);
}

export function composeQueue(
  rows: (CardRow & { deckOrder: number })[],
  introducedToday: number,
  newPerDay: number,
  now: Date,
): QueueItem[] {
  const nowMs = now.getTime();
  const dayEnd = studyDayBounds(now).end.getTime();
  const eligible = rows.filter((row) => row.suspended === "none" && !row.known);
  const learning = eligible
    .filter(
      (row) =>
        (row.state === State.Learning || row.state === State.Relearning) &&
        row.due <= nowMs,
    )
    .sort((a, b) => a.due - b.due || a.deckOrder - b.deckOrder)
    .map((row) => ({
      wordId: row.wordId,
      kind: "learning" as const,
      due: row.due,
    }));
  const reviews = eligible
    .filter((row) => row.state === State.Review && row.due < dayEnd)
    .sort((a, b) => a.due - b.due || a.deckOrder - b.deckOrder)
    .map((row) => ({
      wordId: row.wordId,
      kind: "review" as const,
      due: row.due,
    }));
  const remaining = Math.max(0, newPerDay - introducedToday);
  const newCards = eligibleNewCards(eligible)
    .slice(0, remaining)
    .map((row) => ({ wordId: row.wordId, kind: "new" as const, due: row.due }));
  return [...learning, ...reviews, ...newCards];
}

/** New cards beyond today's limit, in deck order, for endless mode. */
export function composeExtraNewQueue(
  rows: (CardRow & { deckOrder: number })[],
  introducedToday: number,
  newPerDay: number,
): QueueItem[] {
  const remaining = Math.max(0, newPerDay - introducedToday);
  return eligibleNewCards(rows)
    .slice(remaining)
    .map((row) => ({
      wordId: row.wordId,
      kind: "new" as const,
      due: row.due,
      extra: true,
    }));
}

export function composePendingLearningQueue(
  rows: (CardRow & { deckOrder: number })[],
  now: Date,
): QueueItem[] {
  const nowMs = now.getTime();
  const dayEnd = studyDayBounds(now).end.getTime();
  return rows
    .filter(
      (row) =>
        row.suspended === "none" &&
        !row.known &&
        (row.state === State.Learning || row.state === State.Relearning) &&
        row.due > nowMs &&
        row.due < dayEnd,
    )
    .sort((a, b) => a.due - b.due || a.deckOrder - b.deckOrder)
    .map((row) => ({
      wordId: row.wordId,
      kind: "learning" as const,
      due: row.due,
    }));
}

function toFsrsCard(card: CardRow): Card {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review:
      card.lastReview === null ? undefined : new Date(card.lastReview),
  };
}

export function scheduleGrade(
  card: CardRow,
  grade: BinaryGrade,
  now: Date,
  retention: number,
  leechThreshold = 8,
): CardRow {
  const result = fsrs({
    request_retention: retention,
    learning_steps: ["10m"],
    relearning_steps: ["10m"],
    enable_fuzz: false,
  }).next(
    toFsrsCard(card),
    now,
    grade === "pass" ? Rating.Good : Rating.Again,
  ).card;
  return {
    ...card,
    state: result.state,
    due: result.due.getTime(),
    stability: result.stability,
    difficulty: result.difficulty,
    elapsedDays: result.elapsed_days,
    scheduledDays: result.scheduled_days,
    learningSteps: result.learning_steps,
    reps: result.reps,
    lapses: result.lapses,
    lastReview: result.last_review?.getTime() ?? null,
    suspended: result.lapses >= leechThreshold ? "leech" : card.suspended,
  };
}

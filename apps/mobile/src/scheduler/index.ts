import { and, eq, gte, lt, sql } from "drizzle-orm";
import { fsrs, Rating, State, type Card } from "ts-fsrs";

import type { ZenDatabase } from "@/db/client";
import { cards, reviewLog, settings, words, type CardRow } from "@/db/schema";

export type BinaryGrade = "pass" | "fail";
export type QueueKind = "learning" | "review" | "new";
export interface QueueItem {
  wordId: number;
  kind: QueueKind;
  due: number;
}

export function currentStudyDay(now: Date): string {
  const shifted = new Date(now.getTime());
  shifted.setHours(shifted.getHours() - 4);
  const year = shifted.getFullYear();
  const month = String(shifted.getMonth() + 1).padStart(2, "0");
  const day = String(shifted.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function studyDayBounds(now: Date): { start: Date; end: Date } {
  const shifted = new Date(now.getTime());
  shifted.setHours(shifted.getHours() - 4);
  const start = new Date(
    shifted.getFullYear(),
    shifted.getMonth(),
    shifted.getDate(),
    4,
  );
  return {
    start,
    end: new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + 1,
      4,
    ),
  };
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
  const newCards = eligible
    .filter((row) => row.state === State.New)
    .sort((a, b) => a.deckOrder - b.deckOrder)
    .slice(0, remaining)
    .map((row) => ({ wordId: row.wordId, kind: "new" as const, due: row.due }));
  return [...learning, ...reviews, ...newCards];
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

export async function buildQueue(
  database: ZenDatabase,
  now = new Date(),
): Promise<QueueItem[]> {
  const all = await database
    .select({
      wordId: cards.wordId,
      state: cards.state,
      due: cards.due,
      stability: cards.stability,
      difficulty: cards.difficulty,
      elapsedDays: cards.elapsedDays,
      scheduledDays: cards.scheduledDays,
      learningSteps: cards.learningSteps,
      reps: cards.reps,
      lapses: cards.lapses,
      lastReview: cards.lastReview,
      suspended: cards.suspended,
      known: cards.known,
      deckOrder: words.deckOrder,
    })
    .from(cards)
    .innerJoin(words, eq(words.id, cards.wordId));
  const { start, end } = studyDayBounds(now);
  const introduced = await database
    .select({ count: sql<number>`count(distinct ${reviewLog.cardId})` })
    .from(reviewLog)
    .where(
      and(
        gte(reviewLog.reviewedAt, start.getTime()),
        lt(reviewLog.reviewedAt, end.getTime()),
        sql`json_extract(${reviewLog.previousCard}, '$.state') = ${State.New}`,
      ),
    );
  const setting = await database
    .select()
    .from(settings)
    .where(eq(settings.key, "new_per_day"))
    .limit(1);
  return composeQueue(
    all,
    Number(introduced[0]?.count ?? 0),
    Number(setting[0]?.value ?? 10),
    now,
  );
}

export async function grade(
  database: ZenDatabase,
  wordId: number,
  answer: BinaryGrade,
  durationMs: number,
  now = new Date(),
): Promise<CardRow> {
  const current = await database
    .select()
    .from(cards)
    .where(eq(cards.wordId, wordId))
    .limit(1);
  const card = current[0];
  if (!card) throw new Error(`Card ${wordId} does not exist`);
  if (card.suspended !== "none" || card.known)
    throw new Error(`Card ${wordId} is not reviewable`);
  const retentionSetting = await database
    .select()
    .from(settings)
    .where(eq(settings.key, "desired_retention"))
    .limit(1);
  const leechSetting = await database
    .select()
    .from(settings)
    .where(eq(settings.key, "leech_threshold"))
    .limit(1);
  const next = scheduleGrade(
    card,
    answer,
    now,
    Number(retentionSetting[0]?.value ?? 0.9),
    Number(leechSetting[0]?.value ?? 8),
  );
  database.transaction((tx) => {
    tx.insert(reviewLog)
      .values({
        cardId: wordId,
        rating: answer === "pass" ? Rating.Good : Rating.Again,
        previousCard: JSON.stringify(card),
        reviewedAt: now.getTime(),
        durationMs: Math.max(0, Math.round(durationMs)),
      })
      .run();
    tx.update(cards).set(next).where(eq(cards.wordId, wordId)).run();
  });
  return next;
}

export async function undo(database: ZenDatabase): Promise<number | null> {
  const rows = await database
    .select()
    .from(reviewLog)
    .orderBy(sql`${reviewLog.id} desc`)
    .limit(1);
  const latest = rows[0];
  if (!latest) return null;
  const previous = JSON.parse(latest.previousCard) as CardRow;
  database.transaction((tx) => {
    tx.update(cards).set(previous).where(eq(cards.wordId, latest.cardId)).run();
    tx.delete(reviewLog).where(eq(reviewLog.id, latest.id)).run();
  });
  return latest.cardId;
}

export async function resetAllProgress(database: ZenDatabase): Promise<void> {
  const now = Date.now();
  database.transaction((tx) => {
    tx.delete(reviewLog).run();
    tx.update(cards)
      .set({
        state: State.New,
        due: now,
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        learningSteps: 0,
        reps: 0,
        lapses: 0,
        lastReview: null,
        suspended: "none",
        known: false,
      })
      .run();
  });
}

export async function getWord(database: ZenDatabase, wordId: number) {
  const rows = await database
    .select()
    .from(words)
    .innerJoin(cards, eq(cards.wordId, words.id))
    .where(eq(words.id, wordId))
    .limit(1);
  return rows[0] ?? null;
}

export async function setSuspended(
  database: ZenDatabase,
  wordId: number,
  value: "none" | "manual",
): Promise<void> {
  await database
    .update(cards)
    .set({ suspended: value })
    .where(eq(cards.wordId, wordId));
}

export async function setKnown(
  database: ZenDatabase,
  wordId: number,
  known: boolean,
): Promise<void> {
  await database
    .update(cards)
    .set({ known, suspended: "none" })
    .where(eq(cards.wordId, wordId));
}

export async function resetCard(
  database: ZenDatabase,
  wordId: number,
): Promise<void> {
  database.transaction((tx) => {
    tx.delete(reviewLog).where(eq(reviewLog.cardId, wordId)).run();
    tx.update(cards)
      .set({
        state: State.New,
        due: Date.now(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        learningSteps: 0,
        reps: 0,
        lapses: 0,
        lastReview: null,
        suspended: "none",
        known: false,
      })
      .where(eq(cards.wordId, wordId))
      .run();
  });
}

import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { Rating, State } from "ts-fsrs";

import type { ZenDatabase } from "@/db/client";
import { cards, reviewLog, settings, words, type CardRow } from "@/db/schema";
import {
  composePendingLearningQueue,
  composeQueue,
  scheduleGrade,
  studyDayBounds,
  type BinaryGrade,
  type QueueItem,
} from "@/domain/study";

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
  return [
    ...composeQueue(
      all,
      Number(introduced[0]?.count ?? 0),
      Number(setting[0]?.value ?? 10),
      now,
    ),
    ...composePendingLearningQueue(all, now),
  ];
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
  await resetCards(database, [wordId]);
}

export async function setManyKnown(
  database: ZenDatabase,
  wordIds: number[],
): Promise<void> {
  if (wordIds.length === 0) return;
  await database
    .update(cards)
    .set({ known: true, suspended: "none" })
    .where(inArray(cards.wordId, wordIds));
}

export async function setManySuspended(
  database: ZenDatabase,
  wordIds: number[],
): Promise<void> {
  if (wordIds.length === 0) return;
  await database
    .update(cards)
    .set({ suspended: "manual" })
    .where(inArray(cards.wordId, wordIds));
}

export async function resetCards(
  database: ZenDatabase,
  wordIds: number[],
): Promise<void> {
  if (wordIds.length === 0) return;
  database.transaction((tx) => {
    tx.delete(reviewLog).where(inArray(reviewLog.cardId, wordIds)).run();
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
      .where(inArray(cards.wordId, wordIds))
      .run();
  });
}

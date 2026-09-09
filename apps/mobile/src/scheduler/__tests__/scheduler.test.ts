import { State } from "ts-fsrs";

import type { CardRow } from "@/db/schema";
import {
  composePendingLearningQueue,
  composeQueue,
  currentStudyDay,
  scheduleGrade,
  studyDayBounds,
} from "@/scheduler";

function card(
  overrides: Partial<CardRow & { deckOrder: number }> = {},
): CardRow & { deckOrder: number } {
  return {
    wordId: 1,
    deckOrder: 1,
    state: State.New,
    due: 0,
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
    ...overrides,
  };
}

describe("4am study day", () => {
  test("the date changes at 4am local time", () => {
    expect(currentStudyDay(new Date(2026, 8, 6, 3, 59))).toBe("2026-09-05");
    expect(currentStudyDay(new Date(2026, 8, 6, 4, 0))).toBe("2026-09-06");
    const bounds = studyDayBounds(new Date(2026, 8, 6, 2));
    expect(bounds.start).toEqual(new Date(2026, 8, 5, 4));
    expect(bounds.end).toEqual(new Date(2026, 8, 6, 4));
  });
});

describe("queue composition", () => {
  const now = new Date(2026, 8, 6, 12);
  test("orders ready learning, due reviews, then new cards in deck order", () => {
    const rows = [
      card({ wordId: 4, deckOrder: 4 }),
      card({
        wordId: 2,
        deckOrder: 2,
        state: State.Review,
        due: now.getTime() - 10,
      }),
      card({
        wordId: 3,
        deckOrder: 3,
        state: State.Learning,
        due: now.getTime() - 20,
      }),
      card({ wordId: 1, deckOrder: 1 }),
    ];
    expect(composeQueue(rows, 0, 2, now).map((item) => item.wordId)).toEqual([
      3, 2, 1, 4,
    ]);
  });

  test("respects the daily new limit and excludes known or suspended cards", () => {
    const rows = [
      card({ wordId: 1 }),
      card({ wordId: 2, deckOrder: 2 }),
      card({ wordId: 3, deckOrder: 3, known: true }),
      card({ wordId: 4, deckOrder: 4, suspended: "manual" }),
    ];
    expect(composeQueue(rows, 1, 2, now).map((item) => item.wordId)).toEqual([
      1,
    ]);
  });

  test("finds learning cards waiting for later in the same study day", () => {
    const dayEnd = studyDayBounds(now).end.getTime();
    const rows = [
      card({ wordId: 1, state: State.Learning, due: now.getTime() - 1 }),
      card({ wordId: 2, state: State.Learning, due: now.getTime() + 60_000 }),
      card({
        wordId: 3,
        state: State.Relearning,
        due: now.getTime() + 120_000,
      }),
      card({ wordId: 4, state: State.Learning, due: dayEnd + 1 }),
      card({
        wordId: 5,
        state: State.Learning,
        due: now.getTime() + 180_000,
        suspended: "manual",
      }),
    ];

    rows.push(
      card({
        wordId: 6,
        state: State.Relearning,
        due: now.getTime() + 60_000,
        suspended: "leech",
      }),
      card({
        wordId: 7,
        state: State.Learning,
        due: now.getTime() + 60_000,
        known: true,
      }),
    );
    expect(
      composePendingLearningQueue(rows, now).map((item) => item.wordId),
    ).toEqual([2, 3]);
  });
});

describe("FSRS pass/fail wrapper", () => {
  const now = new Date(2026, 8, 6, 12);
  test("pass graduates a new card and fail uses the ten minute learning step", () => {
    const fresh = card({ due: now.getTime() });
    const passed = scheduleGrade(fresh, "pass", now, 0.9);
    const failed = scheduleGrade(fresh, "fail", now, 0.9);
    expect(passed.state).toBe(State.Review);
    expect(passed.due).toBeGreaterThan(now.getTime());
    expect(failed.state).toBe(State.Learning);
    expect(failed.due - now.getTime()).toBe(10 * 60 * 1000);
  });

  test.each([
    [4, undefined, "none"],
    [6, undefined, "none"],
    [7, undefined, "leech"],
    [3, 5, "none"],
    [4, 5, "leech"],
    [7, 10, "none"],
    [9, 10, "leech"],
    [0, 1, "leech"],
  ])(
    "%i prior lapses with threshold %s results in %s",
    (lapses, threshold, suspended) => {
      const review = card({
        state: State.Review,
        stability: 10,
        difficulty: 5,
        reps: 8,
        lapses,
        lastReview: new Date(2026, 7, 20).getTime(),
        due: now.getTime(),
      });
      const result = scheduleGrade(review, "fail", now, 0.9, threshold);
      expect(result.lapses).toBe(lapses + 1);
      expect(result.suspended).toBe(suspended);
    },
  );

  test("an early relearning pass uses the updated card history and actual answer time", () => {
    const previous = card({
      state: State.Review,
      stability: 10,
      difficulty: 5,
      reps: 8,
      lapses: 2,
      lastReview: new Date(2026, 7, 20).getTime(),
      due: now.getTime(),
    });
    const failed = scheduleGrade(previous, "fail", now, 0.9);
    const retryTime = new Date(now.getTime() + 30_000);
    expect(failed.due).toBeGreaterThan(retryTime.getTime());
    const passed = scheduleGrade(failed, "pass", retryTime, 0.9);
    expect(passed.state).toBe(State.Review);
    expect(passed.lapses).toBe(3);
    expect(passed.reps).toBe(10);
    expect(passed.lastReview).toBe(retryTime.getTime());
    expect(passed.due).toBeGreaterThan(retryTime.getTime());
  });

  test("a snapshot can restore every scheduler field for undo", () => {
    const before = card({
      state: State.Review,
      stability: 4.2,
      difficulty: 6.1,
      reps: 3,
      due: now.getTime(),
    });
    const snapshot = JSON.stringify(before);
    scheduleGrade(before, "pass", now, 0.9);
    expect(JSON.parse(snapshot)).toEqual(before);
  });
});

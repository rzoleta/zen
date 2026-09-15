import type { QueueItem } from "@/domain/study";
import { isReady, useSessionStore } from "@/stores/session";

const TEN_MINUTES = 10 * 60 * 1000;
const card = (
  wordId: number,
  kind: QueueItem["kind"] = "review",
  due = 0,
): QueueItem => ({ wordId, kind, due });
const session = () => useSessionStore.getState();
const remaining = () =>
  session().queue.filter((item) =>
    isReady(item, session().now, session().learnAheadLimit),
  ).length;
const begin = (queue: QueueItem[]) => session().begin(queue, 0);
const ids = () => session().queue.map((item) => item.wordId);

describe("live review queue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-09T10:00:00Z"));
    session().clear();
  });

  afterEach(() => jest.useRealTimers());

  test("dismissing the last card finishes progress without recording an answer", () => {
    begin([card(1)]);
    session().dismissCard(1);
    expect(ids()).toEqual([]);
    expect(remaining()).toBe(0);
    expect(session().completed).toBe(1);
    expect(session().answered).toBe(0);
    expect(session().canUndo).toBe(false);
    session().dismissCard(1);
    expect(session().completed).toBe(1);
  });

  test("dismissing a different card preserves undo and its progress bookkeeping", () => {
    begin([card(1), card(2), card(3)]);
    session().finishCard();
    session().dismissCard(2);
    expect(ids()).toEqual([3]);
    expect(session().answered).toBe(1);
    expect(session().completed).toBe(2);
    expect(session().canUndo).toBe(true);
    session().restore(card(1));
    expect(ids()).toEqual([1, 3]);
    expect(session().answered).toBe(0);
    expect(session().completed).toBe(1);
  });

  test("dismissing after a failure preserves the failed answer's undo bookkeeping", () => {
    begin([card(1), card(2), card(3)]);
    session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
    session().dismissCard(2);
    session().restore(card(1));
    expect(ids()).toEqual([1, 3]);
    expect(session().completed).toBe(1);
    expect(session().answered).toBe(0);
  });

  test("dismissing an immediate retry prevents undo from restoring its old status", () => {
    session().begin([card(1)]);
    session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
    session().dismissCard(1);
    expect(ids()).toEqual([]);
    expect(session().answered).toBe(1);
    expect(session().completed).toBe(1);
    expect(session().canUndo).toBe(false);
  });

  test("a failed card becomes next when due without replacing the current card", () => {
    begin([card(1), card(2), card(3)]);
    const due = Date.now() + TEN_MINUTES;
    session().finishCard(card(1, "learning", due));
    expect(remaining()).toBe(2);

    jest.setSystemTime(due - 1);
    session().refresh();
    expect(ids()).toEqual([2, 3, 1]);
    expect(remaining()).toBe(2);

    jest.setSystemTime(due);
    session().refresh();
    expect(ids()).toEqual([2, 1, 3]);
    expect(remaining()).toBe(3);
    expect(session().answered).toBe(1);

    session().finishCard();
    expect(ids()).toEqual([1, 3]);
    expect(remaining()).toBe(2);
  });

  test("grading checks the actual time even before the next timer tick", () => {
    begin([card(1), card(2)]);
    const due = Date.now() + TEN_MINUTES;
    session().finishCard(card(1, "learning", due));
    jest.setSystemTime(due + TEN_MINUTES);
    session().finishCard();
    expect(ids()).toEqual([1]);
    expect(remaining()).toBe(1);
  });

  test("learning cards pending before the session join in due order", () => {
    const due = Date.now() + TEN_MINUTES;
    begin([
      card(1),
      card(2, "new"),
      card(3, "learning", due + 1000),
      card(4, "learning", due),
    ]);
    expect(remaining()).toBe(2);
    jest.setSystemTime(due + 1000);
    session().refresh();
    expect(ids()).toEqual([1, 4, 3, 2]);
    expect(remaining()).toBe(4);
  });

  test("future learning cards do not keep an otherwise finished session open", () => {
    begin([card(1)]);
    session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
    expect(remaining()).toBe(0);
    expect(session().answered).toBe(1);
    expect(ids()).toEqual([1]);
  });

  test("failing again starts a fresh wait and undo restores one copy", () => {
    begin([card(1), card(2)]);
    const due = Date.now() + TEN_MINUTES;
    session().finishCard(card(1, "learning", due));
    jest.setSystemTime(due);
    session().finishCard();
    const previous = session().queue[0];
    session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
    expect(remaining()).toBe(0);
    session().restore(previous);
    expect(ids()).toEqual([1]);
    expect(remaining()).toBe(1);
    expect(session().answered).toBe(2);
    expect(session().canUndo).toBe(false);
  });

  test("undo keeps the restored card first when another card has become due", () => {
    const due = Date.now() + TEN_MINUTES;
    begin([card(1), card(2), card(3, "learning", due)]);
    session().finishCard();
    jest.setSystemTime(due);
    session().restore(card(1));
    session().refresh();
    expect(ids()).toEqual([1, 3, 2]);
    expect(remaining()).toBe(3);
  });
});

describe("learn ahead", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-09T10:00:00Z"));
    session().clear();
  });
  afterEach(() => jest.useRealTimers());

  test("ready reviews and new cards precede early retries, ordered by due time", () => {
    const now = Date.now();
    session().begin([
      card(1, "learning", now + TEN_MINUTES),
      card(2),
      card(3, "new"),
      card(4, "learning", now + 5 * 60_000),
      card(5, "learning", now - 1),
    ]);
    expect(session().learnAheadLimit).toBe(20);
    expect(ids()).toEqual([5, 2, 3, 4, 1]);
    expect(remaining()).toBe(5);
    session().finishCard();
    session().finishCard();
    session().finishCard();
    expect(ids()).toEqual([4, 1]);
    expect(remaining()).toBe(2);
  });

  test("repeated failures stay counted without inflating completed progress", () => {
    session().begin([card(1)]);
    for (let i = 0; i < 3; i++) {
      session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
      expect(ids()).toEqual([1]);
      expect(remaining()).toBe(1);
      expect(session().completed).toBe(0);
    }
    const previous = session().queue[0];
    session().finishCard();
    expect(remaining()).toBe(0);
    expect(session().completed).toBe(1);
    session().restore(previous);
    expect(remaining()).toBe(1);
    expect(session().completed).toBe(0);
  });

  test("undoing a failure preserves completed progress and removes the retry copy", () => {
    session().begin([card(1), card(2), card(3)]);
    session().finishCard();
    session().finishCard(card(2, "learning", Date.now() + TEN_MINUTES));
    session().restore(card(2));
    expect(ids()).toEqual([2, 3]);
    expect(remaining()).toBe(2);
    expect(session().completed).toBe(1);
  });

  test.each([0, 5, 20])(
    "%i-minute limit includes its exact boundary only",
    (limit) => {
      const boundary = Date.now() + limit * 60_000;
      session().begin(
        [card(1, "learning", boundary), card(2, "learning", boundary + 1)],
        limit,
      );
      expect(remaining()).toBe(1);
      session().finishCard();
      expect(remaining()).toBe(0);
    },
  );

  test("refresh updates the count when cards enter the window and preserves an early visible card", () => {
    const now = Date.now();
    session().begin([
      card(1, "learning", now + TEN_MINUTES),
      card(2, "learning", now + 21 * 60_000),
    ]);
    expect(remaining()).toBe(1);
    jest.setSystemTime(now + 60_000);
    session().refresh();
    expect(ids()).toEqual([1, 2]);
    expect(remaining()).toBe(2);
    expect(session().completed).toBe(0);
  });

  test("foreground refresh catches up after a long pause without changing the visible card", () => {
    const now = Date.now();
    session().begin([
      card(1),
      card(2, "new"),
      card(3, "learning", now + 40 * 60_000),
    ]);
    jest.setSystemTime(now + 45 * 60_000);
    session().refresh();
    expect(ids()).toEqual([1, 3, 2]);
    expect(remaining()).toBe(3);
  });
});

describe("endless mode", () => {
  const extra = (wordId: number): QueueItem => ({
    ...card(wordId, "new"),
    extra: true,
  });
  const fail = (wordId: number) =>
    session().finishCard(
      card(wordId, "learning", Date.now() + TEN_MINUTES),
      "fail",
    );

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-09T10:00:00Z"));
    session().clear();
  });
  afterEach(() => jest.useRealTimers());

  test("a normal session ignores fails and keeps extra cards", () => {
    begin([card(1), extra(2)]);
    expect(session().endless).toBe(false);
    fail(1);
    expect(session().fails).toBe(1);
    expect(ids()).toEqual([2, 1]);
  });

  test("keeps extra cards after failures when there is no limit", () => {
    session().begin([card(1), extra(2), extra(3)], 20, { failLimit: null });
    expect(session().endless).toBe(true);
    expect(session().failLimit).toBeNull();
    fail(1);
    fail(2);
    expect(session().fails).toBe(2);
    expect(ids()).toEqual([3, 1, 2]);
    expect(remaining()).toBe(3);
  });

  test("reaching the fail limit drops extra cards but keeps retries", () => {
    session().begin([card(1), card(2), extra(3), extra(4)], 20, {
      failLimit: 2,
    });
    fail(1);
    expect(ids()).toEqual([2, 3, 4, 1]);
    session().finishCard();
    fail(3);
    expect(session().fails).toBe(2);
    expect(ids()).toEqual([1, 3]);
    expect(remaining()).toBe(2);
    session().finishCard();
    session().finishCard();
    expect(remaining()).toBe(0);
  });

  test("today's cards survive the fail limit", () => {
    session().begin([card(1), card(2, "new"), extra(3)], 20, { failLimit: 1 });
    fail(1);
    expect(ids()).toEqual([2, 1]);
  });

  test("undo takes back a failure without restoring dropped extras", () => {
    session().begin([card(1), card(2), extra(3)], 20, { failLimit: 1 });
    session().finishCard();
    expect(session().fails).toBe(0);
    const previous = session().queue[0];
    fail(2);
    expect(ids()).toEqual([2]);
    session().restore(previous);
    expect(session().fails).toBe(0);
    expect(session().lastFailed).toBe(false);
    expect(ids()).toEqual([2]);
  });

  test("clearing and beginning again resets endless state", () => {
    session().begin([card(1)], 20, { failLimit: 3 });
    fail(1);
    begin([card(2)]);
    expect(session().endless).toBe(false);
    expect(session().failLimit).toBeNull();
    expect(session().fails).toBe(0);
    session().begin([card(1)], 20, { failLimit: 3 });
    session().clear();
    expect(session().endless).toBe(false);
    expect(session().failLimit).toBeNull();
  });
});

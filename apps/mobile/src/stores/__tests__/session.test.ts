import type { QueueItem } from "@/scheduler";
import { isReady, useSessionStore } from "@/stores/session";

const TEN_MINUTES = 10 * 60 * 1000;
const card = (
  wordId: number,
  kind: QueueItem["kind"] = "review",
  due = 0,
): QueueItem => ({ wordId, kind, due });
const session = () => useSessionStore.getState();
const remaining = () =>
  session().queue.filter((item) => isReady(item, session().now)).length;
const ids = () => session().queue.map((item) => item.wordId);

describe("live review queue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-09T10:00:00Z"));
    session().clear();
  });

  afterEach(() => jest.useRealTimers());

  test("a failed card becomes next when due without replacing the current card", () => {
    session().begin([card(1), card(2), card(3)]);
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
    session().begin([card(1), card(2)]);
    const due = Date.now() + TEN_MINUTES;
    session().finishCard(card(1, "learning", due));
    jest.setSystemTime(due + TEN_MINUTES);
    session().finishCard();
    expect(ids()).toEqual([1]);
    expect(remaining()).toBe(1);
  });

  test("learning cards pending before the session join in due order", () => {
    const due = Date.now() + TEN_MINUTES;
    session().begin([
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
    session().begin([card(1)]);
    session().finishCard(card(1, "learning", Date.now() + TEN_MINUTES));
    expect(remaining()).toBe(0);
    expect(session().answered).toBe(1);
    expect(ids()).toEqual([1]);
  });

  test("failing again starts a fresh wait and undo restores one copy", () => {
    session().begin([card(1), card(2)]);
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
    session().begin([card(1), card(2), card(3, "learning", due)]);
    session().finishCard();
    jest.setSystemTime(due);
    session().restore(card(1));
    session().refresh();
    expect(ids()).toEqual([1, 3, 2]);
    expect(remaining()).toBe(3);
  });
});

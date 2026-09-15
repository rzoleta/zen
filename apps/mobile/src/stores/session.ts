import { create } from "zustand";

import type { BinaryGrade, QueueItem } from "@/domain/study";

export function isReady(
  item: QueueItem,
  now: number,
  learnAheadLimit = 0,
): boolean {
  return item.kind !== "learning" || item.due <= now + learnAheadLimit * 60_000;
}

function orderQueue(queue: QueueItem[], now: number): QueueItem[] {
  const learning = queue
    .filter((item) => item.kind === "learning" && isReady(item, now))
    .sort((a, b) => a.due - b.due);
  const other = queue.filter((item) => item.kind !== "learning");
  const pending = queue
    .filter((item) => !isReady(item, now))
    .sort((a, b) => a.due - b.due);
  return [...learning, ...other, ...pending];
}

export interface EndlessOptions {
  /** Stop introducing extra cards after this many failed answers. */
  failLimit: number | null;
}

interface SessionState {
  queue: QueueItem[];
  answered: number;
  completed: number;
  lastCompleted: boolean;
  lastReviewedId: number | null;
  learnAheadLimit: number;
  now: number;
  canUndo: boolean;
  endless: boolean;
  failLimit: number | null;
  fails: number;
  lastFailed: boolean;
  begin: (
    queue: QueueItem[],
    learnAheadLimit?: number,
    endless?: EndlessOptions,
  ) => void;
  refresh: () => void;
  finishCard: (next?: QueueItem, answer?: BinaryGrade) => void;
  dismissCard: (wordId: number) => void;
  restore: (item: QueueItem) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  queue: [],
  answered: 0,
  completed: 0,
  lastCompleted: false,
  lastReviewedId: null,
  learnAheadLimit: 20,
  now: Date.now(),
  canUndo: false,
  endless: false,
  failLimit: null,
  fails: 0,
  lastFailed: false,
  begin: (queue, learnAheadLimit = 20, endless) => {
    const now = Date.now();
    set({
      queue: orderQueue(queue, now),
      answered: 0,
      completed: 0,
      lastCompleted: false,
      lastReviewedId: null,
      learnAheadLimit,
      now,
      canUndo: false,
      endless: endless !== undefined,
      failLimit: endless?.failLimit ?? null,
      fails: 0,
      lastFailed: false,
    });
  },
  refresh: () =>
    set((state) => {
      const now = Date.now();
      const [current, ...rest] = state.queue;
      // A timer must never replace the card the user is answering.
      const queue =
        current && isReady(current, state.now, state.learnAheadLimit)
          ? [current, ...orderQueue(rest, now)]
          : orderQueue(state.queue, now);
      return { queue, now };
    }),
  finishCard: (next, answer = "pass") =>
    set((state) => {
      const now = Date.now();
      const fails = state.fails + (answer === "fail" ? 1 : 0);
      const limitReached = state.failLimit !== null && fails >= state.failLimit;
      const rest = [...state.queue.slice(1), ...(next ? [next] : [])];
      return {
        // Reaching the fail limit stops introducing cards beyond today's;
        // cards already introduced still get their retries.
        queue: orderQueue(
          limitReached ? rest.filter((item) => !item.extra) : rest,
          now,
        ),
        now,
        answered: state.answered + 1,
        completed: state.completed + (next ? 0 : 1),
        lastCompleted: !next,
        lastReviewedId: state.queue[0]?.wordId ?? null,
        canUndo: true,
        fails,
        lastFailed: answer === "fail",
      };
    }),
  dismissCard: (wordId) =>
    set((state) => {
      if (!state.queue.some((item) => item.wordId === wordId)) return state;
      const now = Date.now();
      return {
        queue: orderQueue(
          state.queue.filter((item) => item.wordId !== wordId),
          now,
        ),
        now,
        completed: state.completed + 1,
        // Undo restores a full card snapshot. Don't let it overwrite a new
        // known/suspended status on the same card's immediate retry.
        canUndo: state.canUndo && state.lastReviewedId !== wordId,
      };
    }),
  restore: (item) =>
    set((state) => {
      const now = Date.now();
      return {
        queue: [
          item,
          ...orderQueue(
            state.queue.filter((queued) => queued.wordId !== item.wordId),
            now,
          ),
        ],
        now,
        answered: Math.max(0, state.answered - 1),
        completed: Math.max(0, state.completed - (state.lastCompleted ? 1 : 0)),
        lastCompleted: false,
        lastReviewedId: null,
        canUndo: false,
        // Extra cards dropped at the fail limit are not brought back.
        fails: Math.max(0, state.fails - (state.lastFailed ? 1 : 0)),
        lastFailed: false,
      };
    }),
  clear: () =>
    set({
      queue: [],
      answered: 0,
      completed: 0,
      lastCompleted: false,
      lastReviewedId: null,
      learnAheadLimit: 20,
      now: Date.now(),
      canUndo: false,
      endless: false,
      failLimit: null,
      fails: 0,
      lastFailed: false,
    }),
}));

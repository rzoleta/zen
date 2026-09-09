import { create } from "zustand";

import type { QueueItem } from "@/scheduler";

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

interface SessionState {
  queue: QueueItem[];
  answered: number;
  completed: number;
  lastCompleted: boolean;
  learnAheadLimit: number;
  now: number;
  canUndo: boolean;
  begin: (queue: QueueItem[], learnAheadLimit?: number) => void;
  refresh: () => void;
  finishCard: (next?: QueueItem) => void;
  restore: (item: QueueItem) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  queue: [],
  answered: 0,
  completed: 0,
  lastCompleted: false,
  learnAheadLimit: 20,
  now: Date.now(),
  canUndo: false,
  begin: (queue, learnAheadLimit = 20) => {
    const now = Date.now();
    set({
      queue: orderQueue(queue, now),
      answered: 0,
      completed: 0,
      lastCompleted: false,
      learnAheadLimit,
      now,
      canUndo: false,
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
  finishCard: (next) =>
    set((state) => {
      const now = Date.now();
      return {
        queue: orderQueue(
          [...state.queue.slice(1), ...(next ? [next] : [])],
          now,
        ),
        now,
        answered: state.answered + 1,
        completed: state.completed + (next ? 0 : 1),
        lastCompleted: !next,
        canUndo: true,
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
        canUndo: false,
      };
    }),
  clear: () =>
    set({
      queue: [],
      answered: 0,
      completed: 0,
      lastCompleted: false,
      learnAheadLimit: 20,
      now: Date.now(),
      canUndo: false,
    }),
}));

import { create } from "zustand";

import type { QueueItem } from "@/scheduler";

interface SessionState {
  queue: QueueItem[];
  answered: number;
  startedAt: number;
  canUndo: boolean;
  begin: (queue: QueueItem[]) => void;
  finishCard: (next?: QueueItem) => void;
  restore: (item: QueueItem) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  queue: [],
  answered: 0,
  startedAt: Date.now(),
  canUndo: false,
  begin: (queue) =>
    set({ queue, answered: 0, startedAt: Date.now(), canUndo: false }),
  finishCard: (next) =>
    set((state) => ({
      queue: [...state.queue.slice(1), ...(next ? [next] : [])],
      answered: state.answered + 1,
      canUndo: true,
    })),
  restore: (item) =>
    set((state) => ({
      queue: [
        item,
        ...state.queue.filter((queued) => queued.wordId !== item.wordId),
      ],
      answered: Math.max(0, state.answered - 1),
      canUndo: false,
    })),
  clear: () =>
    set({ queue: [], answered: 0, startedAt: Date.now(), canUndo: false }),
}));

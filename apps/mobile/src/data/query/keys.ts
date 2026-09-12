export const queryKeys = {
  settings: ["settings"] as const,
  deck: ["deck"] as const,
  reviewLogs: ["review-logs"] as const,
  word: (wordId: number) => ["word", wordId] as const,
};

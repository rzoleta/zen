import { addDatabaseChangeListener } from "expo-sqlite";
import type { QueryKey } from "@tanstack/react-query";

import { queryClient } from "@/data/query/client";
import { queryKeys } from "@/data/query/keys";

const tableQueryKeys: Record<string, readonly QueryKey[]> = {
  settings: [queryKeys.settings, queryKeys.deck],
  words: [queryKeys.deck, ["word"]],
  cards: [queryKeys.deck, queryKeys.reviewLogs, ["word"]],
  review_log: [queryKeys.reviewLogs, queryKeys.deck],
};

let listener: ReturnType<typeof addDatabaseChangeListener> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
const changedTables = new Set<string>();

function flushInvalidations() {
  timer = undefined;
  const tables = [...changedTables];
  changedTables.clear();
  const keys = new Set<QueryKey>();
  for (const table of tables) {
    for (const key of tableQueryKeys[table] ?? []) keys.add(key);
  }
  for (const queryKey of keys) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

/**
 * Expo emits one event for every changed row. Keep one listener for the app
 * and batch those events so a transaction causes one refetch per query.
 */
export function installDatabaseChangeListener(): void {
  if (listener) return;
  listener = addDatabaseChangeListener(({ tableName }) => {
    if (!tableQueryKeys[tableName]) return;
    changedTables.add(tableName);
    if (timer) clearTimeout(timer);
    timer = setTimeout(flushInvalidations, 16);
  });
}

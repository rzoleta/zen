import { addDatabaseChangeListener } from "expo-sqlite";
import { type DependencyList, useEffect, useState } from "react";

type Refresh = () => void;
type ChangeBatcher = {
  cancel: () => void;
  push: (tableName: string) => void;
};

const subscriptions = new Map<string, Set<Refresh>>();
let databaseChangeListener:
  | ReturnType<typeof addDatabaseChangeListener>
  | undefined;

export function createTableChangeBatcher(
  notify: (tableNames: ReadonlySet<string>) => void,
  delayMs = 16,
): ChangeBatcher {
  const changedTables = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    push(tableName) {
      changedTables.add(tableName);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        const batch = new Set(changedTables);
        changedTables.clear();
        notify(batch);
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = undefined;
      changedTables.clear();
    },
  };
}

const changeBatcher = createTableChangeBatcher((tableNames) => {
  const refreshes = new Set<Refresh>();
  for (const tableName of tableNames) {
    for (const refresh of subscriptions.get(tableName) ?? []) {
      refreshes.add(refresh);
    }
  }
  for (const refresh of refreshes) refresh();
});

function subscribeToTableChanges(
  tableNames: readonly string[],
  refresh: Refresh,
): () => void {
  for (const tableName of tableNames) {
    const tableSubscriptions = subscriptions.get(tableName) ?? new Set();
    tableSubscriptions.add(refresh);
    subscriptions.set(tableName, tableSubscriptions);
  }

  databaseChangeListener ??= addDatabaseChangeListener(({ tableName }) => {
    changeBatcher.push(tableName);
  });

  return () => {
    for (const tableName of tableNames) {
      const tableSubscriptions = subscriptions.get(tableName);
      tableSubscriptions?.delete(refresh);
      if (tableSubscriptions?.size === 0) subscriptions.delete(tableName);
    }
    if (subscriptions.size === 0) {
      databaseChangeListener?.remove();
      databaseChangeListener = undefined;
      changeBatcher.cancel();
    }
  };
}

/**
 * Runs a Drizzle query again after writes to any watched table. Expo emits one
 * event per changed row, so table events are batched before queries run.
 */
export function useLiveQuery<T>(
  query: PromiseLike<T>,
  tableNames: readonly string[],
  deps: DependencyList = [],
) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const [updatedAt, setUpdatedAt] = useState<Date>();

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void Promise.resolve(query).then(
        (nextData) => {
          if (!active) return;
          setData(nextData);
          setError(undefined);
          setUpdatedAt(new Date());
        },
        (queryError: unknown) => {
          if (!active) return;
          setError(
            queryError instanceof Error
              ? queryError
              : new Error(String(queryError)),
          );
        },
      );
    };

    refresh();
    const unsubscribe = subscribeToTableChanges(tableNames, refresh);
    return () => {
      active = false;
      unsubscribe();
    };
    // Match Drizzle's live-query API: callers control when a query is rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, updatedAt };
}

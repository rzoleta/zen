import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { installDatabaseChangeListener } from "@/data/query/database-invalidation";
import { runMigrations } from "@/db/migrations";
import { seedDatabase } from "@/db/seed";
import * as schema from "@/db/schema";

function createDatabase(sqlite: SQLiteDatabase) {
  return drizzle(sqlite, { schema });
}

export type ZenDatabase = ReturnType<typeof createDatabase>;
export let db: ZenDatabase;

let initialization: Promise<ZenDatabase> | undefined;

function initializeDatabase(): Promise<ZenDatabase> {
  initialization ??= openDatabaseAsync("zen.db", {
    enableChangeListener: true,
  }).then(async (sqlite) => {
    const database = createDatabase(sqlite);
    await runMigrations(database, sqlite);
    await seedDatabase(database);
    db = database;
    installDatabaseChangeListener();
    return database;
  });
  return initialization;
}

export function getDatabase(): ZenDatabase {
  if (!db) throw new Error("Zen database is not ready");
  return db;
}

const ReadyContext = createContext(false);

export function DatabaseProvider({
  children,
  onSettled,
}: PropsWithChildren<{ onSettled?: () => void }>) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(() => {
        if (active) {
          setReady(true);
          onSettled?.();
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize Zen database", error);
        if (active) {
          setError(true);
          onSettled?.();
        }
      });
    return () => {
      active = false;
    };
  }, [onSettled]);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text className="font-sans-semibold text-lg">
          Zen could not open its local database.
        </Text>
        <Text className="mt-1.5 text-sm" muted>
          Close the app and try again.
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#697565" />
      </View>
    );
  }
  return <ReadyContext.Provider value>{children}</ReadyContext.Provider>;
}

export function useDatabaseReady(): boolean {
  return useContext(ReadyContext);
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F1EA",
  },
});

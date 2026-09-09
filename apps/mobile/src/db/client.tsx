import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { seedDatabase } from "@/db/seed";
import * as schema from "@/db/schema";

const migration = `
PRAGMA busy_timeout = 5000;
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY NOT NULL, deck_order INTEGER NOT NULL UNIQUE, word TEXT NOT NULL, word_furigana TEXT NOT NULL, meaning TEXT NOT NULL, sentence TEXT NOT NULL, sentence_target_start INTEGER NOT NULL, sentence_target_length INTEGER NOT NULL, sentence_furigana TEXT NOT NULL, sentence_meaning TEXT NOT NULL, word_audio TEXT, sentence_audio TEXT);
CREATE TABLE IF NOT EXISTS cards (word_id INTEGER PRIMARY KEY NOT NULL REFERENCES words(id) ON DELETE CASCADE, state INTEGER NOT NULL DEFAULT 0, due INTEGER NOT NULL, stability REAL NOT NULL DEFAULT 0, difficulty REAL NOT NULL DEFAULT 0, elapsed_days INTEGER NOT NULL DEFAULT 0, scheduled_days INTEGER NOT NULL DEFAULT 0, learning_steps INTEGER NOT NULL DEFAULT 0, reps INTEGER NOT NULL DEFAULT 0, lapses INTEGER NOT NULL DEFAULT 0, last_review INTEGER, suspended TEXT NOT NULL DEFAULT 'none', known INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS review_log (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, card_id INTEGER NOT NULL REFERENCES cards(word_id) ON DELETE CASCADE, rating INTEGER NOT NULL, previous_card TEXT NOT NULL, reviewed_at INTEGER NOT NULL, duration_ms INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS review_log_card_idx ON review_log(card_id);
CREATE INDEX IF NOT EXISTS review_log_date_idx ON review_log(reviewed_at);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
`;

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
    await sqlite.execAsync(migration);
    await seedDatabase(database);
    db = database;
    return database;
  });
  return initialization;
}

const ReadyContext = createContext(false);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize Zen database", error);
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>
          Zen could not open its local database.
        </Text>
        <Text style={styles.errorBody}>Close the app and try again.</Text>
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
  errorTitle: {
    color: "#1D211C",
    fontFamily: "Geist_600SemiBold",
    fontSize: 17,
  },
  errorBody: {
    marginTop: 6,
    color: "#697565",
    fontFamily: "Geist_400Regular",
    fontSize: 14,
  },
});

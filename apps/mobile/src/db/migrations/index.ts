import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import type { SQLiteDatabase } from "expo-sqlite";

import type { ZenDatabase } from "@/db/client";
import journal from "./meta/_journal.json";
import migrationSql from "./0000_v1.sql";

const migrationConfig = {
  journal,
  migrations: {
    m0000: migrationSql,
  },
};

/**
 * Runs the generated Drizzle migration history against the local database.
 * SQLite pragmas remain outside the migration transaction because journal
 * mode cannot be changed while a transaction is active.
 */
export async function runMigrations(
  database: ZenDatabase,
  sqlite: SQLiteDatabase,
): Promise<void> {
  await sqlite.execAsync(
    "PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;",
  );
  await migrate(database, migrationConfig);
}

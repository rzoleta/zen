import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { DEFAULT_SETTINGS } from "@/db/default-settings";
import { settings } from "@/db/schema";

export async function updateSetting(
  key: keyof typeof DEFAULT_SETTINGS,
  value: string,
): Promise<void> {
  const updates = [{ key, value }];
  if (key === "word_audio" && value === "false") {
    updates.push({ key: "autoplay", value: "false" });
  } else if (key === "autoplay" && value === "true") {
    updates.push({ key: "word_audio", value: "true" });
  }
  await getDatabase()
    .insert(settings)
    .values(updates)
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: sql`excluded.value` },
    });
}

export async function resetSettings(): Promise<void> {
  getDatabase().transaction((tx) => {
    tx.delete(settings).run();
    tx.insert(settings)
      .values(
        Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
          key,
          value,
        })),
      )
      .run();
  });
}

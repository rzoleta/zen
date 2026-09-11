import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { DEFAULT_SETTINGS } from "@/db/seed";
import { settings } from "@/db/schema";
import { useLiveQuery } from "@/hooks/use-live-query";

export type JapaneseFont = "mincho" | "gothic";
export type ThemePreference = "system" | "light" | "dark";
export type CardContent = "word" | "sentence" | "word_sentence";

export function useSettings() {
  const { data = [] } = useLiveQuery(db.select().from(settings), ["settings"]);
  const values = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    newPerDay: Number(values.new_per_day ?? DEFAULT_SETTINGS.new_per_day),
    desiredRetention: Number(
      values.desired_retention ?? DEFAULT_SETTINGS.desired_retention,
    ),
    leechThreshold: Number(
      values.leech_threshold ?? DEFAULT_SETTINGS.leech_threshold,
    ),
    learnAheadLimit: Number(
      values.learn_ahead_limit ?? DEFAULT_SETTINGS.learn_ahead_limit,
    ),
    autoplay: (values.autoplay ?? DEFAULT_SETTINGS.autoplay) === "true",
    wordAudio: (values.word_audio ?? DEFAULT_SETTINGS.word_audio) === "true",
    highlightWord:
      (values.highlight_word ?? DEFAULT_SETTINGS.highlight_word) === "true",
    cardFront: (values.card_front ??
      DEFAULT_SETTINGS.card_front) as CardContent,
    cardBack: (values.card_back ?? DEFAULT_SETTINGS.card_back) as CardContent,
    jpFont: (values.jp_font ?? DEFAULT_SETTINGS.jp_font) as JapaneseFont,
    theme: (values.theme ?? DEFAULT_SETTINGS.theme) as ThemePreference,
  };
}

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
  await db
    .insert(settings)
    .values(updates)
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: sql`excluded.value` },
    });
}

export async function resetSettings(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(settings);
    await tx.insert(settings).values(
      Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
        key,
        value,
      })),
    );
  });
}

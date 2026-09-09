import { db } from "@/db/client";
import { DEFAULT_SETTINGS } from "@/db/seed";
import { settings } from "@/db/schema";
import { useLiveQuery } from "@/hooks/use-live-query";

export type JapaneseFont = "mincho" | "gothic";
export type ThemePreference = "system" | "light" | "dark";

export function useSettings() {
  const { data = [] } = useLiveQuery(db.select().from(settings), ["settings"]);
  const values = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    newPerDay: Number(values.new_per_day ?? DEFAULT_SETTINGS.new_per_day),
    desiredRetention: Number(
      values.desired_retention ?? DEFAULT_SETTINGS.desired_retention,
    ),
    autoplay: (values.autoplay ?? DEFAULT_SETTINGS.autoplay) === "true",
    jpFont: (values.jp_font ?? DEFAULT_SETTINGS.jp_font) as JapaneseFont,
    theme: (values.theme ?? DEFAULT_SETTINGS.theme) as ThemePreference,
  };
}

export async function updateSetting(
  key: keyof typeof DEFAULT_SETTINGS,
  value: string,
): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function resetSettings(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(settings);
    await tx
      .insert(settings)
      .values(
        Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
          key,
          value,
        })),
      );
  });
}

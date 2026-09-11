import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { toast } from "sonner-native";

import { Text } from "@/components/ui";
import { WordRow } from "@/components/word-row";
import { db } from "@/db/client";
import { setKnown, setSuspended } from "@/scheduler";
import { cn } from "@/lib/cn";
import { matchesWordQuery } from "@/lib/search";
import { cardStatus, type WordStatus, useDeckRows } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { confirmWordAction } from "@/lib/confirm-word-action";

const filters: ("all" | WordStatus)[] = [
  "all",
  "new",
  "learning",
  "mature",
  "known",
  "suspended",
];

export default function WordsScreen() {
  const theme = useTheme();
  const { jpFont } = useSettings();
  const rows = useDeckRows();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const data = useMemo(
    () =>
      rows.filter((row) => {
        const status = cardStatus(row.cards);
        return (
          (filter === "all" || filter === status) &&
          matchesWordQuery(row.words, query)
        );
      }),
    [filter, query, rows],
  );
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const updateStatus = async (
    word: (typeof rows)[number]["words"],
    action: "known" | "suspend",
  ) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    try {
      if (action === "known") await setKnown(db, word.id, true);
      else await setSuspended(db, word.id, "manual");
      const message =
        action === "known"
          ? `Marked ${word.word} as known`
          : `Suspended ${word.word}`;
      if (action === "known") toast.success(message);
      else toast.info(message);
      if (Platform.OS === "ios")
        AccessibilityInfo.announceForAccessibility(message);
      void Haptics.selectionAsync();
    } catch (error: unknown) {
      console.error("Failed to update card status", error);
      Alert.alert(
        "Could not save",
        "Your change could not be saved. Please try again.",
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };
  const confirmStatus = (
    word: (typeof rows)[number]["words"],
    action: "known" | "suspend",
  ) => {
    if (saving.current) return;
    confirmWordAction(
      action === "known" ? "mark-known" : "suspend",
      () => void updateStatus(word, action),
    );
  };
  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: "Word, reading, or meaning",
            hideWhenScrolling: false,
            textColor: theme.text,
            onChangeText: (event) => setQuery(event.nativeEvent.text),
          },
        }}
      />
      <FlatList
        className="flex-1 bg-background"
        data={data}
        keyExtractor={(item) => String(item.words.id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="w-full max-w-3xl self-center pb-16"
        ItemSeparatorComponent={WordSeparator}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-5 py-3"
          >
            {filters.map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5",
                  filter === item
                    ? "border-primary bg-primary"
                    : "border-border bg-transparent",
                )}
              >
                <Text
                  variant="footnote"
                  className={cn(
                    "capitalize",
                    filter === item
                      ? "font-sans-medium text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text variant="footnote" muted>
              No words match.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <WordRow
            item={item}
            font={jpFont}
            saving={isSaving}
            onAction={(action) => confirmStatus(item.words, action)}
          />
        )}
      />
    </>
  );
}

function WordSeparator() {
  return <View className="mx-5 h-px bg-border" />;
}

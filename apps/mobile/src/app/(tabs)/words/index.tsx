import { MenuView } from "@expo/ui/community/menu";
import * as Haptics from "expo-haptics";
import { Stack, router } from "expo-router";
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

import { StatusChip } from "@/components/status-chip";
import { FuriganaText, Text } from "@/components/ui";
import { db } from "@/db/client";
import { setKnown, setSuspended } from "@/scheduler";
import { cn } from "@/lib/cn";
import { matchesWordQuery } from "@/lib/search";
import { cardStatus, type WordStatus, useDeckRows } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";

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
    const isSuspend = action === "suspend";
    Alert.alert(
      isSuspend ? "Suspend this word?" : "Mark this word as known?",
      isSuspend
        ? "This word will be excluded from reviews until you unsuspend it from the Words tab."
        : "This word will be marked as known and excluded from reviews. You can change this from the Words tab.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isSuspend ? "Suspend" : "Mark known",
          style: isSuspend ? "destructive" : "default",
          onPress: () => void updateStatus(word, action),
        },
      ],
      { cancelable: true },
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
        contentContainerClassName="w-full max-w-3xl self-center px-5 pb-16"
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 py-3"
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
        renderItem={({ item }) => {
          const status = cardStatus(item.cards);
          return (
            <MenuView
              shouldOpenOnLongPress
              actions={[
                {
                  id: "known",
                  title: "Mark known",
                  attributes: { disabled: isSaving || status === "known" },
                },
                {
                  id: "suspend",
                  title: "Suspend",
                  attributes: {
                    disabled: isSaving || item.cards.suspended !== "none",
                    destructive: true,
                  },
                },
              ]}
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === "known")
                  confirmStatus(item.words, "known");
                else if (nativeEvent.event === "suspend")
                  confirmStatus(item.words, "suspend");
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityHint="Tap to view word details. Touch and hold for word actions."
                onPress={() => router.push(`/words/${item.words.id}`)}
                className="flex-row items-center justify-between gap-4 border-b border-border py-4 active:opacity-60"
              >
                <View className="flex-1 gap-1">
                  <FuriganaText
                    text={item.words.wordFurigana}
                    font={jpFont}
                    fontSize={22}
                    lineHeight={30}
                  />
                  <Text variant="footnote" muted numberOfLines={1}>
                    {item.words.meaning}
                  </Text>
                </View>
                <StatusChip
                  status={status}
                  leech={item.cards.suspended === "leech"}
                />
              </Pressable>
            </MenuView>
          );
        }}
      />
    </>
  );
}

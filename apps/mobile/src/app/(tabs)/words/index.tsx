import { MenuView, type MenuComponentRef } from "@expo/ui/community/menu";
import { Stack, router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { StatusChip } from "@/components/status-chip";
import { FuriganaText, Text } from "@/components/ui";
import { db } from "@/db/client";
import { resetCard, setKnown, setSuspended } from "@/scheduler";
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
        renderItem={({ item }) => <WordRow item={item} />}
      />
    </>
  );
}

function WordRow({ item }: { item: ReturnType<typeof useDeckRows>[number] }) {
  const { jpFont } = useSettings();
  const menuRef = useRef<MenuComponentRef>(null);
  const wordId = item.words.id;

  function runAction(action: () => Promise<void>) {
    void action().catch(() => {
      Alert.alert("Couldn't update card", "Please try again.");
    });
  }

  return (
    <MenuView
      ref={menuRef}
      shouldOpenOnLongPress
      style={{ width: "100%" }}
      actions={[
        { id: "known", title: "Mark known", image: "checkmark.circle" },
        { id: "reset", title: "Reset card", image: "arrow.counterclockwise" },
        {
          id: "suspend",
          title: "Suspend",
          image: "pause.circle",
          attributes: { destructive: true },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case "known":
            runAction(() => setKnown(db, wordId, true));
            break;
          case "reset":
            Alert.alert(
              "Reset this card?",
              "Its review history and scheduling will be removed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => runAction(() => resetCard(db, wordId)),
                },
              ],
            );
            break;
          case "suspend":
            runAction(() => setSuspended(db, wordId, "manual"));
            break;
        }
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Tap to view details. Touch and hold for card actions."
        onPress={() => router.push(`/words/${wordId}`)}
        onLongPress={() => {
          // The child owns Android's press gesture; iOS opens its native context menu.
          if (Platform.OS === "android") menuRef.current?.show();
        }}
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
          status={cardStatus(item.cards)}
          leech={item.cards.suspended === "leech"}
        />
      </Pressable>
    </MenuView>
  );
}

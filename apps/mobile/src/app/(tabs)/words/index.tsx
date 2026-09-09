import { Stack, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import { FuriganaText, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
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
        const needle = query.trim().toLowerCase();
        return (
          (filter === "all" || filter === status) &&
          (!needle ||
            `${row.words.word} ${row.words.wordFurigana} ${row.words.meaning}`
              .toLowerCase()
              .includes(needle))
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
        renderItem={({ item }) => {
          const status = cardStatus(item.cards);
          return (
            <Pressable
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
          );
        }}
      />
    </>
  );
}

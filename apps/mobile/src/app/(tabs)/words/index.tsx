import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StatusChip } from "@/components/status-chip";
import { JapaneseText, ZenText } from "@/components/ui";
import { BottomTabInset, MaxContentWidth } from "@/constants/theme";
import { cardStatus, type WordStatus, useDeckRows } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";

const filters: ("all" | WordStatus)[] = [
  "all",
  "new",
  "learning",
  "young",
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
    <SafeAreaView
      edges={["top"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <ZenText variant="title">Words</ZenText>
        <ZenText muted>
          {data.length} of {rows.length}
        </ZenText>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search word, reading, or meaning"
          placeholderTextColor={theme.muted}
          style={[
            styles.search,
            {
              backgroundColor: theme.surface,
              borderColor: theme.line,
              color: theme.text,
            },
          ]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filter,
                {
                  backgroundColor:
                    filter === item ? theme.accent : theme.surface,
                  borderColor: theme.line,
                },
              ]}
            >
              <ZenText
                variant="caption"
                style={{
                  color: filter === item ? theme.accentText : theme.text,
                }}
              >
                {item}
              </ZenText>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.words.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const status = cardStatus(item.cards);
          return (
            <Pressable
              onPress={() => router.push(`/words/${item.words.id}`)}
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: theme.line },
                pressed && { opacity: 0.55 },
              ]}
            >
              <View style={styles.word}>
                <JapaneseText font={jpFont} style={styles.jp}>
                  {item.words.word}
                </JapaneseText>
                <ZenText variant="caption" muted numberOfLines={1}>
                  {item.words.wordFurigana} · {item.words.meaning}
                </ZenText>
              </View>
              <StatusChip
                status={status}
                leech={item.cards.suspended === "leech"}
              />
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 14,
  },
  search: {
    height: 50,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontFamily: "Geist_400Regular",
    fontSize: 15,
  },
  filters: { gap: 8, paddingRight: 24 },
  filter: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  list: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingBottom: BottomTabInset + 28,
  },
  row: {
    flexDirection: "row",
    minHeight: 78,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  word: { flex: 1, gap: 2 },
  jp: { fontSize: 24, lineHeight: 32 },
});

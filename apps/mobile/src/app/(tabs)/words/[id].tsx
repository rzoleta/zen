import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import {
  Divider,
  JapaneseText,
  Screen,
  SectionTitle,
  Surface,
  ZenText,
} from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { cardStatus } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { resetCard, setKnown, setSuspended } from "@/scheduler";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jpFont } = useSettings();
  const wordId = Number(id);
  const detail = useLiveQuery(
    db
      .select()
      .from(words)
      .innerJoin(cards, eq(cards.wordId, words.id))
      .where(eq(words.id, wordId)),
    [wordId],
  ).data[0];
  if (!detail)
    return (
      <Screen>
        <ZenText>Loading…</ZenText>
      </Screen>
    );
  const { words: word, cards: card } = detail;
  const action = async (work: () => Promise<void>) => {
    await work();
  };
  const due =
    card.state === 0 ? "Not introduced" : new Date(card.due).toLocaleString();
  return (
    <Screen>
      <View style={styles.wordHeader}>
        <JapaneseText font={jpFont} style={styles.headword}>
          {word.word}
        </JapaneseText>
        <JapaneseText font={jpFont} style={styles.reading}>
          {word.wordFurigana}
        </JapaneseText>
        <StatusChip
          status={cardStatus(card)}
          leech={card.suspended === "leech"}
        />
      </View>
      <Surface style={styles.definition}>
        <ZenText variant="label" muted>
          Meaning
        </ZenText>
        <ZenText style={styles.meaning}>{word.meaning}</ZenText>
        <Divider />
        <JapaneseText font={jpFont} style={styles.sentence}>
          {word.sentence}
        </JapaneseText>
        <JapaneseText font={jpFont} style={styles.sentenceReading}>
          {word.sentenceFurigana}
        </JapaneseText>
        <ZenText muted>{word.sentenceMeaning}</ZenText>
      </Surface>
      <SectionTitle>Scheduling</SectionTitle>
      <Surface style={styles.stats}>
        <Stat label="Next due" value={due} />
        <Stat label="Interval" value={`${card.scheduledDays} days`} />
        <Stat label="Reviews" value={String(card.reps)} />
        <Stat label="Lapses" value={String(card.lapses)} />
      </Surface>
      <SectionTitle>Actions</SectionTitle>
      <Surface style={styles.actions}>
        <Action
          label={card.suspended === "none" ? "Suspend" : "Unsuspend"}
          onPress={() =>
            void action(() =>
              setSuspended(
                db,
                wordId,
                card.suspended === "none" ? "manual" : "none",
              ),
            )
          }
        />
        <Divider />
        <Action
          label={card.known ? "Return to study" : "Mark known"}
          onPress={() => void action(() => setKnown(db, wordId, !card.known))}
        />
        <Divider />
        <Action
          label="Reset card"
          destructive
          onPress={() =>
            Alert.alert(
              "Reset this card?",
              "Its review history and scheduling will be removed.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => void action(() => resetCard(db, wordId)),
                },
              ],
            )
          }
        />
      </Surface>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ZenText muted>{label}</ZenText>
      <ZenText>{value}</ZenText>
    </View>
  );
}
function Action({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <ZenText style={destructive ? { color: theme.fail } : undefined}>
        {label}
      </ZenText>
      <ZenText muted>›</ZenText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  wordHeader: { alignItems: "flex-start", gap: 6, paddingTop: 8 },
  headword: { fontSize: 52, lineHeight: 64 },
  reading: { fontSize: 17, lineHeight: 26, opacity: 0.65 },
  definition: { gap: 16 },
  meaning: { fontSize: 22, lineHeight: 30 },
  sentence: { fontSize: 25, lineHeight: 38 },
  sentenceReading: { fontSize: 14, lineHeight: 24, opacity: 0.7 },
  stats: { gap: 14 },
  stat: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  actions: { paddingVertical: 3 },
  action: {
    minHeight: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

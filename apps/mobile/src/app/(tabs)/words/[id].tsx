import { eq } from "drizzle-orm";
import { useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import {
  Button,
  Card,
  FuriganaText,
  JapaneseText,
  Screen,
  SectionTitle,
  Text,
} from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { cardStatus } from "@/hooks/use-deck";
import { useLiveQuery } from "@/hooks/use-live-query";
import { useSettings } from "@/hooks/use-settings";
import { resetCard, setKnown, setSuspended } from "@/scheduler";

const modalBackground = "dark:bg-[#171717]";

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
    ["words", "cards"],
    [wordId],
  ).data?.[0];
  if (!detail)
    return (
      <Screen
        backgroundClassName={modalBackground}
        contentContainerClassName="pb-6"
      >
        <Text muted>Loading…</Text>
      </Screen>
    );
  const { words: word, cards: card } = detail;
  const due =
    card.state === 0 ? "Not introduced" : new Date(card.due).toLocaleString();
  return (
    <Screen
      backgroundClassName={modalBackground}
      contentContainerClassName="pb-6"
    >
      <View className="items-center gap-2 pt-2">
        <JapaneseText
          font={jpFont}
          className="text-[15px] leading-5 text-muted-foreground"
        >
          {word.wordReading}
        </JapaneseText>
        <JapaneseText font={jpFont} className="text-[56px] leading-[68px]">
          {word.word}
        </JapaneseText>
        <Text className="font-sans-medium text-[20px] leading-7">
          {word.meaning}
        </Text>
        <StatusChip
          status={cardStatus(card)}
          leech={card.suspended === "leech"}
        />
      </View>
      <View className="gap-2">
        <SectionTitle>Sentence</SectionTitle>
        <Card className="gap-4">
          <FuriganaText
            text={word.sentenceFurigana}
            font={jpFont}
            fontSize={24}
            lineHeight={38}
          />
          <Text variant="footnote" muted>
            {word.sentenceMeaning}
          </Text>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Scheduling</SectionTitle>
        <Card>
          <View className="flex-row items-center justify-between gap-4">
            <Text variant="footnote" muted>
              Next due
            </Text>
            <Text variant="footnote">{due}</Text>
          </View>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>History</SectionTitle>
        <Card>
          <View className="flex-row gap-4">
            <Stat value={`${card.scheduledDays} days`} label="Interval" />
            <Stat value={String(card.reps)} label="Reviews" />
            <Stat value={String(card.lapses)} label="Lapses" />
          </View>
        </Card>
      </View>
      <View className="gap-2 pt-4">
        <Button
          size="lg"
          label={card.known ? "Return to study" : "Mark known"}
          onPress={() => void setKnown(db, wordId, !card.known)}
        />
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            label="Reset card"
            className="flex-1"
            onPress={() =>
              Alert.alert(
                "Reset this card?",
                "Its review history and scheduling will be removed.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => void resetCard(db, wordId),
                  },
                ],
              )
            }
          />
          <Button
            variant="outline"
            label={card.suspended === "none" ? "Suspend" : "Unsuspend"}
            className="flex-1"
            onPress={() =>
              void setSuspended(
                db,
                wordId,
                card.suspended === "none" ? "manual" : "none",
              )
            }
          />
        </View>
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-sans-semibold text-[17px] leading-[22px]">
        {value}
      </Text>
      <Text variant="caption" muted className="text-center">
        {label}
      </Text>
    </View>
  );
}

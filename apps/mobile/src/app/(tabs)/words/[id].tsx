import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { Alert, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import {
  Button,
  Card,
  FuriganaText,
  Screen,
  SectionTitle,
  Text,
} from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { cardStatus } from "@/hooks/use-deck";
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
    [wordId],
  ).data[0];
  if (!detail)
    return (
      <Screen backgroundClassName={modalBackground}>
        <Text muted>Loading…</Text>
      </Screen>
    );
  const { words: word, cards: card } = detail;
  const due =
    card.state === 0 ? "Not introduced" : new Date(card.due).toLocaleString();
  return (
    <Screen backgroundClassName={modalBackground}>
      <View className="items-start pt-2">
        <FuriganaText
          text={word.wordFurigana}
          font={jpFont}
          fontSize={48}
          lineHeight={62}
        />
      </View>
      <View className="gap-2">
        <SectionTitle>Meaning</SectionTitle>
        <Card>
          <Text className="text-[22px] leading-[30px]">{word.meaning}</Text>
        </Card>
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
        <Card className="gap-3.5">
          <View className="flex-row items-center justify-between gap-4">
            <Text variant="footnote" muted>
              Status
            </Text>
            <StatusChip
              status={cardStatus(card)}
              leech={card.suspended === "leech"}
            />
          </View>
          <Stat label="Next due" value={due} />
          <Stat label="Interval" value={`${card.scheduledDays} days`} />
          <Stat label="Reviews" value={String(card.reps)} />
          <Stat label="Lapses" value={String(card.lapses)} />
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Actions</SectionTitle>
        <View className="gap-2">
          <Button
            size="lg"
            variant="secondary"
            label={card.known ? "Return to study" : "Mark known"}
            onPress={() => void setKnown(db, wordId, !card.known)}
          />
          <Button
            size="lg"
            variant="secondary"
            label="Reset card"
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
            size="lg"
            variant="secondary"
            label={card.suspended === "none" ? "Suspend" : "Unsuspend"}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text variant="footnote" muted>
        {label}
      </Text>
      <Text variant="footnote">{value}</Text>
    </View>
  );
}

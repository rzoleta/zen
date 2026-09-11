import { eq } from "drizzle-orm";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

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
import { useLiveQuery } from "@/hooks/use-live-query";
import { useSettings } from "@/hooks/use-settings";
import { confirmWordAction } from "@/lib/confirm-word-action";
import { formatDueDate, formatRelativeDueDate } from "@/lib/schedule-date";
import { resetCard, setKnown, setSuspended } from "@/scheduler";

const modalBackground = "bg-card";

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
  const dueDate = new Date(card.due);
  const due =
    card.state === 0
      ? "Not introduced"
      : formatDueDate(dueDate);
  const dueRelative =
    card.state === 0 ? null : formatRelativeDueDate(dueDate);
  return (
    <Screen
      backgroundClassName={modalBackground}
      contentContainerClassName="pb-6"
    >
      <View className="items-center gap-2 pt-2">
        <FuriganaText
          text={word.wordFurigana}
          font={jpFont}
          fontSize={60}
          lineHeight={75}
          furiganaFontSize={16}
          align="center"
        />
        <Text className="text-center font-sans-medium text-xl">
          {word.meaning}
        </Text>
        <StatusChip
          status={cardStatus(card)}
          leech={card.suspended === "leech"}
          className="mt-4"
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
          <Text muted>{word.sentenceMeaning}</Text>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Schedule</SectionTitle>
        <Card>
          <View className="flex-row items-center justify-between gap-4">
            <Text muted>Next due</Text>
            <View className="items-end gap-0.5">
              <Text>{due}</Text>
              {dueRelative ? (
                <Text className="text-xs" muted>
                  {dueRelative}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Review</SectionTitle>
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
          variant="outline"
          label={card.known ? "Return to study" : "Mark known"}
          onPress={() =>
            confirmWordAction(
              card.known ? "return-to-study" : "mark-known",
              () => void setKnown(db, wordId, !card.known),
            )
          }
        />
        <View className="flex-row gap-2">
          <Button
            size="lg"
            variant="outline"
            label="Reset card"
            className="flex-1"
            onPress={() =>
              confirmWordAction("reset", () => void resetCard(db, wordId))
            }
          />
          <Button
            size="lg"
            variant="outline"
            label={card.suspended === "none" ? "Suspend" : "Unsuspend"}
            className="flex-1"
            onPress={() => {
              const suspended = card.suspended !== "none";
              confirmWordAction(
                suspended ? "unsuspend" : "suspend",
                () =>
                  void setSuspended(db, wordId, suspended ? "none" : "manual"),
              );
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-sans-semibold text-lg">{value}</Text>
      <Text muted className="text-center">
        {label}
      </Text>
    </View>
  );
}

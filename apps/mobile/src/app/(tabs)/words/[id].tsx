import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import {
  Card,
  JapaneseText,
  Screen,
  SectionTitle,
  Separator,
  Text,
} from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { cn } from "@/lib/cn";
import { cardStatus } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
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
      <Screen header>
        <Text muted>Loading…</Text>
      </Screen>
    );
  const { words: word, cards: card } = detail;
  const due =
    card.state === 0 ? "Not introduced" : new Date(card.due).toLocaleString();
  return (
    <Screen header>
      <Stack.Screen options={{ title: word.word }} />
      <View className="items-start gap-1.5 pt-2">
        <JapaneseText font={jpFont} className="text-[48px] leading-[62px]">
          {word.word}
        </JapaneseText>
        <JapaneseText
          font={jpFont}
          className="text-[17px] leading-6 text-muted-foreground"
        >
          {word.wordFurigana}
        </JapaneseText>
        <StatusChip
          status={cardStatus(card)}
          leech={card.suspended === "leech"}
        />
      </View>
      <Card className="gap-4">
        <Text variant="label">Meaning</Text>
        <Text className="text-[22px] leading-[30px]">{word.meaning}</Text>
        <Separator />
        <JapaneseText font={jpFont} className="text-[24px] leading-[38px]">
          {word.sentence}
        </JapaneseText>
        <JapaneseText
          font={jpFont}
          className="text-[13px] leading-5 text-muted-foreground"
        >
          {word.sentenceFurigana}
        </JapaneseText>
        <Text variant="footnote" muted>
          {word.sentenceMeaning}
        </Text>
      </Card>
      <View className="gap-2">
        <SectionTitle>Scheduling</SectionTitle>
        <Card className="gap-3.5">
          <Stat label="Next due" value={due} />
          <Stat label="Interval" value={`${card.scheduledDays} days`} />
          <Stat label="Reviews" value={String(card.reps)} />
          <Stat label="Lapses" value={String(card.lapses)} />
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Actions</SectionTitle>
        <Card className="py-1">
          <Action
            label={card.suspended === "none" ? "Suspend" : "Unsuspend"}
            onPress={() =>
              void setSuspended(
                db,
                wordId,
                card.suspended === "none" ? "manual" : "none",
              )
            }
          />
          <Separator />
          <Action
            label={card.known ? "Return to study" : "Mark known"}
            onPress={() => void setKnown(db, wordId, !card.known)}
          />
          <Separator />
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
                    onPress: () => void resetCard(db, wordId),
                  },
                ],
              )
            }
          />
        </Card>
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

function Action({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-between active:opacity-60"
    >
      <Text className={cn(destructive && "text-destructive")}>{label}</Text>
      <Text muted>›</Text>
    </Pressable>
  );
}

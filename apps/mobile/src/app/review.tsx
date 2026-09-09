import { and, eq, or } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useAudioPlayer } from "expo-audio";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { State } from "ts-fsrs";

import { audioAssets } from "@/assets/deck/audio-assets";
import { ReviewCard } from "@/components/review-card";
import { Button, Text } from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { formatWait } from "@/lib/format-wait";
import {
  buildQueue,
  getWord,
  grade,
  scheduleGrade,
  studyDayBounds,
  undo,
  type BinaryGrade,
  type QueueItem,
} from "@/scheduler";
import { useSessionStore } from "@/stores/session";

export default function ReviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const { queue, answered, canUndo, begin, finishCard, restore } =
    useSessionStore();
  const current = queue[0];
  const currentId = current?.wordId ?? -1;
  const nextId = queue[1]?.wordId ?? -1;
  const currentDetail = useLiveQuery(
    db
      .select()
      .from(cards)
      .innerJoin(words, eq(words.id, cards.wordId))
      .where(eq(words.id, currentId)),
    [currentId],
  ).data;
  const prefetchedDetail = useLiveQuery(
    db
      .select()
      .from(cards)
      .innerJoin(words, eq(words.id, cards.wordId))
      .where(eq(words.id, nextId)),
    [nextId],
  ).data;
  const detail = [...currentDetail, ...prefetchedDetail].find(
    (row) => row.words.id === currentId,
  );
  const nextDetail = prefetchedDetail.find((row) => row.words.id === nextId);
  const nextAudio = nextDetail?.words.wordAudio
    ? audioAssets[nextDetail.words.wordAudio]
    : undefined;
  const savedLearningCards = useLiveQuery(
    db
      .select({ wordId: cards.wordId, due: cards.due })
      .from(cards)
      .where(
        and(
          or(
            eq(cards.state, State.Learning),
            eq(cards.state, State.Relearning),
          ),
          eq(cards.suspended, "none"),
          eq(cards.known, false),
        ),
      ),
  ).data;
  useAudioPlayer(nextAudio);
  const initialized = useRef(false);
  const pendingGrades = useRef<Promise<void>>(Promise.resolve());
  const shownAt = useRef(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (queue.length === 0 && answered === 0) void buildQueue(db).then(begin);
  }, [answered, begin, queue.length]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    shownAt.current = Date.now();
  }, [currentId]);
  const close = () => router.back();
  const onGrade = useCallback(
    (answer: BinaryGrade) => {
      if (!current || !detail) return;
      const reviewedAt = new Date();
      const durationMs = reviewedAt.getTime() - shownAt.current;
      const next = scheduleGrade(
        detail.cards,
        answer,
        reviewedAt,
        settings.desiredRetention,
      );
      const learning =
        next.suspended === "none" &&
        !next.known &&
        (next.state === State.Learning || next.state === State.Relearning)
          ? { wordId: next.wordId, kind: "learning" as const, due: next.due }
          : undefined;
      finishCard(learning);

      pendingGrades.current = pendingGrades.current
        .then(async () => {
          await grade(db, current.wordId, answer, durationMs, reviewedAt);
        })
        .catch((gradeError: unknown) => {
          console.error("Failed to save card grade", gradeError);
        });
    },
    [current, detail, finishCard, settings.desiredRetention],
  );
  const onUndo = useCallback(async () => {
    if (!canUndo) return;
    await pendingGrades.current;
    const wordId = await undo(db);
    if (wordId === null) return;
    const row = await getWord(db, wordId);
    if (!row) return;
    const kind: QueueItem["kind"] =
      row.cards.state === State.New
        ? "new"
        : row.cards.state === State.Review
          ? "review"
          : "learning";
    restore({ wordId, kind, due: row.cards.due });
    void Haptics.selectionAsync();
  }, [canUndo, restore]);
  const waiting = current?.kind === "learning" && current.due > now;
  const dayEnd = studyDayBounds(new Date(now)).end.getTime();
  const pendingCards = new Map<number, number>();
  for (const item of savedLearningCards) {
    if (item.due > now && item.due < dayEnd) {
      pendingCards.set(item.wordId, item.due);
    }
  }
  for (const item of queue) {
    if (item.kind === "learning" && item.due > now && item.due < dayEnd) {
      pendingCards.set(item.wordId, item.due);
    }
  }
  const pendingCount = pendingCards.size;
  const nextPendingDue = Math.min(...pendingCards.values());
  const showingSummary = waiting || queue.length === 0;
  const glass = isLiquidGlassAvailable();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      <View className="h-16 flex-row items-center justify-between gap-4 px-5">
        <GlassView
          glassEffectStyle={glass ? "regular" : "none"}
          style={[
            { borderRadius: 22, overflow: "hidden" },
            !glass && { backgroundColor: theme.secondary },
          ]}
        >
          <Pressable
            accessibilityLabel="Close review"
            onPress={close}
            className="h-11 w-11 items-center justify-center"
          >
            <SymbolView
              name={{ ios: "xmark", android: "close", web: "close" }}
              tintColor={theme.text}
              size={17}
            />
          </Pressable>
        </GlassView>
        <View className="flex-1 items-center gap-2">
          {!showingSummary ? (
            <>
              <Text variant="caption" muted>
                {queue.length} left
              </Text>
              <View className="h-1 w-full max-w-[180px] flex-row overflow-hidden rounded-full bg-secondary">
                <View
                  className="min-w-[2px] bg-primary"
                  style={{ flex: answered }}
                />
                <View style={{ flex: queue.length }} />
              </View>
            </>
          ) : null}
        </View>
        <GlassView
          glassEffectStyle={glass ? "regular" : "none"}
          style={[
            { borderRadius: 22, overflow: "hidden" },
            !glass && { backgroundColor: theme.secondary },
            !canUndo && { opacity: 0.35 },
          ]}
        >
          <Pressable
            accessibilityLabel="Undo last answer"
            disabled={!canUndo}
            onPress={() => void onUndo()}
            className="h-11 w-11 items-center justify-center"
          >
            <SymbolView
              name={{
                ios: "arrow.uturn.backward",
                android: "undo",
                web: "undo",
              }}
              tintColor={theme.text}
              size={17}
            />
          </Pressable>
        </GlassView>
      </View>
      <View className="flex-1 gap-3.5 px-5 pt-2">
        {showingSummary && pendingCount > 0 ? (
          <View className="w-full max-w-md flex-1 items-center justify-center gap-4 self-center">
            <Text variant="title">{"You're done for now!"}</Text>
            <Text variant="footnote" muted className="text-center">
              You have {pendingCount} {pendingCount === 1 ? "card" : "cards"} to
              review again today. Come back in{" "}
              {formatWait(nextPendingDue - now)}.
            </Text>
            <Button label="Finish review" onPress={close} />
          </View>
        ) : showingSummary ? (
          <View className="w-full max-w-md flex-1 items-center justify-center gap-4 self-center">
            <Text variant="largeTitle">{"You're done for today!"}</Text>
            <Text variant="footnote" muted className="text-center">
              Come back tomorrow to study new words.
            </Text>
            <Button label="Finish review" onPress={close} />
          </View>
        ) : current && detail ? (
          <ReviewCard
            key={`${current.wordId}-${answered}`}
            word={detail.words}
            font={settings.jpFont}
            autoplay={settings.autoplay}
            onFlip={() => {
              shownAt.current = Date.now();
            }}
            onGrade={(answer) => void onGrade(answer)}
            onUndo={() => void onUndo()}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text variant="footnote" muted>
              Loading card…
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

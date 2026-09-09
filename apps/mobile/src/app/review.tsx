import { eq } from "drizzle-orm";
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
import { Text } from "@/components/ui";
import { db } from "@/db/client";
import { cards, words } from "@/db/schema";
import { useLiveQuery } from "@/hooks/use-live-query";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import {
  buildQueue,
  getWord,
  grade,
  scheduleGrade,
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
  const currentDetail =
    useLiveQuery(
      db
        .select()
        .from(cards)
        .innerJoin(words, eq(words.id, cards.wordId))
        .where(eq(words.id, currentId)),
      ["cards"],
      [currentId],
    ).data ?? [];
  const prefetchedDetail =
    useLiveQuery(
      db
        .select()
        .from(cards)
        .innerJoin(words, eq(words.id, cards.wordId))
        .where(eq(words.id, nextId)),
      ["cards"],
      [nextId],
    ).data ?? [];
  const detail = [...currentDetail, ...prefetchedDetail].find(
    (row) => row.words.id === currentId,
  );
  const nextDetail = prefetchedDetail.find((row) => row.words.id === nextId);
  const nextAudio = nextDetail?.words.wordAudio
    ? audioAssets[nextDetail.words.wordAudio]
    : undefined;
  useAudioPlayer(nextAudio);
  const initialized = useRef(false);
  const pendingGrades = useRef<Promise<void>>(Promise.resolve());
  const shownAt = useRef(0);
  const [sessionStartedAt] = useState(() => Date.now());
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (queue.length === 0 && answered === 0) void buildQueue(db).then(begin);
  }, [answered, begin, queue.length]);
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
  const waiting =
    current?.kind === "learning" && current.due > sessionStartedAt;
  const remainingCount = queue.filter(
    (item) => item.kind !== "learning" || item.due <= sessionStartedAt,
  ).length;
  const sessionFinished = answered > 0 && (waiting || queue.length === 0);
  useEffect(() => {
    if (!sessionFinished) return;
    let active = true;
    void pendingGrades.current.then(() => {
      if (active) router.back();
    });
    return () => {
      active = false;
    };
  }, [sessionFinished]);
  const glass = isLiquidGlassAvailable();

  if (sessionFinished) {
    return <View className="flex-1 bg-background" />;
  }

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
          <Text variant="caption" muted>
            {remainingCount} left
          </Text>
          <View className="h-1 w-full max-w-[180px] flex-row overflow-hidden rounded-full bg-secondary">
            <View
              className="min-w-[2px] bg-primary"
              style={{ flex: answered }}
            />
            <View style={{ flex: remainingCount }} />
          </View>
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
        {current && detail ? (
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

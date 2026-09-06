import { eq } from "drizzle-orm";
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
import {
  buildQueue,
  getWord,
  grade,
  undo,
  type BinaryGrade,
  type QueueItem,
} from "@/scheduler";
import { useSessionStore } from "@/stores/session";

export default function ReviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const { queue, answered, startedAt, canUndo, begin, finishCard, restore } =
    useSessionStore();
  const current = queue[0];
  const currentId = current?.wordId ?? -1;
  const nextId = queue[1]?.wordId ?? -1;
  const detail = useLiveQuery(
    db
      .select()
      .from(words)
      .innerJoin(cards, eq(cards.wordId, words.id))
      .where(eq(words.id, currentId)),
    [currentId],
  ).data[0];
  const nextDetail = useLiveQuery(
    db
      .select({ wordAudio: words.wordAudio })
      .from(words)
      .where(eq(words.id, nextId)),
    [nextId],
  ).data[0];
  const nextAudio = nextDetail?.wordAudio
    ? audioAssets[nextDetail.wordAudio]
    : undefined;
  useAudioPlayer(nextAudio);
  const initialized = useRef(false);
  const shownAt = useRef(0);
  const [now, setNow] = useState(0);
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
    async (answer: BinaryGrade) => {
      if (!current) return;
      const next = await grade(
        db,
        current.wordId,
        answer,
        Date.now() - shownAt.current,
      );
      void Haptics.impactAsync(
        answer === "pass"
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );
      const learning =
        next.state === State.Learning || next.state === State.Relearning
          ? { wordId: next.wordId, kind: "learning" as const, due: next.due }
          : undefined;
      finishCard(learning);
    },
    [current, finishCard],
  );
  const onUndo = useCallback(async () => {
    if (!canUndo) return;
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
        {waiting ? (
          <View className="w-full max-w-md flex-1 items-center justify-center gap-4 self-center">
            <Text variant="title">Learning card queued</Text>
            <Text variant="footnote" muted className="text-center">
              It will return in {formatWait(current.due - now)}. You can leave
              and come back when it is ready.
            </Text>
            <Button label="Finish for now" onPress={close} />
          </View>
        ) : current && detail ? (
          <>
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
            <Text variant="caption" muted className="text-center">
              Tap to flip · swipe up to pass · swipe down to fail
            </Text>
          </>
        ) : queue.length === 0 ? (
          <View className="w-full max-w-md flex-1 items-center justify-center gap-4 self-center">
            <Text variant="label">Session complete</Text>
            <Text variant="largeTitle">Done.</Text>
            <Text variant="footnote" muted className="text-center">
              {answered} {answered === 1 ? "answer" : "answers"} in{" "}
              {formatElapsed(now - startedAt)}.
            </Text>
            <Button label="Back to home" onPress={close} />
          </View>
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

function formatWait(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1_000));
  return seconds >= 60
    ? `${Math.ceil(seconds / 60)} minutes`
    : `${seconds} seconds`;
}
function formatElapsed(ms: number) {
  const seconds = Math.max(1, Math.round(ms / 1_000));
  return seconds < 60
    ? `${seconds} seconds`
    : `${Math.round(seconds / 60)} minutes`;
}

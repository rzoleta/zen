import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useAudioPlayer } from "expo-audio";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { State } from "ts-fsrs";

import { audioAssets } from "@/assets/deck/audio-assets";
import { ReviewCard } from "@/components/review-card";
import { PrimaryButton, ZenText } from "@/components/ui";
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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <GlassView
          glassEffectStyle={glass ? "regular" : "none"}
          style={[styles.glass, !glass && { backgroundColor: theme.surface }]}
        >
          <Pressable
            accessibilityLabel="Close review"
            onPress={close}
            style={styles.iconButton}
          >
            <SymbolView
              name={{ ios: "xmark", android: "close", web: "close" }}
              tintColor={theme.text}
              size={18}
            />
          </Pressable>
        </GlassView>
        <View style={styles.count}>
          <ZenText variant="caption" muted>
            {queue.length} left
          </ZenText>
          <View
            style={[styles.track, { backgroundColor: theme.surfaceStrong }]}
          >
            <View
              style={[
                styles.fill,
                { backgroundColor: theme.accent, flex: answered },
              ]}
            />
            <View style={{ flex: queue.length }} />
          </View>
        </View>
        <GlassView
          glassEffectStyle={glass ? "regular" : "none"}
          style={[
            styles.glass,
            !glass && { backgroundColor: theme.surface },
            !canUndo && { opacity: 0.35 },
          ]}
        >
          <Pressable
            accessibilityLabel="Undo last answer"
            disabled={!canUndo}
            onPress={() => void onUndo()}
            style={styles.iconButton}
          >
            <SymbolView
              name={{
                ios: "arrow.uturn.backward",
                android: "undo",
                web: "undo",
              }}
              tintColor={theme.text}
              size={18}
            />
          </Pressable>
        </GlassView>
      </View>
      <View style={styles.content}>
        {waiting ? (
          <View style={styles.center}>
            <ZenText variant="title">Learning card queued</ZenText>
            <ZenText muted style={styles.centerText}>
              It will return in {formatWait(current.due - now)}. You can leave
              and come back when it is ready.
            </ZenText>
            <PrimaryButton label="Finish for now" onPress={close} />
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
            <ZenText variant="caption" muted style={styles.hint}>
              Tap to flip · swipe up to pass · swipe down to fail · swipe right
              to undo
            </ZenText>
          </>
        ) : queue.length === 0 ? (
          <View style={styles.center}>
            <ZenText variant="label" muted>
              Session complete
            </ZenText>
            <ZenText variant="hero">Done.</ZenText>
            <ZenText muted style={styles.centerText}>
              {answered} {answered === 1 ? "answer" : "answers"} in{" "}
              {formatElapsed(now - startedAt)}.
            </ZenText>
            <PrimaryButton label="Back to home" onPress={close} />
          </View>
        ) : (
          <View style={styles.center}>
            <ZenText muted>Loading card…</ZenText>
          </View>
        )}
      </View>
    </SafeAreaView>
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
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 16,
  },
  glass: { borderRadius: 22, overflow: "hidden" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { flex: 1, alignItems: "center", gap: 7 },
  track: {
    width: "100%",
    maxWidth: 190,
    height: 3,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
  },
  fill: { minWidth: 2 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  hint: { textAlign: "center" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    maxWidth: 420,
    alignSelf: "center",
    width: "100%",
  },
  centerText: { textAlign: "center" },
});

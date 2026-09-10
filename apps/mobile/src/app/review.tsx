import { MenuView } from "@expo/ui/community/menu";
import { eq } from "drizzle-orm";
import { useAudioPlayer } from "expo-audio";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, View } from "react-native";
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
  setKnown,
  setSuspended,
  undo,
  type BinaryGrade,
  type QueueItem,
} from "@/scheduler";
import { isReady, useSessionStore } from "@/stores/session";

export default function ReviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const {
    queue,
    answered,
    completed,
    learnAheadLimit,
    now,
    canUndo,
    begin,
    refresh,
    finishCard,
    dismissCard,
    restore,
  } = useSessionStore();
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
  const grading = useRef(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const hasPendingLearning = queue.some((item) => !isReady(item, now));
  useEffect(() => {
    if (!hasPendingLearning) return;
    refresh();
    const timer = setInterval(refresh, 1_000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [hasPendingLearning, refresh]);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (queue.length === 0 && answered === 0)
      void buildQueue(db).then((items) =>
        begin(items, settings.learnAheadLimit),
      );
  }, [answered, begin, queue.length, settings.learnAheadLimit]);
  useEffect(() => {
    shownAt.current = Date.now();
  }, [currentId, answered]);
  const close = () => router.back();
  const onGrade = useCallback(
    (answer: BinaryGrade) => {
      if (!current || !detail || grading.current) return;
      grading.current = true;
      setSaving(true);
      setSaveError(false);
      const reviewedAt = new Date();
      const durationMs = reviewedAt.getTime() - shownAt.current;
      // Save before advancing: an early retry can immediately show the same card.
      pendingGrades.current = pendingGrades.current
        .then(async () => {
          const next = await grade(
            db,
            current.wordId,
            answer,
            durationMs,
            reviewedAt,
          );
          const learning =
            next.suspended === "none" &&
            !next.known &&
            (next.state === State.Learning || next.state === State.Relearning)
              ? {
                  wordId: next.wordId,
                  kind: "learning" as const,
                  due: next.due,
                }
              : undefined;
          finishCard(learning);
        })
        .catch((gradeError: unknown) => {
          console.error("Failed to save card grade", gradeError);
          setSaveError(true);
          setRetryVersion((version) => version + 1);
        })
        .finally(() => {
          grading.current = false;
          setSaving(false);
        });
    },
    [current, detail, finishCard],
  );
  const onDismiss = useCallback(
    (action: "known" | "suspend") => {
      if (!current || !detail || grading.current) return;
      grading.current = true;
      setSaving(true);
      setSaveError(false);
      pendingGrades.current = pendingGrades.current
        .then(async () => {
          if (action === "known") await setKnown(db, current.wordId, true);
          else await setSuspended(db, current.wordId, "manual");
          dismissCard(current.wordId);
          void Haptics.selectionAsync();
        })
        .catch((error: unknown) => {
          console.error("Failed to update card status", error);
          setSaveError(true);
        })
        .finally(() => {
          grading.current = false;
          setSaving(false);
        });
    },
    [current, detail, dismissCard],
  );
  const onUndo = useCallback(() => {
    if (!canUndo || grading.current) return;
    grading.current = true;
    setSaving(true);
    setSaveError(false);
    pendingGrades.current = pendingGrades.current
      .then(async () => {
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
      })
      .catch((error: unknown) => {
        console.error("Failed to undo previous answer", error);
        setSaveError(true);
      })
      .finally(() => {
        grading.current = false;
        setSaving(false);
      });
  }, [canUndo, restore]);
  const remainingCount = queue.filter((item) =>
    isReady(item, now, learnAheadLimit),
  ).length;
  const sessionFinished =
    remainingCount === 0 && (answered > 0 || completed > 0 || queue.length > 0);
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
          isInteractive={glass}
          style={[
            { borderRadius: 22, overflow: "hidden" },
            !glass && { backgroundColor: theme.secondary },
          ]}
        >
          <Pressable
            accessibilityLabel="Close review"
            accessibilityRole="button"
            onPress={close}
            className="h-11 w-11 items-center justify-center"
            style={({ pressed }) => ({
              opacity: !glass && pressed ? 0.5 : 1,
            })}
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
              style={{ flex: completed }}
            />
            <View style={{ flex: remainingCount }} />
          </View>
        </View>
        <MenuView
          actions={[
            {
              id: "known",
              title: "Mark known",
              attributes: { disabled: saving || !detail },
            },
            {
              id: "suspend",
              title: "Suspend",
              attributes: { disabled: saving || !detail },
            },
            {
              id: "undo",
              title: "Undo previous",
              attributes: { disabled: saving || !canUndo },
            },
          ]}
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === "known") onDismiss("known");
            else if (nativeEvent.event === "suspend") onDismiss("suspend");
            else if (nativeEvent.event === "undo") onUndo();
          }}
        >
          <GlassView
            glassEffectStyle={glass ? "regular" : "none"}
            isInteractive={glass}
            style={[
              { borderRadius: 22, overflow: "hidden" },
              !glass && { backgroundColor: theme.secondary },
            ]}
          >
            <View
              accessibilityLabel="Review options"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center"
            >
              <SymbolView
                name={{
                  ios: "ellipsis",
                  android: "more_horiz",
                  web: "more_horiz",
                }}
                tintColor={theme.text}
                size={17}
              />
            </View>
          </GlassView>
        </MenuView>
      </View>
      <View className="flex-1 gap-3.5 px-5 pt-2">
        {saveError ? (
          <Text variant="footnote" className="text-destructive">
            Your change could not be saved. Please try again.
          </Text>
        ) : null}
        {current && detail ? (
          <ReviewCard
            key={`${current.wordId}-${answered}-${retryVersion}`}
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

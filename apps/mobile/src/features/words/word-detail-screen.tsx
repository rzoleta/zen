import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { State } from "ts-fsrs";
import { audioAssets } from "@/assets/deck/audio-assets";
import { FuriganaText, Screen, Text } from "@/components/ui";
import { db } from "@/db/client";
import { wordQueryOptions } from "@/data/query/queries";
import { resetCard, setKnown, setSuspended } from "@/data/study-commands";
import { cardStatus } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { confirmWordAction, type WordAction } from "@/lib/confirm-word-action";
import { formatDueDate, formatRelativeDueDate } from "@/lib/schedule-date";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wordId = Number(id);
  const query = useQuery(wordQueryOptions(wordId));
  const detail = query.data;
  const { jpFont } = useSettings();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [entryWidth, setEntryWidth] = useState(Math.min(width, 672) - 42);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const wordSource = detail?.words.wordAudio
    ? audioAssets[detail.words.wordAudio]
    : undefined;
  const sentenceSource = detail?.words.sentenceAudio
    ? audioAssets[detail.words.sentenceAudio]
    : undefined;
  const wordPlayer = useAudioPlayer(wordSource);
  const sentencePlayer = useAudioPlayer(sentenceSource);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/words");
  const perform = (action: WordAction) => {
    if (!detail || savingRef.current) return;
    confirmWordAction(action, () => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      void (async () => {
        try {
          if (action === "reset") await resetCard(db, wordId);
          else if (action === "mark-known" || action === "return-to-study")
            await setKnown(db, wordId, action === "mark-known");
          else
            await setSuspended(
              db,
              wordId,
              action === "suspend" ? "manual" : "none",
            );
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch {
          Alert.alert(
            "Could not save",
            "Your change could not be saved. Please try again.",
          );
        } finally {
          savingRef.current = false;
          setSaving(false);
        }
      })();
    });
  };
  const suspended = detail?.cards.suspended !== "none";
  const play = async (sentence: boolean) => {
    try {
      const player = sentence ? sentencePlayer : wordPlayer;
      (sentence ? wordPlayer : sentencePlayer).pause();
      await player.seekTo(0);
      player.play();
    } catch {
      Alert.alert("Could not play audio", "Please try again.");
    }
  };
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={Platform.OS === "ios" ? "xmark" : undefined}
          accessibilityLabel="Close word detail"
          onPress={close}
        >
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={Platform.OS === "ios" ? "ellipsis" : undefined}
          title="More"
          accessibilityLabel="More word actions"
          disabled={!detail || saving}
        >
          <Stack.Toolbar.MenuAction
            onPress={() => perform(suspended ? "unsuspend" : "suspend")}
          >
            {suspended ? "Unsuspend" : "Suspend"}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            destructive
            onPress={() => perform("reset")}
          >
            Reset card
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Screen
        header
        className="gap-8 px-6 pt-6"
        contentContainerClassName="pb-12"
      >
        {!detail ? (
          <View className="gap-4 py-10">
            {query.isPending ? (
              <ActivityIndicator
                accessibilityLabel="Loading word"
                color={theme.muted}
              />
            ) : (
              <>
                <Text native>
                  {query.isError
                    ? "This word could not be loaded."
                    : "Word not found."}
                </Text>
                {query.isError ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void query.refetch()}
                    className="min-h-[44px] justify-center"
                  >
                    <Text native style={{ color: theme.chartBlue }}>
                      Try again
                    </Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        ) : (
          <>
            <View
              className="gap-3"
              onLayout={(event) =>
                setEntryWidth(event.nativeEvent.layout.width)
              }
            >
              <FuriganaText
                text={detail.words.wordFurigana}
                font={jpFont}
                fontSize={Math.min(
                  48,
                  Math.max(
                    28,
                    entryWidth / Math.max(1, detail.words.word.length),
                  ),
                )}
                maxSegmentWidth={entryWidth}
                lineHeight={64}
                furiganaFontSize={16}
              />
              <View className="flex-row items-center gap-4">
                <Text native className="flex-1 text-content-title font-medium">
                  {detail.words.meaning}
                </Text>
                {wordSource ? (
                  <AudioButton
                    label="Play word pronunciation"
                    onPress={() => void play(false)}
                  />
                ) : null}
              </View>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text native muted className="text-subhead">
                  Example
                </Text>
                {sentenceSource ? (
                  <AudioButton
                    label="Play example sentence"
                    onPress={() => void play(true)}
                  />
                ) : null}
              </View>
              <FuriganaText
                text={detail.words.sentenceFurigana}
                font={jpFont}
                fontSize={24}
                maxSegmentWidth={entryWidth}
                lineHeight={38}
                furiganaFontSize={12}
              />
              <Text native muted>
                {detail.words.sentenceMeaning}
              </Text>
            </View>
            <View className="gap-2">
              <Text native muted className="px-4 text-subhead">
                Study
              </Text>
              <View className="overflow-hidden rounded-[24px] bg-muted dark:bg-secondary">
                <StudyRow
                  title="Status"
                  value={
                    detail.cards.suspended === "leech"
                      ? "Suspended · Leech"
                      : cardStatus(detail.cards).replace(/^./, (first) =>
                          first.toUpperCase(),
                        )
                  }
                  first
                />
                <StudyRow
                  title="Next review"
                  value={
                    detail.cards.known || suspended
                      ? "Not scheduled"
                      : detail.cards.state === State.New
                        ? "Not introduced"
                        : formatDueDate(new Date(detail.cards.due))
                  }
                  subtitle={
                    !detail.cards.known &&
                    !suspended &&
                    detail.cards.state !== State.New
                      ? formatRelativeDueDate(new Date(detail.cards.due))
                      : undefined
                  }
                />
                <StudyRow
                  title="Interval"
                  value={`${detail.cards.scheduledDays} ${detail.cards.scheduledDays === 1 ? "day" : "days"}`}
                />
                <StudyRow title="Reviews" value={String(detail.cards.reps)} />
                <StudyRow title="Lapses" value={String(detail.cards.lapses)} />
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() =>
                perform(detail.cards.known ? "return-to-study" : "mark-known")
              }
              className="min-h-[52px] items-center justify-center rounded-[24px] bg-secondary px-5 py-4 active:opacity-60 disabled:opacity-40"
            >
              <Text native className="font-semibold">
                {saving
                  ? "Saving…"
                  : detail.cards.known
                    ? "Return to study"
                    : "Mark known"}
              </Text>
            </Pressable>
          </>
        )}
      </Screen>
    </>
  );
}

function StudyRow({
  title,
  value,
  subtitle,
  first,
}: {
  title: string;
  value: string;
  subtitle?: string | null;
  first?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  return (
    <View>
      {!first ? <View className="ml-4 h-px bg-border" /> : null}
      <View
        className={`min-h-[52px] gap-3 px-4 py-3 ${fontScale > 1.3 ? "items-start" : "flex-row items-center justify-between"}`}
      >
        <Text native>{title}</Text>
        <View
          className={`shrink gap-1 ${fontScale > 1.3 ? "items-start" : "items-end"}`}
        >
          <Text native muted>
            {value}
          </Text>
          {subtitle ? (
            <Text native muted className="text-subhead">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function AudioButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-[44px] w-[44px] items-center justify-center rounded-full bg-muted dark:bg-secondary active:opacity-60"
    >
      <SymbolView
        name={{ ios: "speaker.wave.2", android: "volume_up", web: "volume_up" }}
        size={20}
        tintColor={theme.text}
      />
    </Pressable>
  );
}

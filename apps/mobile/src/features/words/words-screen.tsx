import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { toast } from "sonner-native";

import { Text } from "@/components/ui";
import { WordRow } from "@/features/words/components/word-row";
import { db } from "@/db/client";
import {
  resetCards,
  setKnown,
  setManyKnown,
  setManySuspended,
  setSuspended,
} from "@/data/study-commands";
import { cn } from "@/lib/cn";
import { matchesWordQuery } from "@/lib/search";
import { cardStatus, type WordStatus, useDeckRows } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { confirmWordAction } from "@/lib/confirm-word-action";

const filters: ("all" | WordStatus)[] = [
  "all",
  "new",
  "learning",
  "mature",
  "known",
  "suspended",
];

type BulkAction = "known" | "reset" | "suspend";

export default function WordsScreen() {
  const theme = useTheme();
  const { jpFont } = useSettings();
  const rows = useDeckRows();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const data = useMemo(
    () =>
      rows.filter((row) => {
        const status = cardStatus(row.cards);
        return (
          (filter === "all" || filter === status) &&
          matchesWordQuery(row.words, query)
        );
      }),
    [filter, query, rows],
  );
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const updateStatus = async (
    word: (typeof rows)[number]["words"],
    action: "known" | "suspend",
  ) => {
    if (saving.current) return;
    saving.current = true;
    setIsSaving(true);
    try {
      if (action === "known") await setKnown(db, word.id, true);
      else await setSuspended(db, word.id, "manual");
      const message =
        action === "known"
          ? `Marked ${word.word} as known`
          : `Suspended ${word.word}`;
      if (action === "known") toast.success(message);
      else toast.info(message);
      if (Platform.OS === "ios")
        AccessibilityInfo.announceForAccessibility(message);
      void Haptics.selectionAsync();
    } catch (error: unknown) {
      console.error("Failed to update card status", error);
      Alert.alert(
        "Could not save",
        "Your change could not be saved. Please try again.",
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };
  const confirmStatus = (
    word: (typeof rows)[number]["words"],
    action: "known" | "suspend",
  ) => {
    if (saving.current) return;
    confirmWordAction(
      action === "known" ? "mark-known" : "suspend",
      () => void updateStatus(word, action),
    );
  };
  const enterSelection = (wordId?: number) => {
    setSelecting(true);
    setSelectedIds(wordId === undefined ? new Set() : new Set([wordId]));
    void Haptics.selectionAsync();
  };
  const leaveSelection = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };
  const toggleSelection = (wordId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
    void Haptics.selectionAsync();
  };
  const performBulkAction = async (action: BulkAction) => {
    if (saving.current || selectedIds.size === 0) return;
    const wordIds = [...selectedIds];
    saving.current = true;
    setIsSaving(true);
    try {
      if (action === "known") await setManyKnown(db, wordIds);
      else if (action === "reset") await resetCards(db, wordIds);
      else await setManySuspended(db, wordIds);
      const count = wordIds.length;
      const noun = count === 1 ? "word" : "words";
      const message =
        action === "known"
          ? `Marked ${count} ${noun} as known`
          : action === "reset"
            ? `Reset study for ${count} ${noun}`
            : `Suspended ${count} ${noun}`;
      if (action === "suspend") toast.info(message);
      else toast.success(message);
      if (Platform.OS === "ios")
        AccessibilityInfo.announceForAccessibility(message);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      leaveSelection();
    } catch (error: unknown) {
      console.error("Failed to update selected cards", error);
      Alert.alert(
        "Could not save",
        "Your changes could not be saved. Please try again.",
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };
  const confirmBulkAction = (action: BulkAction) => {
    if (saving.current || selectedIds.size === 0) return;
    const count = selectedIds.size;
    const noun = count === 1 ? "word" : "words";
    const title =
      action === "known"
        ? `Mark ${count} ${noun} as known?`
        : action === "reset"
          ? `Reset study for ${count} ${noun}?`
          : `Suspend ${count} ${noun}?`;
    const message =
      action === "known"
        ? "The selected words will be excluded from reviews."
        : action === "reset"
          ? count === 1
            ? "Its review history and scheduling will be removed."
            : "Their review history and scheduling will be removed."
          : "The selected words will be excluded from reviews.";
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text:
            action === "known"
              ? "Mark known"
              : action === "reset"
                ? "Reset study"
                : "Suspend",
          style: action === "known" ? "default" : "destructive",
          onPress: () => void performBulkAction(action),
        },
      ],
      { cancelable: true },
    );
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: selecting ? `${selectedIds.size} selected` : "Words",
          headerSearchBarOptions: {
            placeholder: "Word, reading, or meaning",
            hideWhenScrolling: false,
            textColor: theme.text,
            onChangeText: (event) => {
              setQuery(event.nativeEvent.text);
              if (selecting) setSelectedIds(new Set());
            },
          },
        }}
      />
      <Stack.Toolbar placement="right">
        {selecting ? (
          <Stack.Toolbar.Button disabled={isSaving} onPress={leaveSelection}>
            Done
          </Stack.Toolbar.Button>
        ) : (
          <Stack.Toolbar.Menu
            icon={Platform.OS === "ios" ? "ellipsis" : undefined}
            accessibilityLabel="More word actions"
          >
            <Stack.Toolbar.MenuAction onPress={() => enterSelection()}>
              Select words
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        )}
      </Stack.Toolbar>
      <View className="flex-1 bg-background">
        <FlatList
          className="flex-1"
          data={data}
          keyExtractor={(item) => String(item.words.id)}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="w-full max-w-3xl self-center pb-16"
          ItemSeparatorComponent={WordSeparator}
          ListHeaderComponent={
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 px-5 py-3"
            >
              {filters.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setFilter(item);
                    if (selecting) setSelectedIds(new Set());
                  }}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5",
                    filter === item
                      ? "border-primary bg-primary"
                      : "border-border bg-transparent",
                  )}
                >
                  <Text
                    className={cn(
                      "capitalize text-sm",
                      filter === item
                        ? "font-sans-medium text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text muted>No words match.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <WordRow
              item={item}
              font={jpFont}
              saving={isSaving}
              selecting={selecting}
              selected={selectedIds.has(item.words.id)}
              onAction={(action) => confirmStatus(item.words, action)}
              onSelect={() =>
                selecting
                  ? toggleSelection(item.words.id)
                  : enterSelection(item.words.id)
              }
            />
          )}
        />
        {selecting ? (
          <View className="flex-row border-t border-separator bg-background px-2 py-2">
            <BulkActionButton
              label="Mark known"
              disabled={isSaving || selectedIds.size === 0}
              onPress={() => confirmBulkAction("known")}
            />
            <BulkActionButton
              label="Reset study"
              destructive
              disabled={isSaving || selectedIds.size === 0}
              onPress={() => confirmBulkAction("reset")}
            />
            <BulkActionButton
              label="Suspend"
              destructive
              disabled={isSaving || selectedIds.size === 0}
              onPress={() => confirmBulkAction("suspend")}
            />
          </View>
        ) : null}
      </View>
    </>
  );
}

function WordSeparator() {
  return <View className="mx-5 h-px bg-separator" />;
}

function BulkActionButton({
  label,
  destructive = false,
  disabled,
  onPress,
}: {
  label: string;
  destructive?: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "min-h-11 flex-1 items-center justify-center rounded-xl px-1 active:bg-secondary",
        disabled && "opacity-40",
      )}
    >
      <Text
        className={cn(
          "text-center text-sm font-sans-medium",
          destructive && "text-destructive",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

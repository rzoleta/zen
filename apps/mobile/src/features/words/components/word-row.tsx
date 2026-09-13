import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";

import { FuriganaText, Text } from "@/components/ui";
import { StatusChip } from "@/features/words/components/status-chip";
import { WordContextMenu } from "@/features/words/components/word-context-menu";
import type { JapaneseFontFace } from "@/components/ui/text";
import { cardStatus, type useDeckRows } from "@/hooks/use-deck";
import { cn } from "@/lib/cn";

type WordRowProps = {
  item: ReturnType<typeof useDeckRows>[number];
  font: JapaneseFontFace;
  saving: boolean;
  selecting: boolean;
  selected: boolean;
  onAction: (action: "known" | "reset" | "suspend") => void;
  onSelect: () => void;
};

export function WordRow({
  item,
  font,
  saving,
  selecting,
  selected,
  onAction,
  onSelect,
}: WordRowProps) {
  // The preview is laid out separately from the list, so give it the row width.
  const [width, setWidth] = useState(0);
  const status = cardStatus(item.cards);
  const content = (showSelection: boolean) => (
    <>
      {showSelection ? <SelectionIndicator selected={selected} /> : null}
      <View className="min-w-0 flex-1 gap-1">
        <FuriganaText
          text={item.words.wordFurigana}
          font={font}
          fontSize={22}
          lineHeight={30}
        />
        <Text muted numberOfLines={1}>
          {item.words.meaning}
        </Text>
      </View>
      <View className="self-stretch items-end justify-between">
        <StatusChip status={status} leech={item.cards.suspended === "leech"} />
        <Text native muted className="text-subhead">
          #{item.words.deckOrder}
        </Text>
      </View>
    </>
  );
  if (selecting) {
    return (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled: saving }}
        accessibilityLabel={`Word ${item.words.deckOrder}, ${item.words.word}, ${item.words.meaning}`}
        disabled={saving}
        onPress={onSelect}
        className={cn(
          "flex-row items-center gap-4 px-5 py-4 active:opacity-70",
          selected && "bg-secondary/60",
        )}
      >
        {content(true)}
      </Pressable>
    );
  }
  const row = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityHint="Tap to view word details. Touch and hold for word actions."
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/words/${item.words.id}`);
      }}
      className="flex-row items-center gap-4 px-5 py-4"
      style={{ width: width || undefined }}
    >
      {content(false)}
    </TouchableOpacity>
  );

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <WordContextMenu
          width={width}
          knownDisabled={saving || status === "known"}
          resetDisabled={saving}
          suspendDisabled={saving || item.cards.suspended !== "none"}
          onAction={onAction}
          onSelect={onSelect}
          preview={
            <View
              className="flex-row items-center gap-4 rounded-2xl bg-background px-5 py-4"
              style={{ width }}
            >
              {content(false)}
            </View>
          }
        >
          {row}
        </WordContextMenu>
      ) : (
        row
      )}
    </View>
  );
}

function SelectionIndicator({ selected }: { selected: boolean }) {
  return (
    <View
      className={cn(
        "h-6 w-6 items-center justify-center rounded-full border-2",
        selected ? "border-primary bg-primary" : "border-muted-foreground",
      )}
    >
      {selected ? (
        <Text className="text-sm font-sans-bold text-primary-foreground">
          ✓
        </Text>
      ) : null}
    </View>
  );
}

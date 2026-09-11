import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { StatusChip } from "@/components/status-chip";
import { FuriganaText, Text } from "@/components/ui";
import { WordContextMenu } from "@/components/word-context-menu";
import type { JapaneseFontFace } from "@/components/ui/text";
import { cardStatus, type useDeckRows } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";

type WordRowProps = {
  item: ReturnType<typeof useDeckRows>[number];
  font: JapaneseFontFace;
  saving: boolean;
  onAction: (action: "known" | "suspend") => void;
};

export function WordRow({ item, font, saving, onAction }: WordRowProps) {
  const theme = useTheme();
  // The preview is laid out separately from the list, so give it the row width.
  const [width, setWidth] = useState(0);
  const status = cardStatus(item.cards);
  const content = (
    <>
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
      <StatusChip status={status} leech={item.cards.suspended === "leech"} />
    </>
  );
  const row = (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Tap to view word details. Touch and hold for word actions."
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/words/${item.words.id}`);
      }}
      className="flex-row items-center gap-4 px-5 py-4"
      style={({ pressed }) => ({
        width: width || undefined,
        backgroundColor: pressed ? theme.secondary : theme.background,
      })}
    >
      {content}
    </Pressable>
  );

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? (
        <WordContextMenu
          width={width}
          knownDisabled={saving || status === "known"}
          suspendDisabled={saving || item.cards.suspended !== "none"}
          onAction={onAction}
          preview={
            <View
              className="flex-row items-center gap-4 rounded-2xl bg-background px-5 py-4"
              style={{ width }}
            >
              {content}
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

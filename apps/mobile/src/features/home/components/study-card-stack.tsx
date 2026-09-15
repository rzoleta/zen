import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui";
import { StudyContextMenu } from "@/features/home/components/study-context-menu";
import { useTheme } from "@/hooks/use-theme";

const CARD_ASPECT_RATIO = 1.36;

type StudyCardStackProps = {
  count: number;
  onPress: () => void;
  onStudyEndlessly: () => void;
};

export function StudyCardStack({
  count,
  onPress,
  onStudyEndlessly,
}: StudyCardStackProps) {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();
  const cardWidth = Math.min(width * 0.62, height * 0.34, 250);
  const cardHeight = cardWidth * CARD_ASPECT_RATIO;
  const frameWidth = cardWidth + 72;
  const frameHeight = cardHeight + 52;
  const cardPosition = {
    left: (frameWidth - cardWidth) / 2,
    top: (frameHeight - cardHeight) / 2,
    width: cardWidth,
    height: cardHeight,
  };

  return (
    <StudyContextMenu
      width={frameWidth}
      height={frameHeight}
      onStudyEndlessly={onStudyEndlessly}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start studying, ${count} ${count === 1 ? "card" : "cards"}`}
        accessibilityHint="Touch and hold for endless mode."
        className="items-center justify-center active:opacity-70"
        onPress={onPress}
        style={{ width: frameWidth, height: frameHeight }}
      >
        <View
          className="absolute rounded-[24px] border"
          style={[
            cardPosition,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [
                { translateX: -18 },
                { translateY: 5 },
                { rotate: "-11deg" },
              ],
            },
          ]}
        />
        <View
          className="absolute rounded-[24px] border"
          style={[
            cardPosition,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [
                { translateX: 18 },
                { translateY: 7 },
                { rotate: "9deg" },
              ],
            },
          ]}
        />
        <View
          className="absolute rounded-[24px] border"
          style={[
            cardPosition,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [
                { translateX: -7 },
                { translateY: 3 },
                { rotate: "-4deg" },
              ],
            },
          ]}
        />
        <View
          className="absolute items-center justify-center rounded-[24px] border bg-card"
          style={[
            cardPosition,
            styles.topCard,
            {
              borderColor: theme.border,
              shadowColor: "#000000",
              transform: [
                { translateX: 3 },
                { translateY: -3 },
                { rotate: "1.5deg" },
              ],
            },
          ]}
        >
          <Text className="font-sans-semibold text-8xl leading-tight tracking-tighter">
            {count}
          </Text>
          <Text muted>{count === 1 ? "card" : "cards"} to study</Text>
        </View>
      </Pressable>
    </StudyContextMenu>
  );
}

const styles = StyleSheet.create({
  topCard: {
    elevation: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
});

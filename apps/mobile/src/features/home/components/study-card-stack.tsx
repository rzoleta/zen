import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { Text } from "@/components/ui";
import { StudyContextMenu } from "@/features/home/components/study-context-menu";
import { useTheme } from "@/hooks/use-theme";

const CARD_ASPECT_RATIO = 1.36;
// Back to front. The last layer is the top card.
const LAYERS = [
  { translateX: -18, translateY: 5, rotate: -11 },
  { translateX: 18, translateY: 7, rotate: 9 },
  { translateX: -7, translateY: 3, rotate: -4 },
  { translateX: 3, translateY: -3, rotate: 1.5 },
];
const TOP_CARD_SHADOW = { offsetY: 10, radius: 18 };
const FRAME_MARGIN = 8;

/**
 * Smallest frame that contains every rotated card and the top card's
 * shadow. The iOS context menu preview clips to the frame, so anything
 * outside it disappears once the stack lifts.
 */
function frameSize(cardWidth: number, cardHeight: number) {
  let halfWidth = 0;
  let halfHeight = 0;
  LAYERS.forEach((layer, index) => {
    const angle = (Math.abs(layer.rotate) * Math.PI) / 180;
    const rotatedWidth =
      cardWidth * Math.cos(angle) + cardHeight * Math.sin(angle);
    const rotatedHeight =
      cardWidth * Math.sin(angle) + cardHeight * Math.cos(angle);
    const shadow =
      index === LAYERS.length - 1
        ? TOP_CARD_SHADOW.radius + TOP_CARD_SHADOW.offsetY
        : 0;
    halfWidth = Math.max(
      halfWidth,
      rotatedWidth / 2 + Math.abs(layer.translateX) + shadow,
    );
    halfHeight = Math.max(
      halfHeight,
      rotatedHeight / 2 + Math.abs(layer.translateY) + shadow,
    );
  });
  return {
    width: Math.ceil(2 * (halfWidth + FRAME_MARGIN)),
    height: Math.ceil(2 * (halfHeight + FRAME_MARGIN)),
  };
}

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
  const frame = frameSize(cardWidth, cardHeight);
  const cardPosition = {
    left: (frame.width - cardWidth) / 2,
    top: (frame.height - cardHeight) / 2,
    width: cardWidth,
    height: cardHeight,
  };
  const transform = (layer: (typeof LAYERS)[number]) => [
    { translateX: layer.translateX },
    { translateY: layer.translateY },
    { rotate: `${layer.rotate}deg` },
  ];

  return (
    <StudyContextMenu
      width={frame.width}
      height={frame.height}
      onStudyEndlessly={onStudyEndlessly}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start studying, ${count} ${count === 1 ? "card" : "cards"}`}
        accessibilityHint="Touch and hold for endless mode."
        className="items-center justify-center active:opacity-70"
        onPress={onPress}
        style={frame}
      >
        {LAYERS.slice(0, -1).map((layer) => (
          <View
            key={layer.rotate}
            className="absolute rounded-[24px] border"
            style={[
              cardPosition,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                transform: transform(layer),
              },
            ]}
          />
        ))}
        <View
          className="absolute items-center justify-center rounded-[24px] border bg-card"
          style={[
            cardPosition,
            styles.topCard,
            {
              borderColor: theme.border,
              shadowColor: "#000000",
              transform: transform(LAYERS[LAYERS.length - 1]),
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
    shadowOffset: { width: 0, height: TOP_CARD_SHADOW.offsetY },
    shadowOpacity: 0.12,
    shadowRadius: TOP_CARD_SHADOW.radius,
  },
});

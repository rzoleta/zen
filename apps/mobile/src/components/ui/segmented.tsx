import { useEffect, useState } from "react";
import { type LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";

interface SegmentLayout {
  width: number;
  x: number;
}

const animation = {
  duration: 180,
  easing: Easing.out(Easing.cubic),
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const theme = useTheme();
  const [layouts, setLayouts] = useState<Record<string, SegmentLayout>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const selectedLayout = layouts[value];

  useEffect(() => {
    if (!selectedLayout) return;

    if (indicatorOpacity.value === 0) {
      indicatorX.value = selectedLayout.x;
      indicatorWidth.value = selectedLayout.width;
      indicatorOpacity.value = 1;
      return;
    }

    indicatorX.value = withTiming(selectedLayout.x, animation);
    indicatorWidth.value = withTiming(selectedLayout.width, animation);
  }, [indicatorOpacity, indicatorWidth, indicatorX, selectedLayout]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const measureOption = (optionValue: T) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setLayouts((current) => {
      const previous = current[optionValue];
      if (previous?.width === width && previous.x === x) return current;
      return { ...current, [optionValue]: { width, x } };
    });
  };

  return (
    <View
      className={cn(
        "relative flex-row rounded-lg bg-secondary p-0.5",
        className,
      )}
    >
      <Animated.View
        pointerEvents="none"
        className="absolute bottom-0.5 left-0 top-0.5 rounded-[7px]"
        style={[
          {
            backgroundColor: theme.card,
            elevation: 1,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 1.5,
          },
          indicatorStyle,
        ]}
      />
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            onLayout={measureOption(option.value)}
            className="rounded-[7px] px-3 py-1.5"
            style={{ zIndex: 1 }}
          >
            <Text
              muted={!selected}
              className={cn("text-sm", selected && "font-sans-medium")}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

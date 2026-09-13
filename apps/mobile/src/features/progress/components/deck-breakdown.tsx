import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { Text } from "@/components/ui";
import type { WordStatus } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";

const statuses = ["new", "learning", "mature", "known", "suspended"] as const;
const radius = 56;
const circumference = 2 * Math.PI * radius;

export function DeckBreakdown({
  counts,
}: {
  counts: Partial<Record<WordStatus, number>>;
}) {
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(120);
  // The grouped container is bg-secondary in dark mode, so "new" and the
  // empty track need a color that stays visible on it.
  const colors = {
    new: theme.chartNeutral,
    learning: theme.chartAmber,
    mature: theme.primary,
    known: theme.chartBlue,
    suspended: theme.destructive,
  };
  const total = statuses.reduce(
    (sum, status) => sum + (counts[status] ?? 0),
    0,
  );
  const segments = statuses.map((status, index) => ({
    status,
    length: total ? ((counts[status] ?? 0) / total) * circumference : 0,
    offset: total
      ? (statuses
          .slice(0, index)
          .reduce((sum, key) => sum + (counts[key] ?? 0), 0) /
          total) *
        circumference
      : 0,
  }));
  const size = Math.min(chartWidth, 144);

  return (
    <View className="flex-row items-center gap-4">
      <View className="min-w-0 gap-2" style={{ flex: 1 }}>
        {statuses.map((status) => (
          <View key={status} className="flex-row items-center gap-3">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colors[status] }}
            />
            <Text native muted className="flex-1 capitalize">
              {status}
            </Text>
            <Text native className="tabular-nums">
              {(counts[status] ?? 0).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
      <View
        className="min-w-0 items-center justify-center"
        style={{ flex: 1 }}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`Deck total: ${total} cards`}
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 144 144"
          accessible={false}
        >
          <Circle
            cx={72}
            cy={72}
            r={radius}
            fill="none"
            stroke={theme.chartNeutral}
            strokeWidth={18}
          />
          {segments
            .filter((segment) => segment.length > 0)
            .map((segment) => (
              <Circle
                key={segment.status}
                cx={72}
                cy={72}
                r={radius}
                fill="none"
                stroke={colors[segment.status]}
                strokeWidth={18}
                strokeDasharray={[segment.length, circumference]}
                strokeDashoffset={-segment.offset}
                rotation={-90}
                origin="72, 72"
              />
            ))}
        </Svg>
        <View className="absolute items-center" pointerEvents="none">
          <Text
            native
            className="text-content-title font-semibold tabular-nums"
            maxFontSizeMultiplier={1.2}
          >
            {total.toLocaleString()}
          </Text>
          <Text
            native
            muted
            className="text-footnote"
            maxFontSizeMultiplier={1.2}
          >
            cards
          </Text>
        </View>
      </View>
    </View>
  );
}

import { View } from "react-native";

import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { currentStudyDay } from "@/scheduler";

export function Heatmap({
  timestamps,
  endAt,
}: {
  timestamps: number[];
  endAt: number;
}) {
  const theme = useTheme();
  const counts = timestamps.reduce<Record<string, number>>((all, timestamp) => {
    const key = currentStudyDay(new Date(timestamp));
    all[key] = (all[key] ?? 0) + 1;
    return all;
  }, {});
  const days = Array.from({ length: 84 }, (_, index) => {
    const date = new Date(endAt);
    date.setDate(date.getDate() - (83 - index));
    return date;
  });
  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-[5px]">
        {days.map((day) => {
          const count = counts[currentStudyDay(day)] ?? 0;
          const opacity = count === 0 ? 0.07 : Math.min(0.3 + count / 18, 1);
          return (
            <View
              key={day.toISOString()}
              accessibilityLabel={`${currentStudyDay(day)}: ${count} reviews`}
              className="h-[15px] w-[15px] rounded"
              style={{ backgroundColor: theme.primary, opacity }}
            />
          );
        })}
      </View>
      <View className="flex-row justify-between">
        <Text variant="caption" muted>
          12 weeks
        </Text>
        <Text variant="caption" muted>
          More activity →
        </Text>
      </View>
    </View>
  );
}

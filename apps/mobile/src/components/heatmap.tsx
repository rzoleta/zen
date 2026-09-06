import { StyleSheet, View } from "react-native";

import { ZenText } from "@/components/ui";
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
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {days.map((day) => {
          const count = counts[currentStudyDay(day)] ?? 0;
          const opacity = count === 0 ? 0.08 : Math.min(0.25 + count / 18, 1);
          return (
            <View
              key={day.toISOString()}
              accessibilityLabel={`${currentStudyDay(day)}: ${count} reviews`}
              style={[styles.cell, { backgroundColor: theme.accent, opacity }]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        <ZenText variant="caption" muted>
          12 weeks
        </ZenText>
        <ZenText variant="caption" muted>
          More activity →
        </ZenText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  cell: { width: 15, height: 15, borderRadius: 4 },
  legend: { flexDirection: "row", justifyContent: "space-between" },
});

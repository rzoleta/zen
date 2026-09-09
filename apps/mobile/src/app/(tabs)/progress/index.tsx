import { useEffect, useState } from "react";
import { View } from "react-native";
import { Rating, State } from "ts-fsrs";

import { Heatmap } from "@/components/heatmap";
import { Card, Screen, SectionTitle, Text } from "@/components/ui";
import { cardStatus, useDeckRows, useReviewLogs } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";
import { studyDayBounds } from "@/scheduler";

export default function ProgressScreen() {
  const theme = useTheme();
  const rows = useDeckRows();
  const logs = useReviewLogs();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);
  const today = studyDayBounds(new Date(now));
  const weekStart = now - 7 * 86_400_000;
  const daily = logs.filter((log) => log.reviewedAt >= today.start.getTime());
  const weekly = logs.filter((log) => log.reviewedAt >= weekStart);
  const reviewAnswers = logs.filter(
    (log) =>
      (JSON.parse(log.previousCard) as { state: number }).state ===
      State.Review,
  );
  const passes = reviewAnswers.filter(
    (log) => log.rating === Rating.Good,
  ).length;
  const retention = reviewAnswers.length
    ? Math.round((passes / reviewAnswers.length) * 100)
    : null;
  const statuses = rows.reduce<Record<string, number>>((all, row) => {
    const key = cardStatus(row.cards);
    all[key] = (all[key] ?? 0) + 1;
    return all;
  }, {});
  const total = Math.max(rows.length, 1);
  const time = daily.reduce((sum, log) => sum + log.durationMs, 0);
  const statusColors: Record<string, string> = {
    mature: theme.primary,
    learning: theme.chartAmber,
    known: theme.chartBlue,
    suspended: theme.destructive,
    new: theme.secondary,
  };
  return (
    <Screen header>
      <View className="flex-row gap-3">
        <Metric value={String(daily.length)} label="Today" />
        <Metric value={String(weekly.length)} label="This week" />
        <Metric
          value={retention === null ? "—" : `${retention}%`}
          label="Retention"
        />
      </View>
      <View className="gap-2">
        <SectionTitle>Review activity</SectionTitle>
        <Card>
          <Heatmap timestamps={logs.map((log) => log.reviewedAt)} endAt={now} />
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Deck</SectionTitle>
        <Card className="gap-5">
          <View className="h-2 flex-row overflow-hidden rounded-full">
            {(
              [
                "mature",
                "learning",
                "known",
                "suspended",
                "new",
              ] as const
            ).map((status) => {
              const count = statuses[status] ?? 0;
              if (!count) return null;
              return (
                <View
                  key={status}
                  style={{
                    flex: count / total,
                    backgroundColor: statusColors[status],
                  }}
                />
              );
            })}
          </View>
          <View className="flex-row flex-wrap gap-y-4">
            {(
              [
                "new",
                "learning",
                "mature",
                "known",
                "suspended",
              ] as const
            ).map((status) => (
              <View key={status} className="w-1/3 gap-0.5">
                <Text className="font-sans-medium text-[20px] leading-7">
                  {statuses[status] ?? 0}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusColors[status] }}
                  />
                  <Text variant="caption" muted className="capitalize">
                    {status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Time</SectionTitle>
        <Card className="gap-1">
          <Text className="font-sans-medium text-[28px] leading-9">
            {formatDuration(time)}
          </Text>
          <Text variant="footnote" muted>
            Studied today
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Card className="flex-1 gap-0.5 rounded-xl p-3.5">
      <Text className="font-sans-medium text-[24px] leading-8">{value}</Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </Card>
  );
}

function formatDuration(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
  return `${Math.round(ms / 60_000)} min`;
}

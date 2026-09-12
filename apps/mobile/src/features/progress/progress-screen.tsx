import { subDays } from "date-fns";
import { View } from "react-native";
import { Rating, State } from "ts-fsrs";

import { Card, Screen, SectionTitle, Text } from "@/components/ui";
import { DeckBreakdown } from "@/features/progress/components/deck-breakdown";
import { Heatmap } from "@/features/progress/components/heatmap";
import { cardStatus, useDeckRows, useReviewLogs } from "@/hooks/use-deck";
import { useStudyClock } from "@/hooks/use-study-clock";
import { studyDayBounds } from "@/domain/study";

export default function ProgressScreen() {
  const rows = useDeckRows();
  const logs = useReviewLogs();
  const { now } = useStudyClock();
  const today = studyDayBounds(new Date(now));
  const weekStart = subDays(new Date(now), 7).getTime();
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
  const time = daily.reduce((sum, log) => sum + log.durationMs, 0);
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
        <DeckBreakdown counts={statuses} />
      </View>
      <View className="gap-2">
        <SectionTitle>Time</SectionTitle>
        <Card className="gap-1">
          <Text className="font-sans-medium text-3xl">
            {formatDuration(time)}
          </Text>
          <Text muted>Studied today</Text>
        </Card>
      </View>
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Card className="flex-1 gap-0.5 rounded-xl p-3.5">
      <Text className="font-sans-medium text-2xl">{value}</Text>
      <Text muted>{label}</Text>
    </Card>
  );
}

function formatDuration(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
  return `${Math.round(ms / 60_000)} min`;
}

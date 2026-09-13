import { subDays } from "date-fns";
import type { PropsWithChildren } from "react";
import { View, useWindowDimensions } from "react-native";
import { Rating, State } from "ts-fsrs";

import { Screen, Text } from "@/components/ui";
import { DeckBreakdown } from "@/features/progress/components/deck-breakdown";
import { Heatmap } from "@/features/progress/components/heatmap";
import { cardStatus, useDeckRows, useReviewLogs } from "@/hooks/use-deck";
import { useStudyClock } from "@/hooks/use-study-clock";
import { studyDayBounds } from "@/domain/study";

export default function ProgressScreen() {
  const rows = useDeckRows();
  const logs = useReviewLogs();
  const { now } = useStudyClock();
  const { fontScale } = useWindowDimensions();
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
    <Screen header className="gap-8" contentContainerClassName="pb-12">
      <View className={fontScale > 1.3 ? "gap-3" : "flex-row gap-3"}>
        <Metric value={String(daily.length)} label="Today" />
        <Metric value={String(weekly.length)} label="This week" />
        <Metric
          value={retention === null ? "—" : `${retention}%`}
          label="Retention"
        />
      </View>
      <Group title="Review activity">
        <View className="px-4 py-4">
          <Heatmap timestamps={logs.map((log) => log.reviewedAt)} endAt={now} />
        </View>
      </Group>
      <Group title="Deck">
        <View className="px-4 py-4">
          <DeckBreakdown counts={statuses} />
        </View>
      </Group>
      <Group title="Time">
        <StatRow title="Studied today" value={formatDuration(time)} />
      </Group>
    </Screen>
  );
}

function Group({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View className="gap-2">
      <Text native muted className="px-4 text-subhead">
        {title}
      </Text>
      <View className="overflow-hidden rounded-[24px] bg-muted dark:bg-secondary">
        {children}
      </View>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 gap-0.5 rounded-2xl bg-muted px-4 py-3 dark:bg-secondary">
      <Text native className="text-content-title font-semibold tabular-nums">
        {value}
      </Text>
      <Text native muted className="text-subhead">
        {label}
      </Text>
    </View>
  );
}

function StatRow({ title, value }: { title: string; value: string }) {
  const { fontScale } = useWindowDimensions();
  return (
    <View
      className={`min-h-[52px] gap-3 px-4 py-3 ${fontScale > 1.3 ? "items-start" : "flex-row items-center justify-between"}`}
    >
      <Text native>{title}</Text>
      <Text native muted className="shrink tabular-nums">
        {value}
      </Text>
    </View>
  );
}

function formatDuration(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
  return `${Math.round(ms / 60_000)} min`;
}

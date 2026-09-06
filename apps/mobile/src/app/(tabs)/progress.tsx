import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Rating, State } from "ts-fsrs";

import { Heatmap } from "@/components/heatmap";
import { Screen, SectionTitle, Surface, ZenText } from "@/components/ui";
import { db } from "@/db/client";
import { reviewLog } from "@/db/schema";
import { cardStatus, useDeckRows } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";
import { studyDayBounds } from "@/scheduler";

export default function ProgressScreen() {
  const theme = useTheme();
  const rows = useDeckRows();
  const logs = useLiveQuery(db.select().from(reviewLog)).data ?? [];
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
  return (
    <Screen>
      <View style={styles.header}>
        <ZenText variant="title">Progress</ZenText>
        <ZenText muted>What you have done, without a streak counter.</ZenText>
      </View>
      <View style={styles.metrics}>
        <Metric value={String(daily.length)} label="today" />
        <Metric value={String(weekly.length)} label="this week" />
        <Metric
          value={retention === null ? "—" : `${retention}%`}
          label="retention"
        />
      </View>
      <SectionTitle>Review activity</SectionTitle>
      <Surface>
        <Heatmap timestamps={logs.map((log) => log.reviewedAt)} endAt={now} />
      </Surface>
      <SectionTitle>Deck</SectionTitle>
      <Surface style={styles.deck}>
        <View style={styles.progressBar}>
          {(
            [
              "mature",
              "young",
              "learning",
              "known",
              "suspended",
              "new",
            ] as const
          ).map((status) => {
            const count = statuses[status] ?? 0;
            if (!count) return null;
            const colors = {
              mature: theme.pass,
              young: theme.accent,
              learning: theme.warning,
              known: "#5C7FA3",
              suspended: theme.fail,
              new: theme.surfaceStrong,
            };
            return (
              <View
                key={status}
                style={{ flex: count / total, backgroundColor: colors[status] }}
              />
            );
          })}
        </View>
        <View style={styles.statusGrid}>
          {(
            [
              "new",
              "learning",
              "young",
              "mature",
              "known",
              "suspended",
            ] as const
          ).map((status) => (
            <View key={status} style={styles.status}>
              <ZenText style={styles.statusNumber}>
                {statuses[status] ?? 0}
              </ZenText>
              <ZenText variant="caption" muted>
                {status}
              </ZenText>
            </View>
          ))}
        </View>
      </Surface>
      <SectionTitle>Time</SectionTitle>
      <Surface>
        <ZenText style={styles.time}>{formatDuration(time)}</ZenText>
        <ZenText muted>Studied today</ZenText>
      </Surface>
    </Screen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <Surface style={styles.metric}>
      <ZenText style={styles.metricValue}>{value}</ZenText>
      <ZenText variant="caption" muted>
        {label}
      </ZenText>
    </Surface>
  );
}
function formatDuration(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
  return `${Math.round(ms / 60_000)} min`;
}
const styles = StyleSheet.create({
  header: { gap: 7, paddingTop: 12 },
  metrics: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, padding: 14, borderRadius: 18, gap: 2 },
  metricValue: { fontSize: 25, lineHeight: 32 },
  deck: { gap: 20 },
  progressBar: {
    height: 16,
    borderRadius: 99,
    overflow: "hidden",
    flexDirection: "row",
  },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 18 },
  status: { width: "33.333%" },
  statusNumber: { fontSize: 22, lineHeight: 29 },
  time: { fontSize: 32, lineHeight: 40 },
});

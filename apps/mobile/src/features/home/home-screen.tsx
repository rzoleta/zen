import * as Haptics from "expo-haptics";
import { format } from "date-fns";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { Button, Screen, Text } from "@/components/ui";
import { StudyCardStack } from "@/features/home/components/study-card-stack";
import { StudyEmptyState } from "@/features/home/components/study-empty-state";
import { useQueue } from "@/hooks/use-deck";
import { useSettings } from "@/hooks/use-settings";
import { useStudyClock } from "@/hooks/use-study-clock";
import { useSessionStore } from "@/stores/session";

export default function HomeScreen() {
  const { now, refresh } = useStudyClock();
  const { queue, pendingQueue, newCount, reviewCount } = useQueue(
    new Date(now),
  );
  const { learnAheadLimit } = useSettings();
  const begin = useSessionStore((state) => state.begin);
  useEffect(() => {
    if (pendingQueue.length === 0) return;
    const timer = setInterval(refresh, 1_000);
    return () => clearInterval(timer);
  }, [pendingQueue.length, refresh]);
  const start = () => {
    begin([...queue, ...pendingQueue], learnAheadLimit);
    router.push("/review");
  };
  const today = new Date(now);
  const weekday = format(today, "EEEE");
  const date = format(today, "MMMM d");
  return (
    <Screen scroll={false} className="flex-1 pb-6">
      <View className="flex-row items-start justify-between pt-2">
        <Text variant="largeTitle">前 Zen</Text>
        <View className="items-end gap-1 pt-1">
          <Text variant="label" className="text-right">
            {weekday}
          </Text>
          <Text variant="label" className="text-right">
            {date}
          </Text>
        </View>
      </View>
      {queue.length > 0 ? (
        <>
          <View className="flex-1 items-center justify-center">
            <StudyCardStack
              count={queue.length}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                start();
              }}
            />
            <Text muted className="mt-2">
              {reviewCount} to review · {newCount} new
            </Text>
          </View>
          <Button
            size="lg"
            label="Start studying"
            haptic={Haptics.ImpactFeedbackStyle.Medium}
            onPress={start}
          />
        </>
      ) : pendingQueue.length > 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <StudyEmptyState
            pendingCount={pendingQueue.length}
            nextDue={pendingQueue[0].due}
            now={now}
            learnAheadLimit={learnAheadLimit}
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-2">
          <StudyEmptyState
            pendingCount={0}
            now={now}
            learnAheadLimit={learnAheadLimit}
          />
        </View>
      )}
    </Screen>
  );
}

import { router } from "expo-router";
import { View } from "react-native";

import { StudyCardStack } from "@/components/study-card-stack";
import { Button, Screen, Text } from "@/components/ui";
import { useQueue } from "@/hooks/use-deck";
import { useSessionStore } from "@/stores/session";

export default function HomeScreen() {
  const { queue, newCount, reviewCount } = useQueue();
  const begin = useSessionStore((state) => state.begin);
  const start = () => {
    begin(queue);
    router.push("/review");
  };
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const date = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
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
            <StudyCardStack count={queue.length} onPress={start} />
            <Text variant="footnote" muted className="mt-2">
              {reviewCount} due · {newCount} new
            </Text>
          </View>
          <Button size="lg" label="Start studying" onPress={start} />
        </>
      ) : (
        <View className="flex-1 items-center justify-center gap-2">
          <Text variant="title">All clear</Text>
          <Text variant="footnote" muted className="text-center">
            Nothing left to study today.
          </Text>
        </View>
      )}
    </Screen>
  );
}

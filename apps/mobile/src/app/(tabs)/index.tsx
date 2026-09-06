import { router } from "expo-router";
import { View } from "react-native";

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
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <Screen scroll={false} className="flex-1 pb-6">
      <View className="pt-2">
        <Text variant="label">{today}</Text>
      </View>
      {queue.length > 0 ? (
        <>
          <View className="flex-1 items-center justify-center">
            <Text className="font-sans-semibold text-[104px] leading-[112px] tracking-tighter text-foreground">
              {queue.length}
            </Text>
            <Text muted>{queue.length === 1 ? "card" : "cards"} to study</Text>
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

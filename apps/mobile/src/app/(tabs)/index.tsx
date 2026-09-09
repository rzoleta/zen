import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { StudyCardStack } from "@/components/study-card-stack";
import { Button, JapaneseText, Screen, Text } from "@/components/ui";
import { useQueue } from "@/hooks/use-deck";
import { formatWait } from "@/lib/format-wait";
import { useSessionStore } from "@/stores/session";

export default function HomeScreen() {
  const [now, setNow] = useState(() => Date.now());
  const { queue, pendingQueue, newCount, reviewCount } = useQueue(
    new Date(now),
  );
  const begin = useSessionStore((state) => state.begin);
  useEffect(() => {
    if (pendingQueue.length === 0) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [pendingQueue.length]);
  const start = () => {
    begin([...queue, ...pendingQueue]);
    router.push("/review");
  };
  const today = new Date(now);
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
      ) : pendingQueue.length > 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <JapaneseText
            font="mincho"
            accessible={false}
            allowFontScaling={false}
            className="mb-6 text-center text-[200px] leading-[240px] text-muted-foreground/40"
          >
            空
          </JapaneseText>
          <Text variant="title">{"You're done for now!"}</Text>
          <Text variant="footnote" muted className="text-center">
            You have{" "}
            <Text
              variant="footnote"
              className="font-sans-semibold text-foreground"
            >
              {pendingQueue.length}{" "}
              {pendingQueue.length === 1 ? "card" : "cards"}
            </Text>{" "}
            to review again today{"\n"}Come back in{" "}
            <Text
              variant="footnote"
              className="font-sans-semibold text-foreground"
            >
              {formatWait(pendingQueue[0].due - now)}
            </Text>
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-2">
          <JapaneseText
            font="mincho"
            accessible={false}
            allowFontScaling={false}
            className="mb-6 text-center text-[200px] leading-[240px] text-muted-foreground/40"
          >
            空
          </JapaneseText>
          <Text variant="title">{"You're done for today!"}</Text>
          <Text variant="footnote" muted className="text-center">
            Come back tomorrow to study new words.
          </Text>
        </View>
      )}
    </Screen>
  );
}

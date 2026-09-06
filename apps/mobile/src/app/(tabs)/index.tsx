import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { PrimaryButton, Screen, Surface, ZenText } from "@/components/ui";
import { useQueue } from "@/hooks/use-deck";
import { useSessionStore } from "@/stores/session";

export default function HomeScreen() {
  const { queue, newCount, reviewCount } = useQueue();
  const begin = useSessionStore((state) => state.begin);
  const start = () => {
    begin(queue);
    router.push("/review");
  };
  return (
    <Screen>
      <View style={styles.header}>
        <ZenText variant="label" muted>
          Zen · Japanese vocabulary
        </ZenText>
        <ZenText variant="hero">今日の学習</ZenText>
        <ZenText muted>One honest queue. No streaks, no points.</ZenText>
      </View>
      <Surface style={styles.queueCard}>
        {queue.length > 0 ? (
          <>
            <ZenText variant="label" muted>
              Ready now
            </ZenText>
            <ZenText style={styles.queueNumber}>{queue.length}</ZenText>
            <ZenText muted>
              {reviewCount} reviews · {newCount} new
            </ZenText>
            <PrimaryButton label="Start review" onPress={start} />
          </>
        ) : (
          <View style={styles.done}>
            <ZenText variant="title">All done.</ZenText>
            <ZenText muted>
              There are no cards left in today&apos;s queue.
            </ZenText>
          </View>
        )}
      </Surface>
      <Surface style={styles.note}>
        <ZenText variant="caption" muted>
          Development build
        </ZenText>
        <ZenText>
          This build uses a small original deck. Kaishi content stays out until
          its redistribution rights are confirmed.
        </ZenText>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 7, paddingTop: 12 },
  queueCard: { minHeight: 330, justifyContent: "space-between", gap: 12 },
  queueNumber: { fontSize: 92, lineHeight: 104, letterSpacing: -5 },
  done: { flex: 1, justifyContent: "center", gap: 12 },
  note: { gap: 8, borderRadius: 18, padding: 18 },
});

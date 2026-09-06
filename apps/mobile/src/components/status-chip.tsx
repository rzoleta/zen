import { StyleSheet, View } from "react-native";

import { ZenText } from "@/components/ui";
import type { WordStatus } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";

export function StatusChip({
  status,
  leech,
}: {
  status: WordStatus;
  leech?: boolean;
}) {
  const theme = useTheme();
  const color =
    status === "suspended"
      ? theme.fail
      : status === "known" || status === "mature"
        ? theme.pass
        : theme.muted;
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${color}18`, borderColor: `${color}40` },
      ]}
    >
      <ZenText variant="caption" style={{ color }}>
        {leech ? "suspended (leech)" : status}
      </ZenText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
});

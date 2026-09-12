import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";

import { Text } from "@/components/ui";

export function Stepper({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      className="h-9 w-9 items-center justify-center rounded-lg bg-secondary active:opacity-60"
    >
      <Text className="font-sans-medium">{label}</Text>
    </Pressable>
  );
}

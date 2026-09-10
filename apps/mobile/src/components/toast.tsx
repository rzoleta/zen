import { useEffect } from "react";
import { AccessibilityInfo, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";

import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { useToastStore } from "@/stores/toast";

export function Toast() {
  const { message, id, dismiss } = useToastStore();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  useEffect(() => {
    if (!message) return;
    if (Platform.OS === "ios")
      AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(() => dismiss(id), 3_000);
    return () => clearTimeout(timer);
  }, [message, id, dismiss]);

  if (!message) return null;

  const content = (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: insets.bottom + 80,
        left: 24,
        right: 24,
        alignItems: "center",
      }}
    >
      <View
        style={{
          backgroundColor: theme.primary,
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 12,
          maxWidth: 360,
        }}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: theme.primaryForeground, textAlign: "center" }}
        >
          {message}
        </Text>
      </View>
    </View>
  );

  // The review screen is a native modal. Keep feedback above it and visible
  // when dismissing the last card returns to the tabs.
  return Platform.OS === "ios" ? (
    <FullWindowOverlay>{content}</FullWindowOverlay>
  ) : (
    content
  );
}

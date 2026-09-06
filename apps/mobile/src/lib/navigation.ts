import type { NativeStackNavigationOptions } from "expo-router/build/react-navigation/native-stack";
import { Platform } from "react-native";

import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Native iOS large-title header. Screens under it should use scroll views
 * with `contentInsetAdjustmentBehavior="automatic"`.
 */
export function useNativeHeaderOptions(): NativeStackNavigationOptions {
  const theme = useTheme();
  const scheme = useColorScheme();
  if (Platform.OS === "ios") {
    return {
      headerLargeTitle: true,
      headerTransparent: true,
      headerBlurEffect:
        scheme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterial",
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
      headerLargeStyle: { backgroundColor: "transparent" },
      headerTintColor: theme.text,
      headerLargeTitleStyle: { fontFamily: Fonts.semibold, color: theme.text },
      headerTitleStyle: { fontFamily: Fonts.semibold, color: theme.text },
    };
  }
  return {
    headerStyle: { backgroundColor: theme.background },
    headerShadowVisible: false,
    headerTintColor: theme.text,
    headerTitleStyle: { fontFamily: Fonts.semibold, color: theme.text },
  };
}

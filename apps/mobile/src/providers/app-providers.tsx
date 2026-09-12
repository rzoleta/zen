import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colorScheme as nativewindScheme } from "nativewind";
import { useEffect, type PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import { Colors } from "@/constants/theme";
import { queryClient } from "@/data/query/client";
import { DatabaseProvider } from "@/db/client";
import { useSettings } from "@/hooks/use-settings";

const navThemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.background,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.destructive,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.background,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.destructive,
    },
  },
};

function ThemeSync() {
  const { theme } = useSettings();
  useEffect(() => {
    nativewindScheme.set(theme);
  }, [theme]);
  return null;
}

export function AppProviders({
  scheme,
  children,
}: PropsWithChildren<{ scheme: "light" | "dark" | null | undefined }>) {
  const isDark = scheme === "dark";
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDark ? navThemes.dark : navThemes.light}>
          <DatabaseProvider>
            <ThemeSync />
            {children}
            <Toaster
              theme={isDark ? "dark" : "light"}
              position="top-center"
              duration={3_000}
              visibleToasts={1}
            />
            <StatusBar style={isDark ? "light" : "dark"} />
          </DatabaseProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

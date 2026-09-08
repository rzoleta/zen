import "@/global.css";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSerifJP_500Medium } from "@expo-google-fonts/noto-serif-jp/500Medium";
import { setAudioModeAsync } from "expo-audio";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { colorScheme as nativewindScheme } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Colors } from "@/constants/theme";
import { DatabaseProvider } from "@/db/client";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettings } from "@/hooks/use-settings";

void SplashScreen.preventAutoHideAsync();

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

export default function RootLayout() {
  const scheme = useColorScheme();
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    NotoSansJP_500Medium,
    NotoSerifJP_500Medium,
  });
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch((audioError) => {
      console.error("Failed to configure audio playback", audioError);
    });
  }, []);
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={scheme === "dark" ? navThemes.dark : navThemes.light}
      >
        <DatabaseProvider>
          <ThemeSync />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="review"
              options={{
                presentation: "fullScreenModal",
                gestureEnabled: false,
              }}
            />
          </Stack>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        </DatabaseProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

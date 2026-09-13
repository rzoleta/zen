import "@/global.css";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { NotoSansJP_500Medium } from "@expo-google-fonts/noto-sans-jp/500Medium";
import { NotoSerifJP_500Medium } from "@expo-google-fonts/noto-serif-jp/500Medium";
import { setAudioModeAsync } from "expo-audio";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { LaunchSplash } from "@/components/launch-splash";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppProviders } from "@/providers/app-providers";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const [appSettled, setAppSettled] = useState(false);
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    NotoSansJP_500Medium,
    NotoSerifJP_500Medium,
  });
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch((audioError) => {
      console.error("Failed to configure audio playback", audioError);
    });
  }, []);
  const handleAppSettled = useCallback(() => setAppSettled(true), []);
  if (!loaded && !error) return null;
  return (
    <View style={{ flex: 1 }}>
      <AppProviders onSettled={handleAppSettled} scheme={scheme}>
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
      </AppProviders>
      {appSettled && showLaunchSplash ? (
        <LaunchSplash
          scheme={scheme === "dark" ? "dark" : "light"}
          onFinish={() => setShowLaunchSplash(false)}
        />
      ) : null}
    </View>
  );
}

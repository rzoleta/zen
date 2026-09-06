import { Stack } from "expo-router";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function WordsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: Fonts.semibold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Word" }} />
    </Stack>
  );
}

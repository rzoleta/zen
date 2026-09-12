import { Stack } from "expo-router";
import { useNativeHeaderOptions } from "@/lib/navigation";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions(true)}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen
        name="japanese-font"
        options={{ title: "Japanese font", headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="scheduling"
        options={{ title: "Scheduling", headerLargeTitleEnabled: false }}
      />
    </Stack>
  );
}

import { Stack } from "expo-router";

import { useNativeHeaderOptions } from "@/lib/navigation";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions()}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
    </Stack>
  );
}

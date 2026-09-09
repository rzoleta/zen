import { Stack } from "expo-router";

import { useNativeHeaderOptions } from "@/lib/navigation";

export default function ProgressLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions()}>
      <Stack.Screen name="index" options={{ title: "Progress" }} />
    </Stack>
  );
}

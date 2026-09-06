import { Stack } from "expo-router";

import { useNativeHeaderOptions } from "@/lib/navigation";

export default function WordsLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions()}>
      <Stack.Screen name="index" options={{ title: "Words" }} />
      <Stack.Screen
        name="[id]"
        options={{ title: "", headerLargeTitle: false }}
      />
    </Stack>
  );
}

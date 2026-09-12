import { Stack } from "expo-router";

import { useNativeHeaderOptions } from "@/lib/navigation";

export default function WordsLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions()}>
      <Stack.Screen name="index" options={{ title: "Words" }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Word",
          headerLargeTitleEnabled: false,
          headerTitleStyle: { fontFamily: undefined },
          headerBackVisible: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

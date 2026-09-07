import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";

import { useNativeHeaderOptions } from "@/lib/navigation";

export default function WordsLayout() {
  return (
    <Stack screenOptions={useNativeHeaderOptions()}>
      <Stack.Screen name="index" options={{ title: "Words" }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerLargeTitleEnabled: false,
          headerBackVisible: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          headerRight: ({ tintColor }) => (
            <Pressable
              accessibilityLabel="Close word details"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.dismiss()}
              className="h-11 w-11 items-center justify-center"
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={tintColor}
                size={17}
              />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}

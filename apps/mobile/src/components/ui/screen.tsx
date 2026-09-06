import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";

import { cn } from "@/lib/cn";

cssInterop(SafeAreaView, { className: "style" });

/**
 * Screen container. With `header`, the screen sits under a native (large
 * title) header and relies on automatic content insets; without it, the top
 * safe area is padded manually.
 */
export function Screen({
  children,
  scroll = true,
  header = false,
  className,
}: PropsWithChildren<{
  scroll?: boolean;
  header?: boolean;
  className?: string;
}>) {
  const content = (
    <View
      className={cn("w-full max-w-3xl gap-6 self-center px-5 py-4", className)}
    >
      {children}
    </View>
  );
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-28"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );
  if (header) return <View className="flex-1 bg-background">{body}</View>;
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {body}
    </SafeAreaView>
  );
}

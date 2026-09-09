import type { PropsWithChildren, Ref } from "react";
import { ScrollView, type ScrollViewProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaView as NativeSafeAreaView } from "react-native-screens/experimental";
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
  backgroundClassName,
  contentContainerClassName = "pb-16",
  scrollViewRef,
  onContentSizeChange,
  bottomSafeArea = false,
}: PropsWithChildren<{
  scroll?: boolean;
  header?: boolean;
  className?: string;
  backgroundClassName?: string;
  contentContainerClassName?: string;
  scrollViewRef?: Ref<ScrollView>;
  onContentSizeChange?: ScrollViewProps["onContentSizeChange"];
  bottomSafeArea?: boolean;
}>) {
  const content = (
    <View
      className={cn("w-full max-w-3xl gap-6 self-center px-5 pt-4", className)}
    >
      {children}
    </View>
  );
  const body = scroll ? (
    <ScrollView
      ref={scrollViewRef}
      onContentSizeChange={onContentSizeChange}
      className={cn("flex-1 bg-background", backgroundClassName)}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName={contentContainerClassName}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );
  if (header && scroll) {
    // Keep the scroll viewport above native tab bars. scrollToEnd does not
    // include iOS's automatically adjusted bottom content inset.
    return bottomSafeArea ? (
      <NativeSafeAreaView edges={{ bottom: true }}>
        {body}
      </NativeSafeAreaView>
    ) : (
      body
    );
  }
  if (header)
    return (
      <View className={cn("flex-1 bg-background", backgroundClassName)}>
        {body}
      </View>
    );
  return (
    <SafeAreaView
      edges={scroll ? ["top"] : ["top", "bottom"]}
      className={cn("flex-1 bg-background", backgroundClassName)}
    >
      {body}
    </SafeAreaView>
  );
}

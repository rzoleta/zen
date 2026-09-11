import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Pressable, type PressableProps, Text } from "react-native";

import { cn } from "@/lib/cn";

const variants = {
  default: { container: "bg-primary", text: "text-primary-foreground" },
  secondary: { container: "bg-secondary", text: "text-secondary-foreground" },
  outline: {
    container: "border border-border bg-transparent",
    text: "text-foreground",
  },
  ghost: { container: "bg-transparent", text: "text-foreground" },
  destructive: {
    container: "bg-destructive",
    text: "text-destructive-foreground dark:text-white",
  },
} as const;

const sizes = {
  default: { container: "min-h-12 rounded-xl px-5 py-3", text: "text-[15px]" },
  lg: { container: "min-h-14 rounded-2xl px-6 py-4", text: "text-base" },
  sm: { container: "min-h-9 rounded-lg px-3 py-2", text: "text-[13px]" },
} as const;

export function Button({
  label,
  variant = "default",
  size = "default",
  icon,
  className,
  disabled,
  onPress,
  haptic = Haptics.ImpactFeedbackStyle.Light,
  ...props
}: Omit<PressableProps, "children"> & {
  label: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  haptic?: Haptics.ImpactFeedbackStyle | false;
}) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (haptic !== false) void Haptics.impactAsync(haptic);
        onPress?.(event);
      }}
      className={cn(
        "flex-row items-center justify-center gap-2 active:opacity-70",
        variants[variant].container,
        sizes[size].container,
        disabled && "opacity-40",
        className,
      )}
    >
      {icon}
      <Text
        className={cn(
          "shrink text-center font-sans-semibold",
          variants[variant].text,
          sizes[size].text,
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

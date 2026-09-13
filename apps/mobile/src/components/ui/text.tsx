import { Text as RNText, type TextProps } from "react-native";

import { Fonts } from "@/constants/theme";
import { cn } from "@/lib/cn";

const variants = {
  largeTitle: "font-sans-semibold text-4xl tracking-tight",
  title: "font-sans-semibold text-3xl tracking-tight",
  headline: "font-sans-semibold text-lg",
  label:
    "font-sans-medium text-xs uppercase tracking-widest text-muted-foreground",
} as const;

export type TextVariant = keyof typeof variants;

export function Text({
  variant,
  muted,
  native = false,
  className,
  style,
  ...props
}: TextProps & { variant?: TextVariant; muted?: boolean; native?: boolean }) {
  return (
    <RNText
      {...props}
      className={cn(
        native
          ? "font-ui text-body text-foreground"
          : "font-sans text-base text-foreground",
        variant && variants[variant],
        muted && "text-muted-foreground",
        className,
      )}
      style={[native && { fontFamily: Fonts.ui }, style]}
    />
  );
}

export type JapaneseFontFace = "mincho" | "gothic";

export function JapaneseText({
  font = "gothic",
  className,
  style,
  ...props
}: TextProps & { font?: JapaneseFontFace }) {
  return (
    <RNText
      {...props}
      className={cn("text-foreground", className)}
      style={[
        { fontFamily: font === "mincho" ? Fonts.mincho : Fonts.gothic },
        style,
      ]}
    />
  );
}

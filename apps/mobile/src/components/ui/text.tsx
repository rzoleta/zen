import { Text as RNText, type TextProps } from "react-native";

import { Fonts } from "@/constants/theme";
import { cn } from "@/lib/cn";

const variants = {
  largeTitle:
    "font-sans-semibold text-[34px] leading-[41px] tracking-tight text-foreground",
  title:
    "font-sans-semibold text-[28px] leading-[34px] tracking-tight text-foreground",
  headline: "font-sans-semibold text-[17px] leading-[22px] text-foreground",
  body: "font-sans text-[17px] leading-6 text-foreground",
  footnote: "font-sans text-[13px] leading-[18px] text-foreground",
  caption: "font-sans text-xs leading-4 text-foreground",
  label:
    "font-sans-medium text-xs uppercase tracking-widest text-muted-foreground",
} as const;

export type TextVariant = keyof typeof variants;

export function Text({
  variant = "body",
  muted,
  className,
  ...props
}: TextProps & { variant?: TextVariant; muted?: boolean }) {
  return (
    <RNText
      {...props}
      className={cn(
        variants[variant],
        muted && "text-muted-foreground",
        className,
      )}
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

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#171A17",
    muted: "#6D726B",
    background: "#F4F1EA",
    surface: "#FEFCF7",
    surfaceStrong: "#E9E6DD",
    line: "#DAD6CC",
    accent: "#697565",
    accentText: "#FFFFFF",
    pass: "#3D7657",
    fail: "#A14D47",
    warning: "#9A6B2F",
    tint: "#697565",
  },
  dark: {
    text: "#F1F0EB",
    muted: "#A4A89F",
    background: "#111311",
    surface: "#1A1D1A",
    surfaceStrong: "#252925",
    line: "#343934",
    accent: "#A9B8A4",
    accentText: "#101310",
    pass: "#79B58E",
    fail: "#DB8179",
    warning: "#D4A766",
    tint: "#A9B8A4",
  },
} as const;

export const Fonts = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  mincho: "NotoSerifJP_500Medium",
  gothic: "NotoSansJP_500Medium",
  mono: Platform.select({ ios: "ui-monospace", default: "monospace" }),
} as const;
export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;
export const MaxContentWidth = 760;
export const BottomTabInset =
  Platform.select({ ios: 58, android: 76, default: 64 }) ?? 64;

import { Platform } from "react-native";

// Vercel-style neutral palette, converted from vercel.css (oklch → hex).
// NativeWind classes cover most styling; these values exist for native-only
// props (Switch, Slider, SF Symbols, navigation themes).
export const Colors = {
  light: {
    text: "#000000",
    muted: "#525252",
    background: "#fcfcfc",
    card: "#ffffff",
    groupedBackground: "#f5f5f5",
    groupedCard: "#ffffff",
    secondary: "#ebebeb",
    border: "#e4e4e4",
    primary: "#000000",
    primaryForeground: "#ffffff",
    destructive: "#dc2626",
    chartAmber: "#ffae04",
    chartBlue: "#2d62ef",
    chartNeutral: "#a4a4a4",
  },
  dark: {
    text: "#ffffff",
    muted: "#a4a4a4",
    background: "#000000",
    card: "#090909",
    groupedBackground: "#000000",
    groupedCard: "#222222",
    secondary: "#222222",
    border: "#242424",
    primary: "#ffffff",
    primaryForeground: "#000000",
    destructive: "#dc2626",
    chartAmber: "#ffae04",
    chartBlue: "#2671f4",
    chartNeutral: "#747474",
  },
} as const;

export const Fonts = {
  ui: Platform.select({ ios: "system-ui", default: "sans-serif" }),
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
  mincho: "NotoSerifJP_500Medium",
  gothic: "NotoSansJP_500Medium",
  // SwiftUI resolves registered PostScript names, not Expo's font aliases.
  minchoPostScript: "NotoSerifJP-Medium",
  gothicPostScript: "NotoSansJP-Medium",
  mono: Platform.select({ ios: "ui-monospace", default: "monospace" }),
} as const;

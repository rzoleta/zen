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
    secondary: "#ebebeb",
    border: "#e4e4e4",
    primary: "#000000",
    primaryForeground: "#ffffff",
    destructive: "#e54b4f",
    chartAmber: "#ffae04",
    chartBlue: "#2d62ef",
  },
  dark: {
    text: "#ffffff",
    muted: "#a4a4a4",
    background: "#000000",
    card: "#0a0a0a",
    secondary: "#222222",
    border: "#242424",
    primary: "#ffffff",
    primaryForeground: "#000000",
    destructive: "#ff5b5b",
    chartAmber: "#ffae04",
    chartBlue: "#2671f4",
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

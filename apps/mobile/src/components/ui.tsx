import { type PropsWithChildren, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BottomTabInset,
  Fonts,
  MaxContentWidth,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Screen({
  children,
  scroll = true,
}: PropsWithChildren<{ scroll?: boolean }>) {
  const theme = useTheme();
  const content = <View style={styles.screenContent}>{children}</View>;
  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

type ZenTextProps = TextProps & {
  variant?: "body" | "caption" | "title" | "hero" | "label";
  muted?: boolean;
};
export function ZenText({
  variant = "body",
  muted,
  style,
  ...props
}: ZenTextProps) {
  const theme = useTheme();
  const variantStyle = variant === "body" ? undefined : styles[variant];
  return (
    <Text
      {...props}
      style={[
        styles.text,
        variantStyle,
        { color: muted ? theme.muted : theme.text },
        style,
      ]}
    />
  );
}

export function JapaneseText({
  font = "mincho",
  style,
  ...props
}: TextProps & { font?: "mincho" | "gothic" }) {
  const theme = useTheme();
  return (
    <Text
      {...props}
      style={[
        styles.japanese,
        {
          color: theme.text,
          fontFamily: font === "mincho" ? Fonts.mincho : Fonts.gothic,
        },
        style,
      ]}
    />
  );
}

export function Surface({
  children,
  style,
  ...props
}: PropsWithChildren<ViewProps>) {
  const theme = useTheme();
  return (
    <View
      {...props}
      style={[
        styles.surface,
        { backgroundColor: theme.surface, borderColor: theme.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.primaryButton,
        { backgroundColor: theme.accent },
        disabled && styles.disabled,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: theme.accentText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <ZenText variant="label" muted style={styles.sectionTitle}>
      {children}
    </ZenText>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.line }]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: BottomTabInset + 32 },
  screenContent: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    gap: Spacing.five,
  },
  text: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  hero: {
    fontFamily: Fonts.semibold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.4,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  japanese: { fontSize: 34, lineHeight: 48 },
  surface: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.five,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
  },
  buttonText: { fontFamily: Fonts.semibold, fontSize: 16 },
  disabled: { opacity: 0.4 },
  sectionTitle: { marginLeft: 4, marginBottom: -12 },
  divider: { height: StyleSheet.hairlineWidth, width: "100%" },
});

import Slider from "@react-native-community/slider";
import { SymbolView } from "expo-symbols";
import { Children, Fragment, useState, type PropsWithChildren } from "react";
import { Pressable, Switch, View, useWindowDimensions } from "react-native";
import { JapaneseText, Screen, Select, Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import type {
  ChoiceProps,
  FontOptionProps,
  GroupProps,
  NumberProps,
  RangeProps,
  RowProps,
  ToggleProps,
} from "./settings-controls.types";

export function SettingsForm({ children }: PropsWithChildren) {
  return (
    <Screen
      header
      backgroundClassName="bg-background"
      className="gap-8"
      contentContainerClassName="pb-12"
    >
      {children}
    </Screen>
  );
}
export function SettingsGroup({ title, footer, children }: GroupProps) {
  const items = Children.toArray(children);
  return (
    <View className="gap-2">
      {title ? (
        <Text native muted className="px-4 text-subhead">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-[24px] bg-muted dark:bg-secondary">
        {items.map((child, index) => (
          <Fragment key={index}>
            {index > 0 ? <View className="ml-4 h-px bg-separator" /> : null}
            {child}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text native muted className="px-4 text-footnote">
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
function Row({ title, children }: PropsWithChildren<{ title: string }>) {
  const { fontScale } = useWindowDimensions();
  return (
    <View
      className={`min-h-[52px] gap-3 px-4 py-3 ${fontScale > 1.3 ? "items-start" : "flex-row items-center"}`}
    >
      <Text native className="flex-1">
        {title}
      </Text>
      {children}
    </View>
  );
}
export function SettingsRow({
  title,
  value,
  onPress,
  destructive,
  disabled,
}: RowProps) {
  const theme = useTheme();
  const content = (
    <View className="min-h-[52px] flex-row items-center gap-3 px-4 py-3">
      <Text
        native
        className={`flex-1 ${destructive ? "text-destructive" : ""}`}
      >
        {title}
      </Text>
      {value ? (
        <Text native muted className="shrink">
          {value}
        </Text>
      ) : null}
      {onPress && !destructive ? (
        <SymbolView
          name={{
            ios: "chevron.right",
            android: "chevron_right",
            web: "chevron_right",
          }}
          size={18}
          tintColor={theme.muted}
        />
      ) : null}
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className="active:opacity-60 disabled:opacity-40"
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}
export function SettingsChoice<T extends string>({
  title,
  ...props
}: ChoiceProps<T>) {
  return (
    <Row title={title}>
      <Select label={title} {...props} />
    </Row>
  );
}
export function SettingsToggle({ title, value, onChange }: ToggleProps) {
  const theme = useTheme();
  return (
    <Row title={title}>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.chartBlue, false: theme.secondary }}
      />
    </Row>
  );
}
export function SettingsNumber({
  title,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: NumberProps) {
  return (
    <Row title={title}>
      <View className="flex-row items-center gap-3">
        <Text native className="tabular-nums">
          {value}
          {unit}
        </Text>
        <View className="flex-row overflow-hidden rounded-lg bg-muted dark:bg-accent">
          {[-1, 1].map((direction) => (
            <Pressable
              key={direction}
              accessibilityRole="button"
              accessibilityLabel={`${direction === -1 ? "Decrease" : "Increase"} ${title}`}
              disabled={
                direction === -1
                  ? value <= min
                  : max !== undefined && value >= max
              }
              onPress={() =>
                onChange(
                  Math.max(
                    min,
                    Math.min(max ?? Infinity, value + direction * step),
                  ),
                )
              }
              className="h-[44px] w-[44px] items-center justify-center active:bg-secondary disabled:opacity-30 dark:active:bg-muted"
            >
              <Text native>{direction === -1 ? "−" : "+"}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Row>
  );
}
export function SettingsRange({
  title,
  value,
  min,
  max,
  step,
  onChange,
}: RangeProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<number | null>(null);
  return (
    <View className="gap-3 px-4 py-4">
      <View className="flex-row justify-between gap-3">
        <Text native>{title}</Text>
        <Text native>{Math.round((draft ?? value) * 100)}%</Text>
      </View>
      <Slider
        accessibilityLabel={title}
        value={draft ?? value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={setDraft}
        onSlidingComplete={(next) => {
          void Promise.resolve(onChange(next)).finally(() => setDraft(null));
        }}
        minimumTrackTintColor={theme.chartBlue}
        maximumTrackTintColor={theme.secondary}
      />
    </View>
  );
}
export function SettingsFontOption({
  font,
  selected,
  onPress,
}: FontOptionProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className="min-h-[96px] flex-row items-center gap-4 px-4 py-4 active:opacity-60"
    >
      <View className="flex-1 gap-2">
        <Text native>{font === "gothic" ? "Gothic" : "Mincho"}</Text>
        <JapaneseText font={font} style={{ fontSize: 24, lineHeight: 36 }}>
          日本語を学ぶ
        </JapaneseText>
      </View>
      {selected ? (
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          size={20}
          tintColor={theme.chartBlue}
        />
      ) : null}
    </Pressable>
  );
}

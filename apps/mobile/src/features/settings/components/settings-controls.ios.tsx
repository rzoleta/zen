import {
  Button,
  Form,
  Host,
  HStack,
  Image,
  Picker,
  Section,
  Slider,
  Spacer,
  Text,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  contentShape,
  shapes,
  tint,
  background,
  disabled,
  font,
  foregroundStyle,
  frame,
  glassEffect,
  listRowBackground,
  monospacedDigit,
  pickerStyle,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import type { PropsWithChildren } from "react";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const theme = useTheme();
  const scheme = useColorScheme();
  return (
    <Host
      style={{ flex: 1 }}
      colorScheme={scheme === "dark" ? "dark" : "light"}
      seedColor={theme.chartBlue}
    >
      <Form
        modifiers={[
          scrollContentBackground("hidden"),
          background(theme.background),
          font({ textStyle: "body" }),
          foregroundStyle(theme.text),
        ]}
      >
        {children}
      </Form>
    </Host>
  );
}

export function SettingsGroup({ title, footer, children }: GroupProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  return (
    <Section
      header={
        title ? (
          <Text
            modifiers={[
              font({ textStyle: "subheadline" }),
              foregroundStyle(theme.muted),
            ]}
          >
            {title}
          </Text>
        ) : undefined
      }
      footer={
        footer ? (
          <Text
            modifiers={[
              font({ textStyle: "footnote" }),
              foregroundStyle(theme.muted),
            ]}
          >
            {footer}
          </Text>
        ) : undefined
      }
      modifiers={[
        listRowBackground(
          scheme === "dark" ? theme.groupedCard : theme.groupedBackground,
        ),
      ]}
    >
      {children}
    </Section>
  );
}

export function SettingsRow({
  title,
  value,
  onPress,
  destructive,
  disabled: isDisabled,
}: RowProps) {
  const theme = useTheme();
  const content = (
    <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
      <Text
        modifiers={[
          foregroundStyle(destructive ? theme.destructive : theme.text),
        ]}
      >
        {title}
      </Text>
      <Spacer />
      {value ? (
        <Text modifiers={[foregroundStyle(theme.muted)]}>{value}</Text>
      ) : null}
      {onPress && !destructive ? (
        <Image systemName="chevron.right" size={12} color={theme.muted} />
      ) : null}
    </HStack>
  );
  return onPress ? (
    <Button
      onPress={onPress}
      role={destructive ? "destructive" : "default"}
      modifiers={[
        buttonStyle("plain"),
        foregroundStyle(destructive ? theme.destructive : theme.text),
        disabled(!!isDisabled),
      ]}
    >
      {content}
    </Button>
  ) : (
    content
  );
}

export function SettingsChoice<T extends string>({
  title,
  value,
  options,
  onChange,
}: ChoiceProps<T>) {
  const theme = useTheme();
  return (
    <Picker
      label={title}
      selection={value}
      onSelectionChange={onChange}
      modifiers={[pickerStyle("menu"), tint(theme.muted)]}
    >
      {options.map((option) => (
        <Text key={option.value} modifiers={[tag(option.value)]}>
          {option.label}
        </Text>
      ))}
    </Picker>
  );
}

export function SettingsToggle({ title, value, onChange }: ToggleProps) {
  return <Toggle label={title} isOn={value} onIsOnChange={onChange} />;
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
  const theme = useTheme();
  const clamp = (next: number) =>
    Math.max(min, Math.min(max ?? Number.MAX_SAFE_INTEGER, next));
  const actions = [
    {
      label: `Decrease ${title}`,
      systemName: "minus",
      enabled: value > min,
      next: value - step,
    },
    {
      label: `Increase ${title}`,
      systemName: "plus",
      enabled: max === undefined || value < max,
      next: value + step,
    },
  ] as const;
  return (
    <HStack spacing={12}>
      <Text modifiers={[monospacedDigit()]}>{`${title}: ${value}${unit}`}</Text>
      <Spacer />
      <HStack spacing={4}>
        {actions.map((action) => (
          <Button
            key={action.systemName}
            onPress={() => onChange(clamp(action.next))}
            modifiers={[
              buttonStyle("plain"),
              disabled(!action.enabled),
              accessibilityLabel(action.label),
              frame({ width: 36, height: 36 }),
              glassEffect({ glass: { variant: "regular", interactive: true } }),
            ]}
          >
            <Image systemName={action.systemName} size={15} color={theme.text} />
          </Button>
        ))}
      </HStack>
    </HStack>
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
  return (
    <VStack alignment="leading" spacing={8}>
      <HStack>
        <Text>{title}</Text>
        <Spacer />
        <Text>{`${Math.round(value * 100)}%`}</Text>
      </HStack>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        modifiers={[accessibilityLabel(title)]}
        // Persist value changes from touch and accessibility adjustments alike.
        onValueChange={onChange}
      />
    </VStack>
  );
}

export function SettingsFontOption({
  font: face,
  selected,
  onPress,
}: FontOptionProps) {
  const theme = useTheme();
  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle("plain"),
        accessibilityLabel(
          `${face === "gothic" ? "Gothic" : "Mincho"}${selected ? ", selected" : ""}`,
        ),
      ]}
    >
      <HStack spacing={16} modifiers={[contentShape(shapes.rectangle())]}>
        <VStack alignment="leading" spacing={8}>
          <Text modifiers={[foregroundStyle(theme.text)]}>
            {face === "gothic" ? "Gothic" : "Mincho"}
          </Text>
          <Text
            modifiers={[
              font({
                family:
                  face === "gothic"
                    ? Fonts.gothicPostScript
                    : Fonts.minchoPostScript,
                size: 24,
                textStyle: "title2",
              }),
              foregroundStyle(theme.text),
            ]}
          >
            日本語を学ぶ
          </Text>
        </VStack>
        <Spacer />
        {selected ? (
          <Image systemName="checkmark" size={19} color={theme.chartBlue} />
        ) : null}
      </HStack>
    </Button>
  );
}

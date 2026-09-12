import { Host, Picker, Text } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  font,
  labelsHidden,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  const scheme = useColorScheme();
  return (
    <Host
      matchContents
      colorScheme={scheme === "dark" ? "dark" : "light"}
      seedColor={theme.muted}
    >
      <Picker
        label={label}
        selection={value}
        onSelectionChange={onChange}
        modifiers={[
          pickerStyle("menu"),
          labelsHidden(),
          font({ textStyle: "body" }),
          accessibilityLabel(label),
        ]}
      >
        {options.map((option) => (
          <Text key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}

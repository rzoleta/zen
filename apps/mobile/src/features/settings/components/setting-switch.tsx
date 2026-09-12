import * as Haptics from "expo-haptics";
import { Switch } from "react-native";

type SwitchTheme = {
  chartBlue: string;
  secondary: string;
};

export function SettingSwitch({
  label,
  value,
  theme,
  onChange,
}: {
  label: string;
  value: boolean;
  theme: SwitchTheme;
  onChange: (value: boolean) => void;
}) {
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      style={{ alignSelf: "center" }}
      onValueChange={(nextValue) => {
        void Haptics.selectionAsync();
        onChange(nextValue);
      }}
      trackColor={{ true: theme.chartBlue, false: theme.secondary }}
      ios_backgroundColor={theme.secondary}
    />
  );
}

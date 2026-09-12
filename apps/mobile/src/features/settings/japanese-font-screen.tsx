import {
  SettingsFontOption,
  SettingsForm,
  SettingsGroup,
} from "./components/settings-controls";
import { useSettingsActions } from "./use-settings-actions";
import { useSettings } from "@/hooks/use-settings";

export default function JapaneseFontScreen() {
  const { jpFont } = useSettings();
  const { save } = useSettingsActions();
  return (
    <SettingsForm>
      <SettingsGroup footer="Used for Japanese words, sentences, and furigana throughout Zen.">
        <SettingsFontOption
          font="gothic"
          selected={jpFont === "gothic"}
          onPress={() => save("jp_font", "gothic")}
        />
        <SettingsFontOption
          font="mincho"
          selected={jpFont === "mincho"}
          onPress={() => save("jp_font", "mincho")}
        />
      </SettingsGroup>
    </SettingsForm>
  );
}

import Constants from "expo-constants";
import { router } from "expo-router";
import { Linking } from "react-native";
import {
  SettingsChoice,
  SettingsForm,
  SettingsGroup,
  SettingsNumber,
  SettingsRow,
  SettingsToggle,
} from "./components/settings-controls";
import { useSettingsActions } from "./use-settings-actions";
import { useSettings, type CardContent } from "@/hooks/use-settings";

const cardContentOptions: { value: CardContent; label: string }[] = [
  { value: "word", label: "Word" },
  { value: "sentence", label: "Sentence" },
  { value: "word_sentence", label: "Word + Sentence" },
];

const privacyPolicyUrl = "https://zenflashcards.app/privacy";
const termsOfUseUrl =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

export default function SettingsScreen() {
  const values = useSettings();
  const { save, confirmReset, resetting } = useSettingsActions();
  return (
    <SettingsForm>
      <SettingsGroup
        title="Appearance"
        footer="System appearance follows your device setting."
      >
        <SettingsChoice
          title="Theme"
          value={values.theme}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          onChange={(value) => save("theme", value)}
        />
        <SettingsRow
          title="Japanese font"
          value={values.jpFont === "gothic" ? "Gothic" : "Mincho"}
          onPress={() => router.push("/settings/japanese-font")}
        />
      </SettingsGroup>
      <SettingsGroup title="Daily review">
        <SettingsNumber
          title="New cards per day"
          value={values.newPerDay}
          min={0}
          max={50}
          onChange={(value) => save("new_per_day", value)}
        />
        <SettingsRow
          title="Advanced scheduling"
          onPress={() => router.push("/settings/scheduling")}
        />
      </SettingsGroup>
      <SettingsGroup title="Cards">
        <SettingsChoice
          title="Front content"
          value={values.cardFront}
          options={cardContentOptions}
          onChange={(value) => save("card_front", value)}
        />
        <SettingsChoice
          title="Back content"
          value={values.cardBack}
          options={cardContentOptions}
          onChange={(value) => save("card_back", value)}
        />
        <SettingsToggle
          title="Highlight word in sentence"
          value={values.highlightWord}
          onChange={(value) => save("highlight_word", value)}
        />
      </SettingsGroup>
      <SettingsGroup
        title="Audio"
        footer="Autoplay plays the word when you reveal a card's answer."
      >
        <SettingsToggle
          title="Word audio"
          value={values.wordAudio}
          onChange={(value) => save("word_audio", value)}
        />
        <SettingsToggle
          title="Autoplay word audio"
          value={values.autoplay}
          onChange={(value) => save("autoplay", value)}
        />
      </SettingsGroup>
      <SettingsGroup
        title="Data"
      >
        <SettingsRow
          title="Reset settings"
          destructive
          disabled={resetting}
          onPress={() => confirmReset(false)}
        />
        <SettingsRow
          title="Reset all progress"
          destructive
          disabled={resetting}
          onPress={() => confirmReset(true)}
        />
      </SettingsGroup>
      <SettingsGroup title="Legal"
        footer={`Zen · Version ${Constants.expoConfig?.version ?? "1.0.0"}`}
      >
        <SettingsRow
          title="Privacy Policy"
          onPress={() => void Linking.openURL(privacyPolicyUrl)}
        />
        <SettingsRow
          title="Terms of Use"
          onPress={() => void Linking.openURL(termsOfUseUrl)}
        />
      </SettingsGroup>
    </SettingsForm>
  );
}

import {
  SettingsForm,
  SettingsGroup,
  SettingsNumber,
  SettingsRange,
} from "./components/settings-controls";
import { useSettingsActions } from "./use-settings-actions";
import { useSettings } from "@/hooks/use-settings";

export default function SchedulingScreen() {
  const values = useSettings();
  const { save } = useSettingsActions();
  return (
    <SettingsForm>
      <SettingsGroup
        title="Difficult cards"
        footer="Suspend a card after this many lapses. A lapse is a forgotten answer on a review card."
      >
        <SettingsNumber
          title="Leech threshold"
          value={values.leechThreshold}
          min={1}
          onChange={(value) => save("leech_threshold", value)}
        />
      </SettingsGroup>
      <SettingsGroup
        title="Learn ahead"
        footer="Include learning cards due within this many minutes in the current queue. Set to 0 to wait until they are due."
      >
        <SettingsNumber
          title="Learn ahead limit"
          value={values.learnAheadLimit}
          min={0}
          step={5}
          unit=" min"
          onChange={(value) => save("learn_ahead_limit", value)}
        />
      </SettingsGroup>
      <SettingsGroup
        title="Memory target"
        footer="Your target chance of remembering a word at its next review. Higher retention schedules more frequent reviews."
      >
        <SettingsRange
          title="Desired retention"
          value={values.desiredRetention}
          min={0.8}
          max={0.95}
          step={0.01}
          onChange={(value) => save("desired_retention", value.toFixed(2))}
        />
      </SettingsGroup>
    </SettingsForm>
  );
}

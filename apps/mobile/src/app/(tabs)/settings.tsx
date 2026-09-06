import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";

import {
  Divider,
  Screen,
  SectionTitle,
  Surface,
  ZenText,
} from "@/components/ui";
import { db } from "@/db/client";
import { useSettings, updateSetting } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { resetAllProgress } from "@/scheduler";

export default function SettingsScreen() {
  const theme = useTheme();
  const values = useSettings();
  const reset = () =>
    Alert.alert(
      "Reset all progress?",
      "This removes every review and returns all cards to new. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset everything",
          style: "destructive",
          onPress: () => void resetAllProgress(db),
        },
      ],
    );
  return (
    <Screen>
      <View style={styles.header}>
        <ZenText variant="title">Settings</ZenText>
        <ZenText muted>Keep the method simple. Tune only what matters.</ZenText>
      </View>
      <SectionTitle>Daily review</SectionTitle>
      <Surface style={styles.group}>
        <View style={styles.setting}>
          <View style={styles.settingCopy}>
            <ZenText>New cards per day</ZenText>
            <ZenText variant="caption" muted>
              Added after every due review
            </ZenText>
          </View>
          <View style={styles.stepper}>
            <Pressable
              onPress={() =>
                void updateSetting(
                  "new_per_day",
                  String(Math.max(0, values.newPerDay - 1)),
                )
              }
              style={[
                styles.stepButton,
                { backgroundColor: theme.surfaceStrong },
              ]}
            >
              <ZenText>−</ZenText>
            </Pressable>
            <ZenText style={styles.stepValue}>{values.newPerDay}</ZenText>
            <Pressable
              onPress={() =>
                void updateSetting(
                  "new_per_day",
                  String(Math.min(50, values.newPerDay + 1)),
                )
              }
              style={[
                styles.stepButton,
                { backgroundColor: theme.surfaceStrong },
              ]}
            >
              <ZenText>+</ZenText>
            </Pressable>
          </View>
        </View>
        <Divider />
        <View style={styles.sliderSetting}>
          <View style={styles.settingTitle}>
            <ZenText>Desired retention</ZenText>
            <ZenText>{Math.round(values.desiredRetention * 100)}%</ZenText>
          </View>
          <Slider
            minimumValue={0.8}
            maximumValue={0.95}
            step={0.01}
            value={values.desiredRetention}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor={theme.surfaceStrong}
            thumbTintColor={theme.accent}
            onSlidingComplete={(value) =>
              void updateSetting("desired_retention", value.toFixed(2))
            }
          />
          <ZenText variant="caption" muted>
            Applies to future scheduling. Existing due dates do not move.
          </ZenText>
        </View>
      </Surface>
      <SectionTitle>Card</SectionTitle>
      <Surface style={styles.group}>
        <SettingRow
          title="Autoplay word audio"
          description="Plays after the card flips"
          control={
            <Switch
              value={values.autoplay}
              onValueChange={(value) =>
                void updateSetting("autoplay", String(value))
              }
              trackColor={{ true: theme.accent }}
            />
          }
        />
        <Divider />
        <View style={styles.setting}>
          <View style={styles.settingCopy}>
            <ZenText>Japanese font</ZenText>
            <ZenText variant="caption" muted>
              Used for words and sentences
            </ZenText>
          </View>
          <View
            style={[styles.segment, { backgroundColor: theme.surfaceStrong }]}
          >
            {(["mincho", "gothic"] as const).map((font) => (
              <Pressable
                key={font}
                onPress={() => void updateSetting("jp_font", font)}
                style={[
                  styles.segmentButton,
                  values.jpFont === font && { backgroundColor: theme.surface },
                ]}
              >
                <ZenText variant="caption">
                  {font === "mincho" ? "Mincho" : "Gothic"}
                </ZenText>
              </Pressable>
            ))}
          </View>
        </View>
      </Surface>
      <SectionTitle>About</SectionTitle>
      <Surface style={styles.about}>
        <ZenText variant="title">Zen</ZenText>
        <ZenText muted>
          Version {Constants.expoConfig?.version ?? "1.0.0"}
        </ZenText>
        <Divider />
        <ZenText>
          Built around FSRS with pass and fail grading. Uses Expo, Drizzle ORM,
          ts-fsrs, NativeWind, Zustand, Geist, and Noto Japanese fonts.
        </ZenText>
        <ZenText variant="caption" muted>
          Kaishi 1.5k is the intended V1 deck. Its content is not included in
          this build because the project has no redistribution license. Credit
          is due to 栗, Tyogin, contributors, AJT Japanese, and the upstream
          Core and Tango sources once permission and exact attribution are
          settled.
        </ZenText>
      </Surface>
      <Pressable onPress={reset} style={styles.reset}>
        <ZenText style={{ color: theme.fail }}>Reset all progress</ZenText>
      </Pressable>
    </Screen>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingCopy}>
        <ZenText>{title}</ZenText>
        <ZenText variant="caption" muted>
          {description}
        </ZenText>
      </View>
      {control}
    </View>
  );
}
const styles = StyleSheet.create({
  header: { gap: 7, paddingTop: 12 },
  group: { paddingVertical: 4 },
  setting: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  settingCopy: { flex: 1, gap: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { width: 24, textAlign: "center" },
  sliderSetting: { paddingVertical: 16, gap: 7 },
  settingTitle: { flexDirection: "row", justifyContent: "space-between" },
  segment: { flexDirection: "row", borderRadius: 11, padding: 3 },
  segmentButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  about: { gap: 14 },
  reset: { alignItems: "center", paddingVertical: 15, marginBottom: 12 },
});

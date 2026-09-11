import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Pressable, type ScrollView, Switch, View } from "react-native";

import {
  Button,
  Card,
  Screen,
  SectionTitle,
  Segmented,
  Select,
  Separator,
  Text,
} from "@/components/ui";
import { db } from "@/db/client";
import {
  resetSettings,
  updateSetting,
  useSettings,
  type CardContent,
} from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { resetAllProgress } from "@/scheduler";
import { useSessionStore } from "@/stores/session";

const cardContentOptions: { value: CardContent; label: string }[] = [
  { value: "word", label: "Word" },
  { value: "sentence", label: "Sentence" },
  { value: "word_sentence", label: "Word + Sentence" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const values = useSettings();
  const clearSession = useSessionStore((state) => state.clear);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const resetProgress = async () => {
    setResetting(true);
    setResetError(false);
    try {
      await resetAllProgress(db);
      clearSession();
      setConfirmingReset(false);
    } catch (error) {
      console.error("Failed to reset study progress", error);
      setResetError(true);
    } finally {
      setResetting(false);
    }
  };
  return (
    <Screen
      header
      bottomSafeArea
      scrollViewRef={scrollViewRef}
      onContentSizeChange={() => {
        if (confirmingReset) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }}
    >
      <View className="gap-2">
        <SectionTitle>Appearance</SectionTitle>
        <Card className="py-1">
          <SettingRow
            title="Theme"
            description="System follows your device setting"
            control={
              <Segmented
                options={[
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                value={values.theme}
                onChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("theme", value);
                }}
              />
            }
          />
          <Separator />
          <SettingRow
            title="Japanese font"
            description="Used for words and sentences"
            control={
              <Segmented
                options={[
                  { value: "gothic", label: "Gothic" },
                  { value: "mincho", label: "Mincho" },
                ]}
                value={values.jpFont}
                onChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("jp_font", value);
                }}
              />
            }
          />
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Daily review</SectionTitle>
        <Card className="py-1">
          <SettingRow
            title="New cards per day"
            control={
              <View className="flex-row items-center gap-2.5">
                <Stepper
                  label="−"
                  onPress={() =>
                    void updateSetting(
                      "new_per_day",
                      String(Math.max(0, values.newPerDay - 1)),
                    )
                  }
                />
                <Text className="w-7 text-center font-sans-medium">
                  {values.newPerDay}
                </Text>
                <Stepper
                  label="+"
                  onPress={() =>
                    void updateSetting(
                      "new_per_day",
                      String(Math.min(50, values.newPerDay + 1)),
                    )
                  }
                />
              </View>
            }
          />
          <Separator />
          <SettingRow
            title="Leech threshold"
            description="Lapses before a card is suspended"
            control={
              <View className="flex-row items-center gap-2.5">
                <Stepper
                  label="−"
                  onPress={() =>
                    void updateSetting(
                      "leech_threshold",
                      String(Math.max(1, values.leechThreshold - 1)),
                    )
                  }
                />
                <Text className="min-w-7 text-center font-sans-medium">
                  {values.leechThreshold}
                </Text>
                <Stepper
                  label="+"
                  onPress={() =>
                    void updateSetting(
                      "leech_threshold",
                      String(values.leechThreshold + 1),
                    )
                  }
                />
              </View>
            }
          />
          <Separator />
          <SettingRow
            title="Learn ahead limit"
            description="Upcoming cards within this time limit will be immediately added to the current queue"
            control={
              <View className="flex-row items-center gap-2.5">
                <Stepper
                  label="−"
                  accessibilityLabel="Decrease learn ahead limit by 5 minutes"
                  onPress={() =>
                    void updateSetting(
                      "learn_ahead_limit",
                      String(Math.max(0, values.learnAheadLimit - 5)),
                    )
                  }
                />
                <Text className="min-w-7 text-center font-sans-medium">
                  {values.learnAheadLimit}m
                </Text>
                <Stepper
                  label="+"
                  accessibilityLabel="Increase learn ahead limit by 5 minutes"
                  onPress={() =>
                    void updateSetting(
                      "learn_ahead_limit",
                      String(values.learnAheadLimit + 5),
                    )
                  }
                />
              </View>
            }
          />
          <Separator />
          <View className="gap-1.5 py-4">
            <View className="flex-row justify-between">
              <Text>Desired retention</Text>
              <Text className="font-sans-medium">
                {Math.round(values.desiredRetention * 100)}%
              </Text>
            </View>
            <Slider
              minimumValue={0.8}
              maximumValue={0.95}
              step={0.01}
              value={values.desiredRetention}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.secondary}
              onSlidingComplete={(value) =>
                void updateSetting("desired_retention", value.toFixed(2))
              }
            />
            <Text className="text-xs" muted>
              The target % chance you will retain new words. Only change if you
              know what you are doing.
            </Text>
          </View>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Card</SectionTitle>
        <Card className="py-1">
          <SettingRow
            title="Highlight word in sentence"
            control={
              <Switch
                accessibilityLabel="Highlight word in sentence"
                value={values.highlightWord}
                style={{ alignSelf: "center" }}
                onValueChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("highlight_word", String(value));
                }}
                trackColor={{ true: theme.chartBlue, false: theme.secondary }}
                ios_backgroundColor={theme.secondary}
              />
            }
          />
          <Separator />
          <SettingRow
            title="Card Front"
            control={
              <Select
                label="Card Front"
                options={cardContentOptions}
                value={values.cardFront}
                onChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("card_front", value);
                }}
              />
            }
          />
          <Separator />
          <SettingRow
            title="Card Back"
            control={
              <Select
                label="Card Back"
                options={cardContentOptions}
                value={values.cardBack}
                onChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("card_back", value);
                }}
              />
            }
          />
          <Separator />
          <SettingRow
            title="Autoplay word audio"
            description="Plays after the card flips"
            control={
              <Switch
                value={values.autoplay}
                style={{ alignSelf: "center" }}
                onValueChange={(value) => {
                  void Haptics.selectionAsync();
                  void updateSetting("autoplay", String(value));
                }}
                trackColor={{ true: theme.chartBlue, false: theme.secondary }}
                ios_backgroundColor={theme.secondary}
              />
            }
          />
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>About</SectionTitle>
        <Card>
          <View className="gap-0.5">
            <Text variant="headline">Zen</Text>
            <Text muted>
              Version {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </View>
        </Card>
      </View>
      <View className="gap-3">
        <Button
          label="Reset settings"
          variant="secondary"
          onPress={() => void resetSettings()}
        />
        {confirmingReset ? (
          <Card className="gap-4 border-destructive">
            <View className="gap-1">
              <Text variant="headline">Reset all progress?</Text>
              <Text muted>
                This removes every review and returns all cards to new. This
                cannot be undone.
              </Text>
              {resetError ? (
                <Text className="text-destructive">
                  Progress could not be reset. Please try again.
                </Text>
              ) : null}
            </View>
            <View className="gap-3">
              <Button
                label="Cancel"
                variant="secondary"
                disabled={resetting}
                onPress={() => setConfirmingReset(false)}
              />
              <Button
                label={resetting ? "Resetting..." : "Reset everything"}
                variant="destructive"
                haptic={Haptics.ImpactFeedbackStyle.Medium}
                disabled={resetting}
                onPress={() => void resetProgress()}
              />
            </View>
          </Card>
        ) : (
          <Button
            label="Reset all progress"
            variant="destructive"
            onPress={() => setConfirmingReset(true)}
          />
        )}
      </View>
    </Screen>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <View className="min-h-[68px] flex-row items-center justify-between gap-3.5 py-2">
      <View className="flex-1 gap-0.5">
        <Text>{title}</Text>
        {description ? (
          <Text className="text-xs" muted>
            {description}
          </Text>
        ) : null}
      </View>
      {control}
    </View>
  );
}

function Stepper({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      className="h-9 w-9 items-center justify-center rounded-lg bg-secondary active:opacity-60"
    >
      <Text className="font-sans-medium">{label}</Text>
    </Pressable>
  );
}

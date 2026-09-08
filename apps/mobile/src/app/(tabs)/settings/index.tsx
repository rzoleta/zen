import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import { Alert, Pressable, Switch, View } from "react-native";

import {
  Button,
  Card,
  Screen,
  SectionTitle,
  Segmented,
  Separator,
  Text,
} from "@/components/ui";
import { db } from "@/db/client";
import {
  resetSettings,
  updateSetting,
  useSettings,
} from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { resetAllProgress } from "@/scheduler";

export default function SettingsScreen() {
  const theme = useTheme();
  const values = useSettings();
  const resetProgress = () =>
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
    <Screen header>
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
                onChange={(value) => void updateSetting("theme", value)}
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
                  { value: "mincho", label: "Mincho" },
                  { value: "gothic", label: "Gothic" },
                ]}
                value={values.jpFont}
                onChange={(value) => void updateSetting("jp_font", value)}
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
            description="Added after every due review"
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
            <Text variant="caption" muted>
              Applies to future scheduling. Existing due dates do not move.
            </Text>
          </View>
        </Card>
      </View>
      <View className="gap-2">
        <SectionTitle>Card</SectionTitle>
        <Card className="py-1">
          <SettingRow
            title="Autoplay word audio"
            description="Plays after the card flips"
            control={
              <Switch
                value={values.autoplay}
                onValueChange={(value) =>
                  void updateSetting("autoplay", String(value))
                }
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
            <Text variant="footnote" muted>
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
        <Button
          label="Reset all progress"
          variant="destructive"
          onPress={resetProgress}
        />
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
  description: string;
  control: React.ReactNode;
}) {
  return (
    <View className="min-h-[68px] flex-row items-center justify-between gap-3.5 py-2">
      <View className="flex-1 gap-0.5">
        <Text>{title}</Text>
        <Text variant="caption" muted>
          {description}
        </Text>
      </View>
      {control}
    </View>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-9 w-9 items-center justify-center rounded-lg bg-secondary active:opacity-60"
    >
      <Text className="font-sans-medium">{label}</Text>
    </Pressable>
  );
}

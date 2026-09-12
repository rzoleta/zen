import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { resetSettings, updateSetting } from "@/data/settings-commands";
import { resetAllProgress } from "@/data/study-commands";
import { db } from "@/db/client";
import { useSessionStore } from "@/stores/session";

export function useSettingsActions() {
  const clearSession = useSessionStore((state) => state.clear);
  const busy = useRef(false);
  const [resetting, setResetting] = useState(false);
  const save = (
    key: Parameters<typeof updateSetting>[0],
    value: string | number | boolean,
  ) => {
    void Haptics.selectionAsync();
    return updateSetting(key, String(value)).catch(() => {
      Alert.alert("Could not save setting", "Please try again.");
    });
  };
  const confirmReset = (progress: boolean) => {
    if (busy.current) return;
    Alert.alert(
      progress ? "Reset all progress?" : "Reset settings?",
      progress
        ? "This removes every review and returns all cards to new. This cannot be undone."
        : "Your preferences will return to their defaults. Your study progress will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: progress ? "Reset all progress" : "Reset settings",
          style: "destructive",
          onPress: () => {
            if (busy.current) return;
            busy.current = true;
            setResetting(true);
            void (async () => {
              try {
                if (progress) {
                  await resetAllProgress(db);
                  clearSession();
                } else await resetSettings();
                void Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              } catch {
                Alert.alert("Could not reset", "Please try again.");
              } finally {
                busy.current = false;
                setResetting(false);
              }
            })();
          },
        },
      ],
    );
  };
  return { save, confirmReset, resetting };
}

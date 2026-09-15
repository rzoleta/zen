import { Alert } from "react-native";

/**
 * Asks how an endless session should end. Calls back with the fail limit,
 * or `null` for a session that only ends when the user quits.
 */
export function confirmEndlessMode(
  failLimit: number,
  onConfirm: (failLimit: number | null) => void,
) {
  Alert.alert(
    "Start endless mode?",
    "New cards keep coming past today's limit. Study until you quit, or stop introducing cards once you've failed enough of them.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Study endlessly", onPress: () => onConfirm(null) },
      {
        text: `Study until ${failLimit} ${failLimit === 1 ? "fail" : "fails"}`,
        onPress: () => onConfirm(failLimit),
      },
    ],
    { cancelable: true },
  );
}

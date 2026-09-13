import { Alert, type AlertButton } from "react-native";

export type WordAction =
  | "mark-known"
  | "return-to-study"
  | "reset"
  | "suspend"
  | "unsuspend";

const confirmations: Record<
  WordAction,
  { title: string; message: string; confirmButton: AlertButton }
> = {
  "mark-known": {
    title: "Mark this word as known?",
    message: "This word will be marked as known and excluded from reviews.",
    confirmButton: { text: "Mark known" },
  },
  "return-to-study": {
    title: "Return this word to study?",
    message: "This word will be included in reviews again.",
    confirmButton: { text: "Return to study" },
  },
  reset: {
    title: "Reset this card?",
    message: "Its review history and scheduling will be removed.",
    confirmButton: { text: "Reset" },
  },
  suspend: {
    title: "Suspend this word?",
    message: "This word will be excluded from reviews.",
    confirmButton: { text: "Suspend", style: "destructive" },
  },
  unsuspend: {
    title: "Unsuspend this word?",
    message: "This word will be included in reviews again.",
    confirmButton: { text: "Unsuspend" },
  },
};

export function confirmWordAction(action: WordAction, onConfirm: () => void) {
  const { title, message, confirmButton } = confirmations[action];
  Alert.alert(
    title,
    message,
    [
      { text: "Cancel", style: "cancel" },
      { ...confirmButton, onPress: onConfirm },
    ],
    { cancelable: true },
  );
}

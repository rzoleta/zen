import { Alert } from "react-native";

import {
  confirmWordAction,
  type WordAction,
} from "@/lib/confirm-word-action";

describe("confirmWordAction", () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});

  beforeEach(() => alert.mockClear());

  test.each<
    [WordAction, string, string, string, "default" | "destructive" | undefined]
  >([
    [
      "mark-known",
      "Mark this word as known?",
      "This word will be marked as known and excluded from reviews.",
      "Mark known",
      undefined,
    ],
    [
      "return-to-study",
      "Return this word to study?",
      "This word will be included in reviews again.",
      "Return to study",
      undefined,
    ],
    [
      "reset",
      "Reset this card?",
      "Its review history and scheduling will be removed.",
      "Reset",
      "destructive",
    ],
    [
      "suspend",
      "Suspend this word?",
      "This word will be excluded from reviews.",
      "Suspend",
      "destructive",
    ],
    [
      "unsuspend",
      "Unsuspend this word?",
      "This word will be included in reviews again.",
      "Unsuspend",
      undefined,
    ],
  ])(
    "configures the %s confirmation",
    (action, title, message, button, style) => {
      const onConfirm = jest.fn();

      confirmWordAction(action, onConfirm);

      expect(alert).toHaveBeenCalledTimes(1);
      const [actualTitle, actualMessage, buttons, options] = alert.mock.calls[0];
      expect(actualTitle).toBe(title);
      expect(actualMessage).toBe(message);
      expect(buttons?.[0]).toMatchObject({ text: "Cancel", style: "cancel" });
      expect(buttons?.[1]).toMatchObject({ text: button });
      expect(buttons?.[1].style).toBe(style);
      expect(options).toEqual({ cancelable: true });

      buttons?.[1].onPress?.();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    },
  );
});

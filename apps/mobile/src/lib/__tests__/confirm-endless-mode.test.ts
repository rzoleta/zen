import { Alert } from "react-native";

import { confirmEndlessMode } from "@/lib/confirm-endless-mode";

describe("confirmEndlessMode", () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});

  beforeEach(() => alert.mockClear());

  test("offers cancel, endless, and fail-limited options", () => {
    const onConfirm = jest.fn();

    confirmEndlessMode(10, onConfirm);

    expect(alert).toHaveBeenCalledTimes(1);
    const [title, , buttons, options] = alert.mock.calls[0];
    expect(title).toBe("Start endless mode?");
    expect(buttons?.[0]).toMatchObject({ text: "Cancel", style: "cancel" });
    expect(buttons?.[1]).toMatchObject({ text: "Study endlessly" });
    expect(buttons?.[2]).toMatchObject({ text: "Study until 10 fails" });
    expect(options).toEqual({ cancelable: true });

    buttons?.[1].onPress?.();
    expect(onConfirm).toHaveBeenLastCalledWith(null);
    buttons?.[2].onPress?.();
    expect(onConfirm).toHaveBeenLastCalledWith(10);
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  test("uses the singular for a limit of one fail", () => {
    confirmEndlessMode(1, jest.fn());

    expect(alert.mock.calls[0][2]?.[2]).toMatchObject({
      text: "Study until 1 fail",
    });
  });
});

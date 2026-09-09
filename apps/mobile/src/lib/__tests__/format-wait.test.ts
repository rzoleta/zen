import { formatWait } from "@/lib/format-wait";

describe("wait time formatting", () => {
  test.each([
    [1_000, "1 second"],
    [59_001, "1 minute"],
    [60_001, "2 minutes"],
  ])("formats %i milliseconds as %s", (milliseconds, expected) => {
    expect(formatWait(milliseconds)).toBe(expected);
  });
});

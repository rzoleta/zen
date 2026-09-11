import { calendarWeeks } from "@/lib/review-activity";

describe("review activity calendar", () => {
  const today = new Date(2026, 8, 9, 12);

  test("puts Sunday first when the device week starts on Sunday", () => {
    const weeks = calendarWeeks(today, 0);

    expect(weeks).toHaveLength(24);
    expect(weeks[23][0]).toEqual(new Date(2026, 8, 6, 12));
    expect(weeks[23][6]).toEqual(new Date(2026, 8, 12, 12));
  });

  test("puts Monday first when the device week starts on Monday", () => {
    const weeks = calendarWeeks(today, 1);

    expect(weeks[23][0]).toEqual(new Date(2026, 8, 7, 12));
    expect(weeks[23][6]).toEqual(new Date(2026, 8, 13, 12));
  });
});

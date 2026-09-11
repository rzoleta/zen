import { format } from "date-fns";

import { formatDueDate, formatRelativeDueDate } from "../schedule-date";

describe("schedule date formatting", () => {
  test("formats a due date without a time", () => {
    const date = new Date(2026, 8, 14, 1, 8);

    expect(formatDueDate(date)).toBe(format(date, "MMM d, yyyy"));
  });

  test("uses calendar days for future relative dates", () => {
    const now = new Date(2026, 8, 12, 1, 9);
    const due = new Date(2026, 8, 14, 1, 8);

    expect(formatRelativeDueDate(due, now)).toBe("In 2 days");
  });

  test("does not include a time component for dates later today", () => {
    const now = new Date(2026, 8, 12, 1, 9);
    const due = new Date(2026, 8, 12, 23, 59);

    expect(formatRelativeDueDate(due, now)).toBe("Today");
  });
});

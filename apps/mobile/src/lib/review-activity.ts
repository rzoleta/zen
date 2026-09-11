import { addDays, setHours, startOfWeek, subWeeks } from "date-fns";

const WEEK_COUNT = 24;

export function calendarWeeks(today: Date, firstDay: number): Date[][] {
  const currentWeekStart = setHours(
    startOfWeek(today, { weekStartsOn: firstDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 }),
    12,
  );
  const graphStart = subWeeks(currentWeekStart, WEEK_COUNT - 1);

  return Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      return addDays(graphStart, weekIndex * 7 + dayIndex);
    }),
  );
}

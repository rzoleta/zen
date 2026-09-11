const WEEK_COUNT = 12;

export function calendarWeeks(today: Date, firstDay: number): Date[][] {
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(
    currentWeekStart.getDate() -
      ((currentWeekStart.getDay() - firstDay + 7) % 7),
  );
  currentWeekStart.setHours(12, 0, 0, 0);

  const graphStart = new Date(currentWeekStart);
  graphStart.setDate(graphStart.getDate() - (WEEK_COUNT - 1) * 7);

  return Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(graphStart);
      date.setDate(date.getDate() + weekIndex * 7 + dayIndex);
      return date;
    }),
  );
}

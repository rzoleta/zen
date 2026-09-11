import { differenceInCalendarDays, format } from "date-fns";

export function formatDueDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatRelativeDueDate(date: Date, now = new Date()): string {
  const days = differenceInCalendarDays(date, now);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";

  const label = `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"}`;
  return days < 0 ? `${label} ago` : `In ${label}`;
}

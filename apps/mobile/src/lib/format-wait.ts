export function formatWait(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1_000));
  if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

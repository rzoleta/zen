import { Badge } from "@/components/ui";
import type { WordStatus } from "@/hooks/use-deck";

export function StatusChip({
  status,
  leech,
  className,
}: {
  status: WordStatus;
  leech?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={status === "suspended" ? "destructive" : "outline"}
      label={leech ? "leech" : status}
      className={className}
    />
  );
}

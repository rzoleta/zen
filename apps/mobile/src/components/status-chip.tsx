import { Badge } from "@/components/ui";
import type { WordStatus } from "@/hooks/use-deck";

export function StatusChip({
  status,
  leech,
}: {
  status: WordStatus;
  leech?: boolean;
}) {
  return (
    <Badge
      variant={status === "suspended" ? "destructive" : "outline"}
      label={leech ? "leech" : status}
    />
  );
}

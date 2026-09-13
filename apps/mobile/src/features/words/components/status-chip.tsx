import { Badge } from "@/components/ui";
import type { WordStatus } from "@/hooks/use-deck";
import { useTheme } from "@/hooks/use-theme";

export function StatusChip({
  status,
  leech,
  className,
}: {
  status: WordStatus;
  leech?: boolean;
  className?: string;
}) {
  const theme = useTheme();
  const colors: Record<WordStatus, string> = {
    new: theme.chartNeutral,
    learning: theme.chartAmber,
    mature: theme.primary,
    known: theme.chartBlue,
    suspended: theme.destructive,
  };

  return (
    <Badge
      variant="outline"
      label={leech ? "leech" : status}
      className={className}
      style={{ borderColor: `${colors[status]}66` }}
      textStyle={{ color: colors[status] }}
    />
  );
}

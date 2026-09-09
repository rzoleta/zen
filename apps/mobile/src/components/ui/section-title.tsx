import type { PropsWithChildren } from "react";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

export function SectionTitle({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <Text variant="label" className={cn("ml-1", className)}>
      {children}
    </Text>
  );
}

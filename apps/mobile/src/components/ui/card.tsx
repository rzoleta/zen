import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("rounded-2xl border border-border bg-card p-5", className)}
    />
  );
}

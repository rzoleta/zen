import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

export function Separator({ className, ...props }: ViewProps) {
  return <View {...props} className={cn("h-px w-full bg-border", className)} />;
}

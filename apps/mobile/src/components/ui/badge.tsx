import { View, type ViewProps } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

const variants = {
  default: { container: "bg-secondary", text: "text-secondary-foreground" },
  outline: {
    container: "border border-border bg-transparent",
    text: "text-muted-foreground",
  },
  destructive: {
    container: "border border-border bg-transparent",
    text: "text-destructive",
  },
} as const;

export function Badge({
  label,
  variant = "outline",
  className,
  ...props
}: ViewProps & { label: string; variant?: keyof typeof variants }) {
  return (
    <View
      {...props}
      className={cn(
        "self-start rounded-full px-2.5 py-1",
        variants[variant].container,
        className,
      )}
    >
      <Text variant="caption" className={variants[variant].text}>
        {label}
      </Text>
    </View>
  );
}

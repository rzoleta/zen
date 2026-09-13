import {
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
} from "react-native";

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
  textStyle,
  ...props
}: ViewProps & {
  label: string;
  variant?: keyof typeof variants;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View
      {...props}
      className={cn(
        "rounded-full px-2.5 py-1",
        variants[variant].container,
        className,
      )}
    >
      <Text className={cn("text-xs", variants[variant].text)} style={textStyle}>
        {label}
      </Text>
    </View>
  );
}

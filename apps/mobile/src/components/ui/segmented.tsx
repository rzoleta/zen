import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View className={cn("flex-row rounded-lg bg-secondary p-0.5", className)}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          className={cn(
            "rounded-[7px] px-3 py-1.5",
            value === option.value && "bg-card shadow-sm",
          )}
        >
          <Text
            variant="footnote"
            muted={value !== option.value}
            className={cn(value === option.value && "font-sans-medium")}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

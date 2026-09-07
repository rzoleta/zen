import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
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
  const theme = useTheme();

  return (
    <View className={cn("flex-row rounded-lg bg-secondary p-0.5", className)}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className="rounded-[7px] px-3 py-1.5"
            style={
              selected
                ? {
                    backgroundColor: theme.card,
                    elevation: 1,
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 1.5,
                  }
                : undefined
            }
          >
            <Text
              variant="footnote"
              muted={!selected}
              className={cn(selected && "font-sans-medium")}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

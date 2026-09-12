import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui";

export function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <View className="min-h-[68px] flex-row items-center justify-between gap-3.5 py-2">
      <View className="flex-1 gap-0.5">
        <Text>{title}</Text>
        {description ? (
          <Text className="text-xs" muted>
            {description}
          </Text>
        ) : null}
      </View>
      {control}
    </View>
  );
}

import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui";
import type { BinaryGrade } from "@/domain/study";

export const gradeAppearance = {
  fail: {
    label: "Fail",
    color: "#dc2626",
    icon: {
      ios: "arrow.down",
      android: "arrow_downward",
      web: "arrow_downward",
    },
  },
  pass: {
    label: "Pass",
    color: "#16a34a",
    icon: {
      ios: "arrow.up",
      android: "arrow_upward",
      web: "arrow_upward",
    },
  },
} satisfies Record<
  BinaryGrade,
  {
    label: string;
    color: string;
    icon: ComponentProps<typeof SymbolView>["name"];
  }
>;

export function GradeActions({
  swipeIntent,
  textColor,
  onGrade,
}: {
  swipeIntent: BinaryGrade | null;
  textColor: string;
  onGrade: (grade: BinaryGrade) => void;
}) {
  return (
    <View className="flex-row gap-3">
      <GradeButton
        grade="fail"
        active={swipeIntent !== "pass"}
        textColor={textColor}
        onPress={onGrade}
      />
      <GradeButton
        grade="pass"
        active={swipeIntent !== "fail"}
        textColor={textColor}
        onPress={onGrade}
      />
    </View>
  );
}

function GradeButton({
  grade,
  active,
  textColor,
  onPress,
}: {
  grade: BinaryGrade;
  active: boolean;
  textColor: string;
  onPress: (grade: BinaryGrade) => void;
}) {
  const appearance = gradeAppearance[grade];
  return (
    <Button
      label={appearance.label}
      size="lg"
      haptic={false}
      variant={active ? "destructive" : "secondary"}
      className="flex-1"
      style={active ? { backgroundColor: appearance.color } : undefined}
      icon={
        <SymbolView
          name={appearance.icon}
          tintColor={active ? "#ffffff" : textColor}
          size={16}
        />
      }
      onPress={() => onPress(grade)}
    />
  );
}

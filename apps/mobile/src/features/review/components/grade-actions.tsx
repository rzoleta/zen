import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui";
import type { BinaryGrade } from "@/domain/study";

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
        label="Fail"
        icon={{
          ios: "arrow.down",
          android: "arrow_downward",
          web: "arrow_downward",
        }}
        active={swipeIntent !== "pass"}
        textColor={textColor}
        onPress={onGrade}
      />
      <GradeButton
        grade="pass"
        label="Pass"
        icon={{
          ios: "arrow.up",
          android: "arrow_upward",
          web: "arrow_upward",
        }}
        active={swipeIntent !== "fail"}
        textColor={textColor}
        onPress={onGrade}
      />
    </View>
  );
}

function GradeButton({
  grade,
  label,
  icon,
  active,
  textColor,
  onPress,
}: {
  grade: BinaryGrade;
  label: string;
  icon: ComponentProps<typeof SymbolView>["name"];
  active: boolean;
  textColor: string;
  onPress: (grade: BinaryGrade) => void;
}) {
  const isPass = grade === "pass";
  return (
    <Button
      label={label}
      size="lg"
      haptic={false}
      variant={active ? "destructive" : "secondary"}
      className="flex-1"
      style={
        active ? { backgroundColor: isPass ? "#16a34a" : "#dc2626" } : undefined
      }
      icon={
        <SymbolView
          name={icon}
          tintColor={active ? "#ffffff" : textColor}
          size={16}
        />
      }
      onPress={() => onPress(grade)}
    />
  );
}

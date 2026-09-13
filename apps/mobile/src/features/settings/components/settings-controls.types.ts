import type { PropsWithChildren } from "react";
import type { JapaneseFont } from "@/hooks/use-settings";

export type GroupProps = PropsWithChildren<{ title?: string; footer?: string }>;
export type RowProps = {
  title: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};
export type ChoiceProps<T extends string> = {
  title: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};
export type ToggleProps = {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
};
export type NumberProps = {
  title: string;
  value: number;
  min: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void | Promise<void>;
};
export type RangeProps = {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void | Promise<void>;
};
export type FontOptionProps = {
  font: JapaneseFont;
  selected: boolean;
  onPress: () => void;
};

import { MenuView } from "@expo/ui/community/menu";
import type { ReactElement } from "react";

export interface WordContextMenuProps {
  children: ReactElement;
  preview: ReactElement;
  width: number;
  knownDisabled: boolean;
  resetDisabled: boolean;
  suspendDisabled: boolean;
  onAction: (action: "known" | "reset" | "suspend") => void;
  onSelect: () => void;
}

export function WordContextMenu({
  children,
  knownDisabled,
  resetDisabled,
  suspendDisabled,
  onAction,
  onSelect,
}: WordContextMenuProps) {
  return (
    <MenuView
      shouldOpenOnLongPress
      actions={[
        {
          id: "select",
          title: "Select",
        },
        {
          id: "known",
          title: "Mark known",
          attributes: { disabled: knownDisabled },
        },
        {
          id: "reset",
          title: "Reset",
          attributes: { disabled: resetDisabled },
        },
        {
          id: "suspend",
          title: "Suspend",
          attributes: { disabled: suspendDisabled, destructive: true },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        if (
          nativeEvent.event === "known" ||
          nativeEvent.event === "reset" ||
          nativeEvent.event === "suspend"
        )
          onAction(nativeEvent.event);
        else if (nativeEvent.event === "select") onSelect();
      }}
    >
      {children}
    </MenuView>
  );
}

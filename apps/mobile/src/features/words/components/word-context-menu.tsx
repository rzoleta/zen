import { MenuView } from "@expo/ui/community/menu";
import type { ReactElement } from "react";

export interface WordContextMenuProps {
  children: ReactElement;
  preview: ReactElement;
  width: number;
  knownDisabled: boolean;
  suspendDisabled: boolean;
  onAction: (action: "known" | "suspend") => void;
  onSelect: () => void;
}

export function WordContextMenu({
  children,
  knownDisabled,
  suspendDisabled,
  onAction,
  onSelect,
}: WordContextMenuProps) {
  return (
    <MenuView
      shouldOpenOnLongPress
      actions={[
        {
          id: "known",
          title: "Mark known",
          attributes: { disabled: knownDisabled },
        },
        {
          id: "suspend",
          title: "Suspend",
          attributes: { disabled: suspendDisabled, destructive: true },
        },
        {
          id: "select",
          title: "Select",
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "known" || nativeEvent.event === "suspend")
          onAction(nativeEvent.event);
        else if (nativeEvent.event === "select") onSelect();
      }}
    >
      {children}
    </MenuView>
  );
}

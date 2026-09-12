import { MenuView } from "@expo/ui/community/menu";
import type { ReactElement } from "react";

export interface WordContextMenuProps {
  children: ReactElement;
  preview: ReactElement;
  width: number;
  knownDisabled: boolean;
  suspendDisabled: boolean;
  onAction: (action: "known" | "suspend") => void;
}

export function WordContextMenu({
  children,
  knownDisabled,
  suspendDisabled,
  onAction,
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
      ]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "known" || nativeEvent.event === "suspend")
          onAction(nativeEvent.event);
      }}
    >
      {children}
    </MenuView>
  );
}

import { MenuView } from "@expo/ui/community/menu";
import type { ReactElement } from "react";

export interface StudyContextMenuProps {
  children: ReactElement;
  width: number;
  height: number;
  onStudyEndlessly: () => void;
}

export function StudyContextMenu({
  children,
  onStudyEndlessly,
}: StudyContextMenuProps) {
  return (
    <MenuView
      shouldOpenOnLongPress
      actions={[{ id: "endless", title: "Study endlessly", image: "infinity" }]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "endless") onStudyEndlessly();
      }}
    >
      {children}
    </MenuView>
  );
}

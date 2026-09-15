import { Button, ContextMenu, Host, RNHostView } from "@expo/ui/swift-ui";
import { View } from "react-native";

import type { StudyContextMenuProps } from "./study-context-menu";

export function StudyContextMenu({
  children,
  width,
  height,
  onStudyEndlessly,
}: StudyContextMenuProps) {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width }}
      ignoreSafeArea="all"
    >
      <ContextMenu>
        <ContextMenu.Trigger>
          <RNHostView matchContents>
            {/* Give SwiftUI a concrete native view to measure. */}
            <View collapsable={false} style={{ width, height }}>
              {children}
            </View>
          </RNHostView>
        </ContextMenu.Trigger>
        <ContextMenu.Items>
          <Button
            label="Study endlessly"
            systemImage="infinity"
            onPress={onStudyEndlessly}
          />
        </ContextMenu.Items>
      </ContextMenu>
    </Host>
  );
}

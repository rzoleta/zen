import { Button, ContextMenu, Host, RNHostView } from "@expo/ui/swift-ui";
import { disabled } from "@expo/ui/swift-ui/modifiers";

import type { WordContextMenuProps } from "./word-context-menu";

export function WordContextMenu({
  children,
  preview,
  width,
  knownDisabled,
  suspendDisabled,
  onAction,
}: WordContextMenuProps) {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width }}
      ignoreSafeArea="all"
    >
      <ContextMenu>
        <ContextMenu.Trigger>
          <RNHostView matchContents>{children}</RNHostView>
        </ContextMenu.Trigger>
        {/* Keep the selected row visible after the lift animation finishes. */}
        <ContextMenu.Preview>
          <RNHostView matchContents>{preview}</RNHostView>
        </ContextMenu.Preview>
        <ContextMenu.Items>
          <Button
            label="Mark known"
            modifiers={[disabled(knownDisabled)]}
            onPress={() => onAction("known")}
          />
          <Button
            label="Suspend"
            role="destructive"
            modifiers={[disabled(suspendDisabled)]}
            onPress={() => onAction("suspend")}
          />
        </ContextMenu.Items>
      </ContextMenu>
    </Host>
  );
}

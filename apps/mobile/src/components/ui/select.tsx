import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";

const itemHeight = 40;
const itemGap = 4;
const padding = 4;
const edge = 8;

type Anchor = { x: number; y: number; width: number; height: number };

export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const triggerRef = useRef<View>(null);
  const overlayRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [overlay, setOverlay] = useState<Anchor | null>(null);
  const [activeValue, setActiveValue] = useState<T | null>(null);
  const theme = useTheme();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const close = () => {
    setAnchor(null);
    setOverlay(null);
    setActiveValue(null);
  };
  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };
  // Measure both native windows: Android's modal origin can differ from the screen's.
  const measureOverlay = () => {
    overlayRef.current?.measureInWindow((x, y, width, height) => {
      setOverlay({ x, y, width, height });
    });
  };
  const availableWidth = overlay?.width ?? window.width;
  const availableHeight = overlay?.height ?? window.height;
  const topEdge = Math.max(edge, insets.top - (overlay?.y ?? 0) + edge);
  const bottomEdge = insets.bottom + edge;
  const menuHeight = Math.min(
    padding * 2 +
      options.length * itemHeight +
      Math.max(0, options.length - 1) * itemGap +
      2,
    Math.max(0, availableHeight - topEdge - bottomEdge),
  );
  const menuWidth = Math.min(
    Math.max(anchor?.width ?? 0, 192),
    availableWidth - edge * 2,
  );
  // Like the reference, place the selected row over the trigger when space allows.
  const top = Math.max(
    topEdge,
    Math.min(
      (anchor?.y ?? 0) -
        (overlay?.y ?? 0) +
        ((anchor?.height ?? itemHeight) - itemHeight) / 2 -
        padding -
        selectedIndex * (itemHeight + itemGap),
      availableHeight - bottomEdge - menuHeight,
    ),
  );
  const left = Math.max(
    edge,
    Math.min(
      (anchor?.x ?? 0) - (overlay?.x ?? 0) + (anchor?.width ?? 0) - menuWidth,
      availableWidth - edge - menuWidth,
    ),
  );

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityState={{ expanded: anchor !== null }}
        onPress={open}
        hitSlop={6}
        className="h-10 min-w-48 flex-row items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 active:bg-secondary/50"
      >
        <Text className="text-base">{selectedLabel}</Text>
        <SymbolView
          name={{
            ios: "chevron.down",
            android: "expand_more",
            web: "expand_more",
          }}
          tintColor={theme.muted}
          size={14}
        />
      </Pressable>
      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onShow={measureOverlay}
        onRequestClose={close}
      >
        <View
          ref={overlayRef}
          collapsable={false}
          onLayout={measureOverlay}
          style={{ flex: 1 }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss options"
            onPress={close}
            className="absolute inset-0"
          />
          <View
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            className="absolute rounded-xl border border-border bg-card p-1"
            style={{
              top,
              left,
              width: menuWidth,
              maxHeight: menuHeight,
              opacity: overlay ? 1 : 0,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.16)",
            }}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: itemGap }}
            >
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: option.value === value }}
                  onHoverIn={() => setActiveValue(option.value)}
                  onHoverOut={() => setActiveValue(null)}
                  onFocus={() => setActiveValue(option.value)}
                  onBlur={() => setActiveValue(null)}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  style={{ height: itemHeight }}
                  className={`flex-row items-center justify-between gap-2 rounded-md px-3 active:bg-secondary ${option.value === (activeValue ?? value) ? "bg-secondary" : ""}`}
                >
                  <Text className="text-base">{option.label}</Text>
                  {option.value === value ? (
                    <SymbolView
                      name={{
                        ios: "checkmark",
                        android: "check",
                        web: "check",
                      }}
                      tintColor={theme.text}
                      size={14}
                    />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

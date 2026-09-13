import * as SplashScreen from "expo-splash-screen";
import { useCallback, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";

import { JapaneseText, Text } from "@/components/ui";
import { Colors } from "@/constants/theme";

const ENTER_DURATION = 260;
const HOLD_DURATION = 450;
const EXIT_DURATION = 380;

type LaunchSplashProps = {
  scheme: "light" | "dark";
  onFinish: () => void;
};

export function LaunchSplash({ scheme, onFinish }: LaunchSplashProps) {
  const started = useRef(false);
  const [overlayOpacity] = useState(() => new Animated.Value(1));
  const [markOpacity] = useState(() => new Animated.Value(0));
  const [markScale] = useState(() => new Animated.Value(0.84));
  const [markOffset] = useState(() => new Animated.Value(10));
  const [wordmarkOpacity] = useState(() => new Animated.Value(0));

  const beginTransition = useCallback(async () => {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(
      () => false,
    );
    await SplashScreen.hideAsync().catch((splashError: unknown) => {
      console.error("Failed to hide the native splash screen", splashError);
    });

    if (reduceMotion) {
      onFinish();
      return;
    }

    Animated.parallel([
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(markScale, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.spring(markOffset, {
        toValue: 0,
        damping: 14,
        stiffness: 130,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        delay: 120,
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.delay(HOLD_DURATION),
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: EXIT_DURATION,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(markScale, {
            toValue: 1.04,
            duration: EXIT_DURATION,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) onFinish();
      });
    });
  }, [
    markOffset,
    markOpacity,
    markScale,
    onFinish,
    overlayOpacity,
    wordmarkOpacity,
  ]);

  const handleLayout = useCallback(() => {
    if (started.current) return;
    started.current = true;
    requestAnimationFrame(() => void beginTransition());
  }, [beginTransition]);

  const backgroundColor = Colors[scheme].background;
  const wordmarkColor = Colors[scheme].text;

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={handleLayout}
      style={[styles.overlay, { backgroundColor, opacity: overlayOpacity }]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mark,
            {
              opacity: markOpacity,
              transform: [{ translateY: markOffset }, { scale: markScale }],
            },
          ]}
        >
          <JapaneseText
            allowFontScaling={false}
            font="mincho"
            style={styles.kanji}
          >
            前
          </JapaneseText>
        </Animated.View>
        <Animated.View style={{ opacity: wordmarkOpacity }}>
          <Text
            allowFontScaling={false}
            className="font-sans-semibold"
            style={[styles.wordmark, { color: wordmarkColor }]}
          >
            ZEN
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  mark: {
    width: 196,
    height: 196,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 46,
    backgroundColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 16,
  },
  kanji: {
    color: "#ffffff",
    fontSize: 126,
    lineHeight: 164,
    textAlign: "center",
  },
  wordmark: {
    fontSize: 12,
    letterSpacing: 6,
    lineHeight: 18,
    paddingLeft: 6,
  },
});

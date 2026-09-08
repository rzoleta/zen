import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { audioAssets } from "@/assets/deck/audio-assets";
import {
  Button,
  FuriganaText,
  JapaneseText,
  Separator,
  Text,
} from "@/components/ui";
import type { Word } from "@/db/schema";
import type { JapaneseFont } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import type { BinaryGrade } from "@/scheduler";

interface ReviewCardProps {
  word: Word;
  font: JapaneseFont;
  autoplay: boolean;
  onGrade: (grade: BinaryGrade) => void;
  onUndo: () => void;
  onFlip: () => void;
}

const faceClassName =
  "absolute inset-0 rounded-3xl border border-border bg-card p-7";
const wordTextStyle = { fontSize: 60, lineHeight: 80 };
const sentenceTextStyle = { fontSize: 28, lineHeight: 44 };
const swipeIntentThreshold = 20;
const gradingThreshold = 85;

export function ReviewCard({
  word,
  font,
  autoplay,
  onGrade,
  onUndo,
  onFlip,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [swipeIntent, setSwipeIntent] = useState<BinaryGrade | null>(null);
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const isFlipped = useSharedValue(0);
  const isGrading = useSharedValue(0);
  const hasReachedGradingThreshold = useSharedValue(0);
  const swipeIntentValue = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const wordSource = word.wordAudio ? audioAssets[word.wordAudio] : undefined;
  const sentenceSource = word.sentenceAudio
    ? audioAssets[word.sentenceAudio]
    : undefined;
  const wordPlayer = useAudioPlayer(wordSource);
  const sentencePlayer = useAudioPlayer(sentenceSource);
  const showAnswer = () => {
    if (isFlipped.value === 1) return;
    isFlipped.value = 1;
    rotation.value = withTiming(180, { duration: 430 });
    setRevealed(true);
    void Haptics.selectionAsync();
    if (autoplay && wordSource) {
      wordPlayer.seekTo(0);
      wordPlayer.play();
    }
    onFlip();
  };
  const updateSwipeIntent = (intent: BinaryGrade | null) => {
    setSwipeIntent(intent);
  };
  const playSwipeThresholdHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const gradeWithAnimation = (
    answer: BinaryGrade,
    withButtonHaptic = false,
  ) => {
    if (isGrading.value === 1) return;
    isGrading.value = 1;
    if (withButtonHaptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    offsetY.value = withTiming(
      answer === "pass" ? -700 : 700,
      {
        duration: 210,
      },
      (finished) => {
        if (finished) {
          scheduleOnRN(onGrade, answer);
        } else {
          isGrading.value = 0;
        }
      },
    );
  };
  const tap = Gesture.Tap().onEnd(() => {
    if (isFlipped.value === 0) {
      scheduleOnRN(showAnswer);
    }
  });
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (isFlipped.value === 1 && isGrading.value === 0) {
        offsetY.value = event.translationY;
        const nextIntentValue =
          event.translationY < -swipeIntentThreshold
            ? -1
            : event.translationY > swipeIntentThreshold
              ? 1
              : 0;
        if (nextIntentValue !== swipeIntentValue.value) {
          swipeIntentValue.value = nextIntentValue;
          scheduleOnRN(
            updateSwipeIntent,
            nextIntentValue === -1
              ? "pass"
              : nextIntentValue === 1
                ? "fail"
                : null,
          );
        }
        const reachedGradingThreshold =
          Math.abs(event.translationY) >= gradingThreshold;
        if (reachedGradingThreshold && hasReachedGradingThreshold.value === 0) {
          hasReachedGradingThreshold.value = 1;
          scheduleOnRN(playSwipeThresholdHaptic);
        } else if (
          !reachedGradingThreshold &&
          hasReachedGradingThreshold.value === 1
        ) {
          hasReachedGradingThreshold.value = 0;
        }
      }
    })
    .onEnd((event) => {
      if (isGrading.value === 1) return;
      const horizontalUndo =
        event.translationX > 85 &&
        Math.abs(event.translationX) > Math.abs(event.translationY);
      if (horizontalUndo) {
        hasReachedGradingThreshold.value = 0;
        if (swipeIntentValue.value !== 0) {
          swipeIntentValue.value = 0;
          scheduleOnRN(updateSwipeIntent, null);
        }
        offsetY.value = withSpring(0);
        scheduleOnRN(onUndo);
        return;
      }
      if (
        isFlipped.value === 1 &&
        Math.abs(event.translationY) > gradingThreshold
      ) {
        const answer = event.translationY < 0 ? "pass" : "fail";
        const answerIntentValue = answer === "pass" ? -1 : 1;
        if (swipeIntentValue.value !== answerIntentValue) {
          swipeIntentValue.value = answerIntentValue;
          scheduleOnRN(updateSwipeIntent, answer);
        }
        isGrading.value = 1;
        offsetY.value = withTiming(
          event.translationY < 0 ? -700 : 700,
          {
            duration: 210,
          },
          (finished) => {
            if (finished) {
              scheduleOnRN(onGrade, answer);
            } else {
              isGrading.value = 0;
            }
          },
        );
        return;
      }
      if (swipeIntentValue.value !== 0) {
        swipeIntentValue.value = 0;
        scheduleOnRN(updateSwipeIntent, null);
      }
      hasReachedGradingThreshold.value = 0;
      offsetY.value = withSpring(0);
    })
    .onFinalize((_event, success) => {
      if (!success) {
        hasReachedGradingThreshold.value = 0;
        if (swipeIntentValue.value !== 0) {
          swipeIntentValue.value = 0;
          scheduleOnRN(updateSwipeIntent, null);
        }
      }
    });
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1100 },
      { translateY: offsetY.value },
      { rotateY: `${rotation.value}deg` },
    ],
    opacity: interpolate(rotation.value, [89, 90], [1, 0]),
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1100 },
      { translateY: offsetY.value },
      { rotateY: `${rotation.value + 180}deg` },
    ],
    opacity: interpolate(rotation.value, [89, 90], [0, 1]),
  }));
  return (
    <View className="w-full max-w-xl flex-1 gap-3.5 self-center">
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View className="flex-1">
          <Animated.View
            className={`${faceClassName} items-center justify-between`}
            pointerEvents={revealed ? "none" : "auto"}
            style={[{ backfaceVisibility: "hidden" }, frontStyle]}
          >
            <View className="flex-1 items-center justify-center gap-8">
              <JapaneseText
                font={font}
                className="text-center"
                style={wordTextStyle}
              >
                {word.word}
              </JapaneseText>
              <HighlightedSentence word={word} font={font} />
            </View>
          </Animated.View>
          <Animated.View
            className={faceClassName}
            pointerEvents={revealed ? "auto" : "none"}
            style={[{ backfaceVisibility: "hidden" }, backStyle]}
          >
            <View
              className="items-center justify-center gap-2"
              style={{ flex: 0.55 }}
            >
              <FuriganaText
                text={word.wordFurigana}
                font={font}
                fontSize={wordTextStyle.fontSize}
                lineHeight={wordTextStyle.lineHeight}
                align="center"
              />
              <AudioButton
                disabled={!wordSource}
                onPress={() => {
                  void wordPlayer.seekTo(0);
                  wordPlayer.play();
                }}
              />
            </View>
            <Separator />
            <View className="flex-1 items-center justify-center gap-14">
              <View className="items-center gap-1.5">
                <Text variant="label">Meaning</Text>
                <Text className="text-center text-[22px] leading-[30px]">
                  {word.meaning}
                </Text>
              </View>
              <View className="items-center gap-2">
                <FuriganaText
                  text={word.sentenceFurigana}
                  font={font}
                  fontSize={sentenceTextStyle.fontSize}
                  lineHeight={sentenceTextStyle.lineHeight}
                  align="center"
                />
                <Text variant="footnote" muted className="text-center">
                  {word.sentenceMeaning}
                </Text>
                <AudioButton
                  disabled={!sentenceSource}
                  onPress={() => {
                    void sentencePlayer.seekTo(0);
                    sentencePlayer.play();
                  }}
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      {revealed ? (
        <View className="flex-row gap-3">
          <Button
            label="Fail"
            variant={swipeIntent === "pass" ? "secondary" : "destructive"}
            className="flex-1"
            style={
              swipeIntent === "pass"
                ? undefined
                : { backgroundColor: "#dc2626" }
            }
            icon={
              <SymbolView
                name={{
                  ios: "arrow.down",
                  android: "arrow_downward",
                  web: "arrow_downward",
                }}
                tintColor={swipeIntent === "pass" ? theme.text : "#ffffff"}
                size={16}
              />
            }
            onPress={() => gradeWithAnimation("fail", true)}
          />
          <Button
            label="Pass"
            variant={swipeIntent === "fail" ? "secondary" : "destructive"}
            className="flex-1"
            style={
              swipeIntent === "fail"
                ? undefined
                : { backgroundColor: "#16a34a" }
            }
            icon={
              <SymbolView
                name={{
                  ios: "arrow.up",
                  android: "arrow_upward",
                  web: "arrow_upward",
                }}
                tintColor={swipeIntent === "fail" ? theme.text : "#ffffff"}
                size={16}
              />
            }
            onPress={() => gradeWithAnimation("pass", true)}
          />
        </View>
      ) : (
        <Button label="Show answer" variant="secondary" onPress={showAnswer} />
      )}
    </View>
  );
}

function HighlightedSentence({
  word,
  font,
}: {
  word: Word;
  font: JapaneseFont;
}) {
  const before = word.sentence.slice(0, word.sentenceTargetStart);
  const target = word.sentence.slice(
    word.sentenceTargetStart,
    word.sentenceTargetStart + word.sentenceTargetLength,
  );
  const after = word.sentence.slice(
    word.sentenceTargetStart + word.sentenceTargetLength,
  );
  return (
    <JapaneseText
      font={font}
      className="text-center text-muted-foreground"
      style={sentenceTextStyle}
    >
      {before}
      <JapaneseText
        font={font}
        className="text-foreground underline"
        style={sentenceTextStyle}
      >
        {target}
      </JapaneseText>
      {after}
    </JapaneseText>
  );
}

function AudioButton({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={disabled ? "Audio unavailable" : "Play audio"}
      disabled={disabled}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-full bg-secondary active:opacity-60 ${
        disabled ? "opacity-30" : ""
      }`}
    >
      <SymbolView
        name={{
          ios: "speaker.wave.2.fill",
          android: "volume_up",
          web: "volume_up",
        }}
        tintColor={theme.text}
        size={17}
      />
    </Pressable>
  );
}

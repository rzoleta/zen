import { useAudioPlayer } from "expo-audio";
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

export function ReviewCard({
  word,
  font,
  autoplay,
  onGrade,
  onUndo,
  onFlip,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const rotation = useSharedValue(0);
  const isFlipped = useSharedValue(0);
  const isGrading = useSharedValue(0);
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
    if (autoplay && wordSource) {
      wordPlayer.seekTo(0);
      wordPlayer.play();
    }
    onFlip();
  };
  const gradeWithAnimation = (answer: BinaryGrade) => {
    if (isGrading.value === 1) return;
    isGrading.value = 1;
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
      }
    })
    .onEnd((event) => {
      if (isGrading.value === 1) return;
      const horizontalUndo =
        event.translationX > 85 &&
        Math.abs(event.translationX) > Math.abs(event.translationY);
      if (horizontalUndo) {
        offsetY.value = withSpring(0);
        scheduleOnRN(onUndo);
        return;
      }
      if (isFlipped.value === 1 && Math.abs(event.translationY) > 85) {
        const answer = event.translationY < 0 ? "pass" : "fail";
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
      offsetY.value = withSpring(0);
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
            variant="destructive"
            className="flex-1"
            style={{ backgroundColor: "#dc2626" }}
            icon={
              <SymbolView
                name={{
                  ios: "arrow.down",
                  android: "arrow_downward",
                  web: "arrow_downward",
                }}
                tintColor="#ffffff"
                size={16}
              />
            }
            onPress={() => gradeWithAnimation("fail")}
          />
          <Button
            label="Pass"
            variant="destructive"
            className="flex-1"
            style={{ backgroundColor: "#16a34a" }}
            icon={
              <SymbolView
                name={{
                  ios: "arrow.up",
                  android: "arrow_upward",
                  web: "arrow_upward",
                }}
                tintColor="#ffffff"
                size={16}
              />
            }
            onPress={() => gradeWithAnimation("pass")}
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

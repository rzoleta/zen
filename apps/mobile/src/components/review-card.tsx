import { useAudioPlayer } from "expo-audio";
import { SymbolView } from "expo-symbols";
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
import { JapaneseText, Separator, Text } from "@/components/ui";
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

export function ReviewCard({
  word,
  font,
  autoplay,
  onGrade,
  onUndo,
  onFlip,
}: ReviewCardProps) {
  const rotation = useSharedValue(0);
  const isFlipped = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const wordSource = word.wordAudio ? audioAssets[word.wordAudio] : undefined;
  const sentenceSource = word.sentenceAudio
    ? audioAssets[word.sentenceAudio]
    : undefined;
  const wordPlayer = useAudioPlayer(wordSource);
  const sentencePlayer = useAudioPlayer(sentenceSource);
  const flip = () => {
    if (autoplay && wordSource) {
      wordPlayer.seekTo(0);
      wordPlayer.play();
    }
    onFlip();
  };
  const tap = Gesture.Tap().onEnd(() => {
    if (isFlipped.value === 0) {
      isFlipped.value = 1;
      rotation.value = withTiming(180, { duration: 430 });
      scheduleOnRN(flip);
    }
  });
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (isFlipped.value === 1) offsetY.value = event.translationY;
    })
    .onEnd((event) => {
      const horizontalUndo =
        event.translationX > 85 &&
        Math.abs(event.translationX) > Math.abs(event.translationY);
      if (horizontalUndo) {
        offsetY.value = withSpring(0);
        scheduleOnRN(onUndo);
        return;
      }
      if (isFlipped.value === 1 && Math.abs(event.translationY) > 85) {
        offsetY.value = withTiming(event.translationY < 0 ? -700 : 700, {
          duration: 210,
        });
        scheduleOnRN(onGrade, event.translationY < 0 ? "pass" : "fail");
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
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View className="w-full max-w-xl flex-1 self-center">
        <Animated.View
          className={`${faceClassName} items-center justify-between`}
          style={[{ backfaceVisibility: "hidden" }, frontStyle]}
        >
          <View className="flex-1 items-center justify-center gap-8">
            <JapaneseText
              font={font}
              className="text-center text-[60px] leading-[80px]"
            >
              {word.word}
            </JapaneseText>
            <HighlightedSentence word={word} font={font} />
          </View>
          <Text variant="caption" muted>
            Tap to reveal
          </Text>
        </Animated.View>
        <Animated.View
          className={`${faceClassName} justify-between`}
          style={[{ backfaceVisibility: "hidden" }, backStyle]}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <JapaneseText font={font} className="text-[40px] leading-[54px]">
                {word.word}
              </JapaneseText>
              <JapaneseText
                font={font}
                className="text-base leading-6 text-muted-foreground"
              >
                {word.wordFurigana}
              </JapaneseText>
            </View>
            <AudioButton
              disabled={!wordSource}
              onPress={() => {
                void wordPlayer.seekTo(0);
                wordPlayer.play();
              }}
            />
          </View>
          <Separator />
          <View className="gap-1.5">
            <Text variant="label">Meaning</Text>
            <Text className="text-[22px] leading-[30px]">{word.meaning}</Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center gap-3.5">
              <JapaneseText
                font={font}
                className="flex-1 text-[24px] leading-[38px]"
              >
                {word.sentence}
              </JapaneseText>
              <AudioButton
                disabled={!sentenceSource}
                onPress={() => {
                  void sentencePlayer.seekTo(0);
                  sentencePlayer.play();
                }}
              />
            </View>
            <JapaneseText
              font={font}
              className="text-[13px] leading-5 text-muted-foreground"
            >
              {word.sentenceFurigana}
            </JapaneseText>
            <Text variant="footnote" muted>
              {word.sentenceMeaning}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption" className="font-sans-medium">
              ↑ pass
            </Text>
            <Text variant="caption" className="text-destructive">
              ↓ fail
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
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
      className="text-center text-[22px] leading-[36px] text-muted-foreground"
    >
      {before}
      <JapaneseText
        font={font}
        className="text-[22px] leading-[36px] text-foreground underline"
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

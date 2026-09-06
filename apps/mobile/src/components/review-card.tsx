import { useAudioPlayer } from "expo-audio";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
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
import { JapaneseText, ZenText } from "@/components/ui";
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

export function ReviewCard({
  word,
  font,
  autoplay,
  onGrade,
  onUndo,
  onFlip,
}: ReviewCardProps) {
  const theme = useTheme();
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
      <Animated.View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.face,
            { backgroundColor: theme.surface, borderColor: theme.line },
            frontStyle,
          ]}
        >
          <View style={styles.center}>
            <JapaneseText font={font} style={styles.word}>
              {word.word}
            </JapaneseText>
            <HighlightedSentence word={word} font={font} />
          </View>
          <ZenText variant="caption" muted>
            Tap to reveal
          </ZenText>
        </Animated.View>
        <Animated.View
          style={[
            styles.face,
            styles.back,
            { backgroundColor: theme.surface, borderColor: theme.line },
            backStyle,
          ]}
        >
          <View style={styles.backHeader}>
            <View style={styles.headword}>
              <JapaneseText font={font} style={styles.backWord}>
                {word.word}
              </JapaneseText>
              <JapaneseText font={font} style={styles.furigana}>
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
          <View style={[styles.rule, { backgroundColor: theme.line }]} />
          <View style={styles.meaning}>
            <ZenText variant="label" muted>
              Meaning
            </ZenText>
            <ZenText style={styles.meaningText}>{word.meaning}</ZenText>
          </View>
          <View style={styles.sentenceBlock}>
            <View style={styles.sentenceRow}>
              <JapaneseText font={font} style={styles.backSentence}>
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
            <JapaneseText font={font} style={styles.sentenceReading}>
              {word.sentenceFurigana}
            </JapaneseText>
            <ZenText muted>{word.sentenceMeaning}</ZenText>
          </View>
          <View style={styles.gradeHints}>
            <ZenText variant="caption" style={{ color: theme.pass }}>
              ↑ pass
            </ZenText>
            <ZenText variant="caption" style={{ color: theme.fail }}>
              ↓ fail
            </ZenText>
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
  const theme = useTheme();
  const before = word.sentence.slice(0, word.sentenceTargetStart);
  const target = word.sentence.slice(
    word.sentenceTargetStart,
    word.sentenceTargetStart + word.sentenceTargetLength,
  );
  const after = word.sentence.slice(
    word.sentenceTargetStart + word.sentenceTargetLength,
  );
  return (
    <JapaneseText font={font} style={styles.frontSentence}>
      {before}
      <JapaneseText
        font={font}
        style={[styles.frontSentence, { color: theme.accent }]}
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
      style={[
        styles.audio,
        { backgroundColor: theme.surfaceStrong },
        disabled && { opacity: 0.3 },
      ]}
    >
      <SymbolView
        name={{
          ios: "speaker.wave.2.fill",
          android: "volume_up",
          web: "volume_up",
        }}
        tintColor={theme.text}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 620,
    minHeight: 480,
    alignSelf: "center",
  },
  face: {
    ...StyleSheet.absoluteFill,
    backfaceVisibility: "hidden",
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 4,
  },
  back: { alignItems: "stretch" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 30 },
  word: { fontSize: 64, lineHeight: 80, textAlign: "center" },
  frontSentence: { fontSize: 23, lineHeight: 38, textAlign: "center" },
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headword: { flex: 1 },
  backWord: { fontSize: 43, lineHeight: 56 },
  furigana: { fontSize: 16, lineHeight: 24, opacity: 0.65 },
  audio: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rule: { height: StyleSheet.hairlineWidth },
  meaning: { gap: 7 },
  meaningText: { fontSize: 24, lineHeight: 32 },
  sentenceBlock: { gap: 8 },
  sentenceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  backSentence: { flex: 1, fontSize: 25, lineHeight: 38 },
  sentenceReading: { fontSize: 13, lineHeight: 22, opacity: 0.65 },
  gradeHints: { flexDirection: "row", justifyContent: "space-between" },
});

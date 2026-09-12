import { useMemo } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { JapaneseText, type JapaneseFontFace } from "@/components/ui/text";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  parseFuriganaMarkup,
  plainFuriganaText,
  type FuriganaSegment,
} from "@/lib/furigana";

interface FuriganaTextProps extends Omit<ViewProps, "children"> {
  text: string;
  font?: JapaneseFontFace;
  fontSize: number;
  lineHeight: number;
  furiganaFontSize?: number;
  color?: string;
  furiganaColor?: string;
  align?: "left" | "center";
  style?: StyleProp<ViewStyle>;
  baseStyle?: StyleProp<TextStyle>;
  highlightRange?: { start: number; length: number };
  /** Allow long ruby groups to wrap inside a narrow detail sheet. */
  maxSegmentWidth?: number;
}

export function FuriganaText({
  text,
  font = "gothic",
  fontSize,
  lineHeight,
  furiganaFontSize = Math.max(8, Math.round(fontSize * 0.45)),
  color,
  furiganaColor,
  align = "left",
  style,
  baseStyle,
  highlightRange,
  maxSegmentWidth,
  accessibilityLabel,
  ...props
}: FuriganaTextProps) {
  const theme = useTheme();
  const segments = useMemo(() => parseFuriganaMarkup(text), [text]);
  const plainText = useMemo(() => plainFuriganaText(segments), [segments]);
  const hasFurigana = segments.some((segment) => segment.reading);
  const baseTextStyle: TextStyle = {
    color: color ?? theme.text,
    fontFamily: font === "mincho" ? Fonts.mincho : Fonts.gothic,
    fontSize,
    lineHeight,
  };

  return (
    <View
      {...props}
      accessible
      accessibilityLabel={accessibilityLabel ?? plainText}
      style={[
        styles.container,
        align === "center" ? styles.center : styles.left,
        style,
      ]}
    >
      {hasFurigana ? (
        splitLines(segments).map((line, lineIndex) => (
          <View
            key={lineIndex}
            style={[
              styles.line,
              align === "center" ? styles.centerLine : styles.leftLine,
            ]}
          >
            {line.map((segment, segmentIndex) => (
              <RubySegment
                key={`${segmentIndex}-${segment.text}`}
                segment={segment}
                baseStyle={[baseTextStyle, baseStyle]}
                highlightRange={highlightRange}
                maxWidth={maxSegmentWidth}
                furiganaStyle={{
                  color: furiganaColor ?? theme.muted,
                  fontFamily: baseTextStyle.fontFamily,
                  fontSize: furiganaFontSize,
                  lineHeight: Math.ceil(furiganaFontSize * 1.2),
                }}
              />
            ))}
          </View>
        ))
      ) : (
        <JapaneseText
          accessible={false}
          font={font}
          style={[
            baseTextStyle,
            baseStyle,
            align === "center" && styles.textCenter,
          ]}
        >
          <HighlightedBaseText
            text={plainText}
            start={0}
            highlightRange={highlightRange}
          />
        </JapaneseText>
      )}
    </View>
  );
}

function RubySegment({
  segment,
  baseStyle,
  furiganaStyle,
  highlightRange,
  maxWidth,
}: {
  segment: FuriganaSegment & { start: number };
  baseStyle: StyleProp<TextStyle>;
  furiganaStyle: StyleProp<TextStyle>;
  highlightRange?: FuriganaTextProps["highlightRange"];
  maxWidth?: number;
}) {
  return (
    <View accessible={false} style={[styles.segment, { maxWidth }]}>
      <JapaneseText accessible={false} style={[furiganaStyle, { maxWidth }]}>
        {segment.reading ?? "\u00a0"}
      </JapaneseText>
      <JapaneseText accessible={false} style={[baseStyle, { maxWidth }]}>
        <HighlightedBaseText
          text={segment.text}
          start={segment.start}
          highlightRange={highlightRange}
        />
      </JapaneseText>
    </View>
  );
}

function HighlightedBaseText({
  text,
  start,
  highlightRange,
}: {
  text: string;
  start: number;
  highlightRange?: FuriganaTextProps["highlightRange"];
}) {
  const theme = useTheme();
  if (!highlightRange) return text;

  const from = Math.max(0, Math.min(text.length, highlightRange.start - start));
  const to = Math.max(
    from,
    Math.min(text.length, highlightRange.start + highlightRange.length - start),
  );
  return (
    <>
      <NativeText style={{ color: theme.muted, opacity: 0.8 }}>
        {text.slice(0, from)}
      </NativeText>
      <NativeText style={{ color: theme.text }}>
        {text.slice(from, to)}
      </NativeText>
      <NativeText style={{ color: theme.muted, opacity: 0.8 }}>
        {text.slice(to)}
      </NativeText>
    </>
  );
}

function splitLines(segments: FuriganaSegment[]) {
  const lines: (FuriganaSegment & { start: number })[][] = [[]];
  let offset = 0;

  for (const segment of segments) {
    const parts = segment.text.split("\n");
    parts.forEach((part, index) => {
      const chunks = segment.reading ? [part] : splitPlainText(part);
      for (const chunk of chunks) {
        if (chunk) {
          lines.at(-1)?.push({
            text: chunk,
            reading: segment.reading,
            start: offset,
          });
        }
        offset += chunk.length;
      }
      if (index < parts.length - 1) {
        lines.push([]);
        offset += 1;
      }
    });
  }

  return lines;
}

function splitPlainText(text: string): string[] {
  return text.match(/[A-Za-z]+|[0-9０-９]+|./gu) ?? [];
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
  left: {
    alignItems: "flex-start",
  },
  center: {
    alignItems: "center",
  },
  line: {
    alignItems: "flex-end",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  leftLine: {
    justifyContent: "flex-start",
  },
  centerLine: {
    justifyContent: "center",
  },
  segment: {
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
});

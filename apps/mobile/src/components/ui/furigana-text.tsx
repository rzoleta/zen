import { useMemo } from "react";
import {
  StyleSheet,
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
}

export function FuriganaText({
  text,
  font = "mincho",
  fontSize,
  lineHeight,
  furiganaFontSize = Math.max(8, Math.round(fontSize * 0.45)),
  color,
  furiganaColor,
  align = "left",
  style,
  baseStyle,
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
            {line.flatMap((segment, segmentIndex) =>
              segment.reading
                ? [
                    <RubySegment
                      key={`${segmentIndex}-${segment.text}`}
                      segment={segment}
                      baseStyle={[baseTextStyle, baseStyle]}
                      furiganaStyle={{
                        color: furiganaColor ?? theme.muted,
                        fontFamily: baseTextStyle.fontFamily,
                        fontSize: furiganaFontSize,
                        lineHeight: Math.ceil(furiganaFontSize * 1.2),
                      }}
                    />,
                  ]
                : splitPlainText(segment.text).map((part, partIndex) => (
                    <RubySegment
                      key={`${segmentIndex}-${partIndex}-${part}`}
                      segment={{ text: part }}
                      baseStyle={[baseTextStyle, baseStyle]}
                      furiganaStyle={{
                        color: furiganaColor ?? theme.muted,
                        fontFamily: baseTextStyle.fontFamily,
                        fontSize: furiganaFontSize,
                        lineHeight: Math.ceil(furiganaFontSize * 1.2),
                      }}
                    />
                  )),
            )}
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
          {plainText}
        </JapaneseText>
      )}
    </View>
  );
}

function RubySegment({
  segment,
  baseStyle,
  furiganaStyle,
}: {
  segment: FuriganaSegment;
  baseStyle: StyleProp<TextStyle>;
  furiganaStyle: StyleProp<TextStyle>;
}) {
  return (
    <View accessible={false} style={styles.segment}>
      <JapaneseText accessible={false} style={furiganaStyle}>
        {segment.reading ?? "\u00a0"}
      </JapaneseText>
      <JapaneseText accessible={false} style={baseStyle}>
        {segment.text}
      </JapaneseText>
    </View>
  );
}

function splitLines(segments: FuriganaSegment[]): FuriganaSegment[][] {
  const lines: FuriganaSegment[][] = [[]];

  for (const segment of segments) {
    const parts = segment.text.split("\n");
    parts.forEach((part, index) => {
      if (part) {
        lines.at(-1)?.push({ text: part, reading: segment.reading });
      }
      if (index < parts.length - 1) lines.push([]);
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

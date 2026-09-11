import { useRef, useState } from "react";
import { useCalendars } from "expo-localization";
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { calendarWeeks } from "@/lib/review-activity";
import { currentStudyDay } from "@/scheduler";

const CELL_SIZE = 15;
const POPOVER_WIDTH = 220;
const POPOVER_HEIGHT = 70;
const POPOVER_MARGIN = 12;

type SelectedDay = {
  count: number;
  date: Date;
  pageX: number;
  pageY: number;
};

export function Heatmap({
  timestamps,
  endAt,
}: {
  timestamps: number[];
  endAt: number;
}) {
  const theme = useTheme();
  const [{ firstWeekday }] = useCalendars();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const scrollView = useRef<ScrollView>(null);
  const [graphWidth, setGraphWidth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const counts = timestamps.reduce<Record<string, number>>((all, timestamp) => {
    const key = currentStudyDay(new Date(timestamp));
    all[key] = (all[key] ?? 0) + 1;
    return all;
  }, {});
  const today = dateFromStudyDay(currentStudyDay(new Date(endAt)));
  const weeks = calendarWeeks(today, (firstWeekday ?? 1) - 1);

  return (
    <>
      <ScrollView
        ref={scrollView}
        className="w-full"
        contentContainerStyle={{
          columnGap: 5,
          justifyContent: "space-between",
          minWidth: graphWidth,
        }}
        directionalLockEnabled
        horizontal
        onContentSizeChange={() =>
          scrollView.current?.scrollToEnd({ animated: false })
        }
        onLayout={(event) => setGraphWidth(event.nativeEvent.layout.width)}
        showsHorizontalScrollIndicator={false}
      >
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="gap-[5px]">
            {week.map((day) => {
              const key = currentStudyDay(day);
              const count = counts[key] ?? 0;
              const isFuture = day.getTime() > today.getTime();
              const isSelected = selectedDay
                ? currentStudyDay(selectedDay.date) === key
                : false;

              if (isFuture) {
                return <View key={key} className="h-[15px] w-[15px]" />;
              }

              return (
                <Pressable
                  key={key}
                  accessibilityLabel={`${formatAccessibleDate(day)}: ${reviewCountLabel(count)}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  hitSlop={2}
                  onPress={(event) => {
                    setSelectedDay({
                      count,
                      date: day,
                      pageX: event.nativeEvent.pageX,
                      pageY: event.nativeEvent.pageY,
                    });
                  }}
                  className="h-[15px] w-[15px] rounded"
                  style={{
                    backgroundColor: count > 0 ? theme.primary : theme.secondary,
                    borderColor: isSelected ? theme.muted : "transparent",
                    borderWidth: isSelected ? 2 : 0,
                  }}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
        transparent
        visible={selectedDay !== null}
      >
        <Pressable className="flex-1" onPress={() => setSelectedDay(null)}>
          {selectedDay ? (
            <View
              accessibilityViewIsModal
              className="absolute gap-1 rounded-xl border border-border bg-card px-4 py-3"
              style={{
                left: clamp(
                  selectedDay.pageX - POPOVER_WIDTH / 2,
                  POPOVER_MARGIN,
                  windowWidth - POPOVER_WIDTH - POPOVER_MARGIN,
                ),
                top: clamp(
                  selectedDay.pageY + CELL_SIZE,
                  POPOVER_MARGIN,
                  windowHeight - POPOVER_HEIGHT - POPOVER_MARGIN,
                ),
                width: POPOVER_WIDTH,
              }}
            >
              <Text variant="headline">
                {formatDisplayDate(selectedDay.date)}
              </Text>
              <Text variant="footnote" muted>
                {reviewCountLabel(selectedDay.count)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

function dateFromStudyDay(studyDay: string): Date {
  const [year, month, day] = studyDay.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
}

function formatAccessibleDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date);
}

function reviewCountLabel(count: number): string {
  return `${count} ${count === 1 ? "review" : "reviews"}`;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

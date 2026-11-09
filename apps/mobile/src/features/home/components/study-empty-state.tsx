import { JapaneseText, Text } from "@/components/ui";
import { formatWait } from "@/lib/format-wait";
import { formatNextSession } from "@/lib/schedule-date";

export function StudyEmptyState({
  pendingCount,
  nextDue,
  nextAvailableAt,
  now,
  learnAheadLimit,
}: {
  pendingCount: number;
  nextDue?: number;
  nextAvailableAt?: Date;
  now: number;
  learnAheadLimit: number;
}) {
  const pending = pendingCount > 0 && nextDue !== undefined;
  return (
    <>
      <JapaneseText
        font="mincho"
        accessible={false}
        allowFontScaling={false}
        className="mb-6 text-center text-[200px] leading-[240px] text-muted-foreground opacity-40"
      >
        空
      </JapaneseText>
      <Text variant="title">
        {pending ? "You're done for now!" : "You're done for today!"}
      </Text>
      {pending ? (
        <Text muted className="text-center">
          You have{" "}
          <Text className="font-sans-semibold text-foreground">
            {pendingCount} {pendingCount === 1 ? "card" : "cards"}
          </Text>{" "}
          to review again today{"\n"}Come back in{" "}
          <Text className="font-sans-semibold text-foreground">
            {formatWait(nextDue - now - learnAheadLimit * 60_000)}
          </Text>
        </Text>
      ) : nextAvailableAt ? (
        <Text muted className="text-center">
          Next session starts{"\n"}
          <Text className="font-sans-semibold text-foreground">
            {formatNextSession(nextAvailableAt, new Date(now))}
          </Text>
        </Text>
      ) : (
        <Text muted className="text-center">
          No more cards to study.
        </Text>
      )}
    </>
  );
}

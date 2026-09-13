import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Fragment } from "react";
import { Pressable, View } from "react-native";

import { Screen, Text } from "@/components/ui";
import { useDeckRows } from "@/hooks/use-deck";
import { WORD_GROUPS, wordIsInGroup } from "@/features/words/word-groups";

export default function WordGroupsScreen() {
  const rows = useDeckRows();

  return (
    <Screen header className="pt-4" contentContainerClassName="pb-12">
      <View className="overflow-hidden rounded-[24px] bg-muted dark:bg-secondary">
        {WORD_GROUPS.map((group, index) => {
          const count = rows.filter((row) =>
            wordIsInGroup(row.words.id, group),
          ).length;

          return (
            <Fragment key={group.slug}>
              {index > 0 ? <View className="ml-4 h-px bg-separator" /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${group.name}, ${count} ${count === 1 ? "word" : "words"}`}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/words/group/[group]",
                    params: { group: group.slug },
                  });
                }}
                className="min-h-[56px] flex-row items-center gap-4 px-4 py-3 active:opacity-60"
              >
                <Text native className="flex-1">
                  {group.name}
                </Text>
                <Text native muted className="tabular-nums">
                  {count}
                </Text>
              </Pressable>
            </Fragment>
          );
        })}
      </View>
    </Screen>
  );
}

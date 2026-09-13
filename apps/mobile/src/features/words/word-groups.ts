export type WordGroup = {
  slug: string;
  name: string;
  wordIds: readonly number[] | null;
};

export const WORD_GROUPS = [
  {
    slug: "all",
    name: "All Words",
    wordIds: null,
  },
  {
    slug: "numbers",
    name: "Numbers",
    // 一–十, 万, and the native 一つ–九つ counting words.
    wordIds: [
      203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 1161, 1492, 1493, 1494,
      1495, 1496, 1497, 1498, 1499, 1500,
    ],
  },
  {
    slug: "days-of-the-week",
    name: "Days of the Week",
    wordIds: [1485, 1486, 1487, 1488, 1489, 1490, 1491],
  },
] as const satisfies readonly WordGroup[];

export function getWordGroup(slug: string | undefined): WordGroup | undefined {
  return WORD_GROUPS.find((group) => group.slug === slug);
}

export function wordIsInGroup(wordId: number, group: WordGroup): boolean {
  return group.wordIds === null || group.wordIds.includes(wordId);
}

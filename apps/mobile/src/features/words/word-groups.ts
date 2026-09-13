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
    // 一 through 十, 万, and the native 一つ through 九つ counting words.
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
  {
    slug: "body-and-body-parts",
    name: "Body & Body Parts",
    wordIds: [
      107, 108, 216, 252, 270, 284, 311, 337, 357, 404, 433, 441, 477, 489, 505,
      537, 554, 561, 638, 660, 717, 721, 895, 945, 989, 1133, 1208, 1228, 1347,
      1349, 1463, 1465,
    ],
  },
  {
    slug: "family",
    name: "Family",
    wordIds: [
      18, 88, 90, 102, 111, 112, 131, 242, 243, 244, 362, 726, 727, 833, 992,
      1011, 1012, 1013, 1014, 1015, 1016, 1017, 1182,
    ],
  },
  {
    slug: "questions",
    name: "Questions",
    wordIds: [
      13, 16, 28, 41, 57, 61, 130, 132, 196, 255, 597, 769, 832, 1176, 1470,
    ],
  },
  {
    slug: "courtesy-and-set-phrases",
    name: "Courtesy & Set Phrases",
    wordIds: [35, 49, 50, 68, 73, 142, 143, 146, 214, 317, 471, 511, 512, 564],
  },
  {
    slug: "position-and-direction",
    name: "Position & Direction",
    wordIds: [
      38, 39, 40, 41, 64, 96, 100, 234, 262, 285, 308, 309, 376, 382, 387, 410,
      431, 487, 630, 687, 873, 896, 941, 979, 1129, 1160, 1304,
    ],
  },
  {
    slug: "seasons-and-weather",
    name: "Seasons & Weather",
    wordIds: [295, 296, 297, 298, 461, 621, 908, 1089, 1270, 1271],
  },
] as const satisfies readonly WordGroup[];

export function getWordGroup(slug: string | undefined): WordGroup | undefined {
  return WORD_GROUPS.find((group) => group.slug === slug);
}

export function wordIsInGroup(wordId: number, group: WordGroup): boolean {
  return group.wordIds === null || group.wordIds.includes(wordId);
}

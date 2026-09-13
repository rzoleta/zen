import bundledDeck from "@/assets/deck/kaishi.json";
import {
  WORD_GROUPS,
  getWordGroup,
  wordIsInGroup,
} from "@/features/words/word-groups";

const deck = bundledDeck.words;

describe("word groups", () => {
  it("keeps All Words first and includes every deck word", () => {
    const allWords = WORD_GROUPS[0];

    expect(allWords.name).toBe("All Words");
    expect(
      deck.filter((word) => wordIsInGroup(word.id, allWords)),
    ).toHaveLength(1500);
  });

  it("contains the deck's direct number words", () => {
    const numbers = getWordGroup("numbers");
    expect(numbers).toBeDefined();

    const words = deck
      .filter((word) => wordIsInGroup(word.id, numbers!))
      .map((word) => word.word);

    expect(words).toEqual([
      "一",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
      "万",
      "一つ",
      "二つ",
      "三つ",
      "四つ",
      "五つ",
      "六つ",
      "七つ",
      "八つ",
      "九つ",
    ]);
  });

  it("contains all seven days of the week", () => {
    const days = getWordGroup("days-of-the-week");
    expect(days).toBeDefined();

    const words = deck
      .filter((word) => wordIsInGroup(word.id, days!))
      .map((word) => word.word);

    expect(words).toEqual([
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
      "日曜日",
    ]);
  });

  it("only references words in the bundled deck", () => {
    const deckIds = new Set(deck.map((word) => word.id));
    const groupedIds = WORD_GROUPS.flatMap((group) => group.wordIds ?? []);

    expect(groupedIds.every((wordId) => deckIds.has(wordId))).toBe(true);
  });
});

import bundledDeck from "@/assets/deck/kaishi.json";
import {
  WORD_GROUPS,
  getWordGroup,
  wordIsInGroup,
} from "@/features/words/word-groups";

const deck = bundledDeck.words;

function wordsForGroup(slug: string) {
  const group = getWordGroup(slug);
  if (!group) throw new Error(`Unknown word group: ${slug}`);

  return deck
    .filter((word) => wordIsInGroup(word.id, group))
    .map((word) => word.word);
}

describe("word groups", () => {
  it("keeps All Words first and includes every deck word", () => {
    const allWords = WORD_GROUPS[0];

    expect(allWords.name).toBe("All Words");
    expect(
      deck.filter((word) => wordIsInGroup(word.id, allWords)),
    ).toHaveLength(1500);
  });

  it("contains the deck's direct number words", () => {
    expect(wordsForGroup("numbers")).toEqual([
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
    expect(wordsForGroup("days-of-the-week")).toEqual([
      "月曜日",
      "火曜日",
      "水曜日",
      "木曜日",
      "金曜日",
      "土曜日",
      "日曜日",
    ]);
  });

  it("contains body and body part words", () => {
    expect(wordsForGroup("body-and-body-parts")).toEqual([
      "目",
      "手",
      "顔",
      "頭",
      "体",
      "口",
      "胸",
      "腕",
      "足",
      "髪",
      "指",
      "血",
      "背中",
      "肩",
      "腰",
      "首",
      "耳",
      "唇",
      "涙",
      "両手",
      "頬",
      "全身",
      "身体",
      "舌",
      "心臓",
      "膝",
      "喉",
      "お腹",
      "鼻",
      "片手",
      "骨",
      "肉体",
    ]);
  });

  it("contains family words", () => {
    expect(wordsForGroup("family")).toEqual([
      "兄",
      "父",
      "母",
      "家族",
      "おじいさん",
      "おばあさん",
      "子",
      "姉",
      "弟",
      "妹",
      "子供",
      "息子",
      "娘",
      "親",
      "両親",
      "お父さん",
      "お母さん",
      "お兄さん",
      "お姉さん",
      "おじさん",
      "おばさん",
      "いとこ",
      "妻",
    ]);
  });

  it("contains question words", () => {
    expect(wordsForGroup("questions")).toEqual([
      "何",
      "どれ",
      "どの",
      "どこ",
      "いつ",
      "どう",
      "誰",
      "どんな",
      "なぜ",
      "どうして",
      "いくら",
      "どうやって",
      "どちら",
      "何で",
      "いかが",
    ]);
  });

  it("contains courtesy and set phrases", () => {
    expect(wordsForGroup("courtesy-and-set-phrases")).toEqual([
      "ください",
      "はい",
      "いいえ",
      "お願いします",
      "ありがとうございます",
      "申し訳ない",
      "もちろん",
      "失礼します",
      "すみません",
      "ごめん",
      "結構",
      "ただいま",
      "頂きます",
      "どうぞ",
    ]);
  });

  it("contains position and direction words", () => {
    expect(wordsForGroup("position-and-direction")).toEqual([
      "ここ",
      "そこ",
      "あそこ",
      "どこ",
      "方",
      "中",
      "前",
      "上",
      "こちら",
      "外",
      "左",
      "右",
      "下",
      "後ろ",
      "奥",
      "近い",
      "隣",
      "向こう",
      "そっち",
      "横",
      "位置",
      "方向",
      "遠く",
      "そちら",
      "中心",
      "そば",
      "左右",
    ]);
  });

  it("contains season and weather words", () => {
    expect(wordsForGroup("seasons-and-weather")).toEqual([
      "春",
      "夏",
      "秋",
      "冬",
      "空",
      "風",
      "雨",
      "寒い",
      "降る",
      "雪",
    ]);
  });

  it("only references words in the bundled deck", () => {
    const deckIds = new Set(deck.map((word) => word.id));
    const groupedIds = WORD_GROUPS.flatMap((group) => group.wordIds ?? []);

    expect(groupedIds.every((wordId) => deckIds.has(wordId))).toBe(true);
  });
});

import { parseFuriganaMarkup, plainFuriganaText } from "@/lib/furigana";

describe("parseFuriganaMarkup", () => {
  it("leaves kana-only text unannotated", () => {
    expect(parseFuriganaMarkup("あなた")).toEqual([{ text: "あなた" }]);
  });

  it("parses mixed kanji and kana", () => {
    expect(parseFuriganaMarkup("好[す]き")).toEqual([
      { text: "好", reading: "す" },
      { text: "き" },
    ]);
  });

  it("removes the deck's annotation separator spaces", () => {
    const segments = parseFuriganaMarkup(
      "日本[にほん] 語[ご]を 勉[べん] 強[きょう]する",
    );

    expect(plainFuriganaText(segments)).toBe("日本語を勉強する");
  });

  it("keeps separate readings for repeated kanji", () => {
    expect(parseFuriganaMarkup("日[にち] 曜[よう] 日[び]")).toEqual([
      { text: "日", reading: "にち" },
      { text: "曜", reading: "よう" },
      { text: "日", reading: "び" },
    ]);
  });

  it("supports readings for numbers", () => {
    expect(parseFuriganaMarkup("3[さん] 時[じ]")).toEqual([
      { text: "3", reading: "さん" },
      { text: "時", reading: "じ" },
    ]);
  });

  it("preserves line breaks and punctuation", () => {
    const segments = parseFuriganaMarkup(
      "A「何[なん]ですか。」\nB「本[ほん]です。」",
    );

    expect(plainFuriganaText(segments)).toBe("A「何ですか。」\nB「本です。」");
  });

  it("treats malformed annotations as plain text", () => {
    expect(parseFuriganaMarkup("漢字[かんじ")).toEqual([
      { text: "漢字[かんじ" },
    ]);
  });
});

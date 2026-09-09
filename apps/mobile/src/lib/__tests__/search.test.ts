import {
  matchesWordQuery,
  normalizeRomajiQuery,
  type SearchableWord,
} from "@/lib/search";

const watashi: SearchableWord = {
  word: "私",
  wordFurigana: "私[わたし]",
  meaning: "I (polite, general)",
  wordRomaji: "watashi",
};

const nani: SearchableWord = {
  word: "何",
  wordFurigana: "何[なに・なん]",
  meaning: "what",
  wordRomaji: "nani nan",
};

const shashin: SearchableWord = {
  word: "写真",
  wordFurigana: "写真[しゃしん]",
  meaning: "photograph",
  wordRomaji: "shashin",
};

const shinbun: SearchableWord = {
  word: "新聞",
  wordFurigana: "新聞[しんぶん]",
  meaning: "newspaper",
  wordRomaji: "shinbun",
};

const roku: SearchableWord = {
  word: "六",
  wordFurigana: "六[ろく]",
  meaning: "six",
  wordRomaji: "roku",
};

describe("matchesWordQuery", () => {
  it("finds a word by its full romaji reading", () => {
    expect(matchesWordQuery(watashi, "watashi")).toBe(true);
  });

  it("finds a word by a romaji prefix", () => {
    expect(matchesWordQuery(watashi, "wata")).toBe(true);
  });

  it("ignores surrounding whitespace and case", () => {
    expect(matchesWordQuery(watashi, "  WaTaShi ")).toBe(true);
  });

  it("does not match unrelated romaji", () => {
    expect(matchesWordQuery(watashi, "gakkou")).toBe(false);
  });

  it("matches either of two readings joined by the deck separator", () => {
    expect(matchesWordQuery(nani, "nani")).toBe(true);
    expect(matchesWordQuery(nani, "nan")).toBe(true);
  });

  it("still matches kanji, kana and meaning", () => {
    expect(matchesWordQuery(watashi, "私")).toBe(true);
    expect(matchesWordQuery(watashi, "わたし")).toBe(true);
    expect(matchesWordQuery(watashi, "polite")).toBe(true);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesWordQuery(watashi, "")).toBe(true);
    expect(matchesWordQuery(watashi, "   ")).toBe(true);
  });

  it("accepts kunrei spellings of hepburn romaji", () => {
    expect(matchesWordQuery(shashin, "syashin")).toBe(true);
    expect(matchesWordQuery(shashin, "syasin")).toBe(true);
  });

  it("accepts the traditional hepburn n-before-b spelling", () => {
    expect(matchesWordQuery(shinbun, "shimbun")).toBe(true);
  });

  it("does not fold english meanings, so si-words still match", () => {
    // "six" folds to "shix", which is why folding is romaji-only.
    expect(normalizeRomajiQuery("six")).toBe("shix");
    expect(matchesWordQuery(roku, "six")).toBe(true);
  });
});

describe("normalizeRomajiQuery", () => {
  it("leaves hepburn spellings untouched", () => {
    expect(normalizeRomajiQuery("watashi")).toBe("watashi");
    expect(normalizeRomajiQuery("gakkou")).toBe("gakkou");
    expect(normalizeRomajiQuery("tsuzuku")).toBe("tsuzuku");
  });

  it("folds kunrei syllables onto hepburn", () => {
    expect(normalizeRomajiQuery("si")).toBe("shi");
    expect(normalizeRomajiQuery("tugi")).toBe("tsugi");
    expect(normalizeRomajiQuery("huton")).toBe("futon");
    expect(normalizeRomajiQuery("zikan")).toBe("jikan");
  });

  it("strips apostrophes used to separate a syllabic n", () => {
    expect(normalizeRomajiQuery("zen'in")).toBe("zenin");
  });

  it("leaves japanese queries alone", () => {
    expect(normalizeRomajiQuery("わたし")).toBe("わたし");
    expect(normalizeRomajiQuery("私")).toBe("私");
  });
});

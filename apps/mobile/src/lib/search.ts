export interface SearchableWord {
  word: string;
  wordFurigana: string;
  meaning: string;
  wordRomaji: string;
}

// Kunrei and Nihon-shiki spellings folded onto the Hepburn forms the deck is
// romanised with, so "syashin" and "shashin" find the same word. Digraphs come
// first because the two-letter rules below would otherwise split them.
const ROMAJI_VARIANTS: readonly (readonly [RegExp, string])[] = [
  [/sy/g, "sh"],
  [/(?:jy|zy)/g, "j"],
  [/ty/g, "ch"],
  [/si/g, "shi"],
  [/ti/g, "chi"],
  [/tu/g, "tsu"],
  [/hu/g, "fu"],
  [/zi/g, "ji"],
  [/di/g, "ji"],
  [/du/g, "zu"],
  // Traditional Hepburn writes shimbun; the deck writes shinbun.
  [/m(?=[bpm])/g, "n"],
];

/**
 * Folds a latin query onto the deck's Hepburn spelling. Non-latin queries pass
 * through untouched because every rule is ASCII-only.
 */
export function normalizeRomajiQuery(query: string): string {
  let normalized = query.toLowerCase().replace(/['’\-]/g, "");
  for (const [pattern, replacement] of ROMAJI_VARIANTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

/**
 * Matches a word against the search box. The romaji is checked separately from
 * the japanese and english text: folding is only ever applied to the romaji
 * comparison, because rewriting an english query would stop "six" matching the
 * meaning "six".
 */
export function matchesWordQuery(word: SearchableWord, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const text =
    `${word.word} ${word.wordFurigana} ${word.meaning}`.toLowerCase();
  if (text.includes(needle)) return true;

  const romaji = word.wordRomaji.toLowerCase();
  return (
    romaji.includes(needle) || romaji.includes(normalizeRomajiQuery(needle))
  );
}

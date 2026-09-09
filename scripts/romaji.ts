// Hepburn romanisation of the deck's kana readings, used only to build a
// searchable latin form of each word. Output stays ASCII: no macrons for long
// vowels and no apostrophe after a syllabic ん, because both are keys nobody
// reaches for when typing a search query.

const DIGRAPHS: Readonly<Record<string, string>> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  じゃ: "ja", じゅ: "ju", じょ: "jo",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔぁ: "va", ゔぃ: "vi", ゔぇ: "ve", ゔぉ: "vo",
  しぇ: "she", じぇ: "je", ちぇ: "che",
};

const MONOGRAPHS: Readonly<Record<string, string>> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "wi", ゑ: "we", を: "o",
  ゔ: "vu",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo", ゎ: "wa",
};

const SOKUON = "っ";
const SYLLABIC_N = "ん";
const PROLONGED = "ー";
const READING_SEPARATOR = "・";

/** The deck writes テレビ in katakana; everything else is hiragana. */
function toHiragana(reading: string): string {
  return Array.from(reading)
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      // Skip ー (U+30FC) and ・ (U+30FB), which have no hiragana counterpart.
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCodePoint(code - 0x60);
      }
      return character;
    })
    .join("");
}

/** A sokuon doubles the next consonant, except before ch where it becomes t. */
function geminate(syllable: string): string {
  if (syllable.startsWith("ch")) return `t${syllable}`;
  const consonant = syllable[0];
  if (!consonant || !/[a-z]/.test(consonant) || "aiueo".includes(consonant)) {
    throw new Error(`Cannot geminate the syllable ${JSON.stringify(syllable)}`);
  }
  return `${consonant}${syllable}`;
}

function lastVowel(romaji: string): string {
  for (let index = romaji.length - 1; index >= 0; index -= 1) {
    const character = romaji[index] ?? "";
    if ("aiueo".includes(character)) return character;
  }
  throw new Error(`No vowel to prolong in ${JSON.stringify(romaji)}`);
}

/**
 * Converts a single kana reading to Hepburn romaji. Alternate readings joined
 * by ・ in the source become space-separated words so either one is findable.
 * Throws on any kana outside the table so a deck change cannot silently
 * produce a half-romanised entry.
 */
export function kanaToRomaji(reading: string): string {
  const kana = Array.from(toHiragana(reading.normalize("NFC")));
  let romaji = "";
  let pendingSokuon = false;

  const append = (syllable: string) => {
    romaji += pendingSokuon ? geminate(syllable) : syllable;
    pendingSokuon = false;
  };

  for (let index = 0; index < kana.length; ) {
    const character = kana[index] ?? "";

    if (character === READING_SEPARATOR || /\s/.test(character)) {
      if (pendingSokuon) throw new Error(`Dangling ${SOKUON} in ${reading}`);
      if (romaji && !romaji.endsWith(" ")) romaji += " ";
      index += 1;
      continue;
    }

    if (character === SOKUON) {
      pendingSokuon = true;
      index += 1;
      continue;
    }

    if (character === SYLLABIC_N) {
      if (pendingSokuon) throw new Error(`Dangling ${SOKUON} in ${reading}`);
      romaji += "n";
      index += 1;
      continue;
    }

    if (character === PROLONGED) {
      if (pendingSokuon) throw new Error(`Dangling ${SOKUON} in ${reading}`);
      romaji += lastVowel(romaji);
      index += 1;
      continue;
    }

    const pair = kana.slice(index, index + 2).join("");
    const digraph = DIGRAPHS[pair];
    if (digraph) {
      append(digraph);
      index += 2;
      continue;
    }

    const monograph = MONOGRAPHS[character];
    if (!monograph) {
      throw new Error(
        `No romaji mapping for ${JSON.stringify(character)} in reading ${JSON.stringify(reading)}`,
      );
    }
    append(monograph);
    index += 1;
  }

  if (pendingSokuon) throw new Error(`Dangling ${SOKUON} in ${reading}`);

  const result = romaji.trim();
  if (!/^[a-z]+(?: [a-z]+)*$/.test(result)) {
    throw new Error(
      `Romaji for ${JSON.stringify(reading)} is not plain latin: ${JSON.stringify(result)}`,
    );
  }
  return result;
}

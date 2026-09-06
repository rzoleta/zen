import { createHash } from "node:crypto";
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const EXPECTED_WORD_COUNT = 1_500;
const FIELD_SEPARATOR = "\u001f";
const KAISHI_NOTETYPE = "Kaishi 1.5k";
const SOURCE_URL = "https://github.com/donkuri/kaishi";

interface Arguments {
  archivePath: string;
  outputPath: string;
  force: boolean;
}

interface SqliteNote {
  due: number;
  flds: string;
}

interface SourceWord {
  word: string;
  wordFurigana: string;
  meaning: string;
  sentence: string;
  sentenceTargetStart: number;
  sentenceTargetLength: number;
  sentenceFurigana: string;
  sentenceMeaning: string;
  wordAudioSource: string | null;
  sentenceAudioSource: string;
}

interface DeckWord {
  id: number;
  deck_order: number;
  word: string;
  word_furigana: string;
  meaning: string;
  sentence: string;
  sentence_target_start: number;
  sentence_target_length: number;
  sentence_furigana: string;
  sentence_meaning: string;
  word_audio: string | null;
  sentence_audio: string;
}

interface MediaEntry {
  name: string;
  archiveName: string;
  size: number;
}

interface ExtractionSummary {
  sourceVersion: string;
  archiveSha256: string;
  wordCount: number;
  audioFileCount: number;
  uniqueSourceAudioCount: number;
  jsonBytes: number;
  audioBytes: number;
  totalBytes: number;
}

function usage(): never {
  console.error(
    "Usage: pnpm extract:kaishi -- <Kaishi.1.5k.apkg> [--output <directory>] [--force]",
  );
  process.exit(1);
}

function parseArguments(argv: string[]): Arguments {
  let archivePath: string | undefined;
  let outputPath = "assets/deck";
  let force = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    } else if (argument === "--output") {
      const value = argv[index + 1];
      if (!value) usage();
      outputPath = value;
      index += 1;
    } else if (argument === "--force") {
      force = true;
    } else if (argument?.startsWith("--")) {
      usage();
    } else if (!archivePath && argument) {
      archivePath = argument;
    } else {
      usage();
    }
  }

  if (!archivePath) usage();

  return {
    archivePath: resolve(archivePath),
    outputPath: resolve(outputPath),
    force,
  };
}

function run(command: string, args: string[]): string {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${command} failed: ${error.message}`, { cause: error });
    }
    throw error;
  }
}

function requireCommand(command: string): void {
  run("which", [command]);
}

function sha256(path: string): Promise<string> {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

function decodeHtmlEntities(value: string): string {
  const named: Readonly<Record<string, string>> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi,
    (entity, code: string) => {
      if (code.startsWith("#x") || code.startsWith("#X")) {
        return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      }
      if (code.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      }
      return named[code.toLowerCase()] ?? entity;
    },
  );
}

function cleanText(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p\s*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .normalize("NFC");
}

function highlightedSentence(value: string, word: string): {
  text: string;
  targetStart: number;
  targetLength: number;
} {
  const openingMarker = "\ue000";
  const closingMarker = "\ue001";
  if (value.includes(openingMarker) || value.includes(closingMarker)) {
    throw new Error(`Sentence for ${word} contains a reserved extraction marker`);
  }

  let highlightCount = 0;
  const withMarkers = value.replace(/<b(?:\s[^>]*)?>([\s\S]*?)<\/b>/gi, (_match, target: string) => {
    highlightCount += 1;
    return `${openingMarker}${target}${closingMarker}`;
  });
  if (highlightCount !== 1) {
    throw new Error(`Expected one highlighted target in the sentence for ${word}, got ${highlightCount}`);
  }

  const cleaned = cleanText(withMarkers);
  const targetStart = cleaned.indexOf(openingMarker);
  const targetEnd = cleaned.indexOf(closingMarker);
  if (targetStart < 0 || targetEnd <= targetStart) {
    throw new Error(`Could not locate the highlighted target in the sentence for ${word}`);
  }

  const prefix = cleaned.slice(0, targetStart);
  const target = cleaned.slice(targetStart + openingMarker.length, targetEnd);
  const suffix = cleaned.slice(targetEnd + closingMarker.length);
  if (!target) throw new Error(`The highlighted sentence target for ${word} is empty`);

  return {
    text: `${prefix}${target}${suffix}`,
    targetStart: prefix.length,
    targetLength: target.length,
  };
}

function audioFilename(value: string, label: string, optional = false): string | null {
  if (optional && !value.trim()) return null;
  const match = /^\s*\[sound:([^\]]+)]\s*$/.exec(value);
  if (!match?.[1]) {
    throw new Error(`Expected one audio reference in ${label}, got ${JSON.stringify(value)}`);
  }
  return match[1].normalize("NFC");
}

function sourceWord(fields: string[]): SourceWord | undefined {
  if (fields.length < 14) {
    throw new Error(`Expected at least 14 Kaishi fields, got ${fields.length}`);
  }

  const word = cleanText(fields[0] ?? "");
  const wordAudio = fields[4] ?? "";
  const sentenceAudio = fields[8] ?? "";

  // The official deck contains one introductory card before its 1,500 words.
  if (!wordAudio && !sentenceAudio && word.startsWith("Welcome to Kaishi")) {
    return undefined;
  }

  const sentence = highlightedSentence(fields[5] ?? "", word);

  const result: SourceWord = {
    word,
    wordFurigana: cleanText(fields[3] ?? ""),
    meaning: cleanText(fields[2] ?? ""),
    sentence: sentence.text,
    sentenceTargetStart: sentence.targetStart,
    sentenceTargetLength: sentence.targetLength,
    sentenceFurigana: cleanText(fields[7] ?? ""),
    sentenceMeaning: cleanText(fields[6] ?? ""),
    wordAudioSource: audioFilename(wordAudio, `${word} word audio`, true),
    sentenceAudioSource: audioFilename(sentenceAudio, `${word} sentence audio`) ?? "",
  };

  const requiredText: Array<[string, string]> = [
    ["word", result.word],
    ["word_furigana", result.wordFurigana],
    ["meaning", result.meaning],
    ["sentence", result.sentence],
    ["sentence_furigana", result.sentenceFurigana],
    ["sentence_meaning", result.sentenceMeaning],
  ];
  for (const [field, value] of requiredText) {
    if (!value) throw new Error(`Kaishi word ${word || "(blank)"} has no ${field}`);
  }

  return result;
}

function queryNotes(databasePath: string): SqliteNote[] {
  const escapedNotetype = KAISHI_NOTETYPE.replaceAll("'", "''");
  const query = `
    SELECT c.due AS due, n.flds AS flds
    FROM cards c
    JOIN notes n ON n.id = c.nid
    JOIN notetypes nt ON nt.id = n.mid
    WHERE nt.name COLLATE BINARY = '${escapedNotetype}'
    ORDER BY c.due, c.id;
  `;
  const output = run("sqlite3", ["-json", databasePath, query]);
  const parsed: unknown = JSON.parse(output);
  if (!Array.isArray(parsed)) throw new Error("sqlite3 returned a non-array result");

  return parsed.map((row, index) => {
    if (
      typeof row !== "object" ||
      row === null ||
      !("due" in row) ||
      !("flds" in row) ||
      typeof row.due !== "number" ||
      typeof row.flds !== "string"
    ) {
      throw new Error(`Invalid note row at index ${index}`);
    }
    return { due: row.due, flds: row.flds };
  });
}

interface Varint {
  value: number;
  nextOffset: number;
}

function readVarint(bytes: Buffer, startOffset: number): Varint {
  let value = 0;
  let multiplier = 1;
  let offset = startOffset;

  while (offset < bytes.length) {
    const byte = bytes[offset];
    if (byte === undefined) break;
    value += (byte & 0x7f) * multiplier;
    offset += 1;
    if ((byte & 0x80) === 0) return { value, nextOffset: offset };
    multiplier *= 128;
    if (!Number.isSafeInteger(value) || multiplier > Number.MAX_SAFE_INTEGER) {
      throw new Error("Protobuf varint exceeds JavaScript's safe integer range");
    }
  }

  throw new Error("Truncated protobuf varint");
}

function skipProtobufField(bytes: Buffer, wireType: number, offset: number): number {
  if (wireType === 0) return readVarint(bytes, offset).nextOffset;
  if (wireType === 1) return offset + 8;
  if (wireType === 2) {
    const length = readVarint(bytes, offset);
    return length.nextOffset + length.value;
  }
  if (wireType === 5) return offset + 4;
  throw new Error(`Unsupported protobuf wire type ${wireType}`);
}

function parseMediaEntry(bytes: Buffer, fallbackIndex: number): MediaEntry {
  let offset = 0;
  let name: string | undefined;
  let size: number | undefined;
  let archiveIndex = fallbackIndex;

  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.nextOffset;
    const fieldNumber = Math.floor(tag.value / 8);
    const wireType = tag.value & 0x07;

    if (fieldNumber === 1 && wireType === 2) {
      const length = readVarint(bytes, offset);
      const end = length.nextOffset + length.value;
      name = bytes.toString("utf8", length.nextOffset, end).normalize("NFC");
      offset = end;
    } else if (fieldNumber === 2 && wireType === 0) {
      const result = readVarint(bytes, offset);
      size = result.value;
      offset = result.nextOffset;
    } else if (fieldNumber === 255 && wireType === 0) {
      const result = readVarint(bytes, offset);
      archiveIndex = result.value;
      offset = result.nextOffset;
    } else {
      offset = skipProtobufField(bytes, wireType, offset);
    }
  }

  if (!name || size === undefined) throw new Error("Invalid media entry in Anki package");
  return { name, size, archiveName: String(archiveIndex) };
}

function parseModernMedia(bytes: Buffer): MediaEntry[] {
  const entries: MediaEntry[] = [];
  let offset = 0;

  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.nextOffset;
    const fieldNumber = Math.floor(tag.value / 8);
    const wireType = tag.value & 0x07;
    if (fieldNumber !== 1 || wireType !== 2) {
      offset = skipProtobufField(bytes, wireType, offset);
      continue;
    }

    const length = readVarint(bytes, offset);
    const end = length.nextOffset + length.value;
    if (end > bytes.length) throw new Error("Truncated media entry in Anki package");
    entries.push(parseMediaEntry(bytes.subarray(length.nextOffset, end), entries.length));
    offset = end;
  }

  return entries;
}

function loadMedia(unpackedPath: string, modern: boolean, workingPath: string): MediaEntry[] {
  const mediaPath = join(unpackedPath, "media");
  if (modern) {
    const protobufPath = join(workingPath, "media.pb");
    run("zstd", ["-q", "-d", "-f", mediaPath, "-o", protobufPath]);
    return parseModernMedia(readFileSync(protobufPath));
  }

  const parsed: unknown = JSON.parse(readFileSync(mediaPath, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Invalid legacy Anki media map");
  }

  return Object.entries(parsed).map(([archiveName, name]) => {
    if (typeof name !== "string") throw new Error("Invalid legacy Anki media filename");
    const sourcePath = join(unpackedPath, archiveName);
    return { archiveName, name: name.normalize("NFC"), size: statSync(sourcePath).size };
  });
}

function extractDatabase(unpackedPath: string, workingPath: string): {
  databasePath: string;
  modern: boolean;
} {
  const modernSource = join(unpackedPath, "collection.anki21b");
  const modernTarget = join(workingPath, "collection.sqlite");
  if (existsSync(modernSource)) {
    run("zstd", ["-q", "-d", "-f", modernSource, "-o", modernTarget]);
    return { databasePath: modernTarget, modern: true };
  }

  for (const filename of ["collection.anki21", "collection.anki2"]) {
    const databasePath = join(unpackedPath, filename);
    if (existsSync(databasePath)) return { databasePath, modern: false };
  }
  throw new Error("The archive has no supported Anki collection database");
}

function inferSourceVersion(notes: SqliteNote[]): string {
  for (const note of notes) {
    const firstField = note.flds.split(FIELD_SEPARATOR)[0] ?? "";
    const match = /Welcome to Kaishi 1\.5k! \(version ([^)]+)\)/.exec(firstField);
    if (match?.[1]) return match[1];
  }
  return "unknown";
}

function byteCount(directory: string, files: string[]): number {
  return files.reduce((total, filename) => total + statSync(join(directory, filename)).size, 0);
}

async function extract(args: Arguments): Promise<ExtractionSummary> {
  if (!existsSync(args.archivePath)) throw new Error(`Archive not found: ${args.archivePath}`);
  if (extname(args.archivePath).toLowerCase() !== ".apkg") {
    throw new Error(`Expected an .apkg file, got ${basename(args.archivePath)}`);
  }
  if (existsSync(args.outputPath) && !args.force) {
    throw new Error(`Output already exists: ${args.outputPath}. Pass --force to replace it.`);
  }

  requireCommand("sqlite3");
  requireCommand("unzip");
  requireCommand("zstd");

  const workingPath = mkdtempSync(join(tmpdir(), "zen-kaishi-"));
  const unpackedPath = join(workingPath, "unpacked");
  const outputParent = dirname(args.outputPath);
  const stagedOutput = join(outputParent, `.kaishi-deck-${process.pid}`);

  try {
    mkdirSync(unpackedPath);
    run("unzip", ["-q", args.archivePath, "-d", unpackedPath]);
    const database = extractDatabase(unpackedPath, workingPath);
    const notes = queryNotes(database.databasePath);
    const sourceVersion = inferSourceVersion(notes);
    const words = notes
      .map((note) => sourceWord(note.flds.split(FIELD_SEPARATOR)))
      .filter((word): word is SourceWord => word !== undefined);

    if (words.length !== EXPECTED_WORD_COUNT) {
      throw new Error(`Expected ${EXPECTED_WORD_COUNT} words, found ${words.length}`);
    }

    const media = loadMedia(unpackedPath, database.modern, workingPath);
    const mediaByName = new Map(media.map((entry) => [entry.name, entry]));
    const referencedMedia = new Set<string>();
    const decompressedMedia = new Map<string, string>();
    const archiveSha256 = await sha256(args.archivePath);

    mkdirSync(outputParent, { recursive: true });
    rmSync(stagedOutput, { recursive: true, force: true });
    const stagedAudio = join(stagedOutput, "audio");
    mkdirSync(stagedAudio, { recursive: true });

    const deckWords: DeckWord[] = words.map((word, index) => {
      const id = index + 1;
      const suffix = String(id).padStart(4, "0");
      const wordAudio = `word_${suffix}.mp3`;
      const sentenceAudio = `sentence_${suffix}.mp3`;

      const audioToCopy: Array<readonly [string, string]> = [
        [word.sentenceAudioSource, sentenceAudio],
      ];
      if (word.wordAudioSource) audioToCopy.unshift([word.wordAudioSource, wordAudio]);

      for (const [sourceName, outputName] of audioToCopy) {
        if (extname(sourceName).toLowerCase() !== ".mp3") {
          throw new Error(`Expected MP3 audio for ${word.word}, got ${sourceName}`);
        }
        const mediaEntry = mediaByName.get(sourceName);
        if (!mediaEntry) throw new Error(`Media map has no entry for ${sourceName}`);
        const archivedPath = join(unpackedPath, mediaEntry.archiveName);
        if (!existsSync(archivedPath)) throw new Error(`Archive has no media file ${mediaEntry.archiveName}`);

        let sourcePath = decompressedMedia.get(mediaEntry.archiveName);
        if (!sourcePath) {
          if (database.modern) {
            const mediaWorkingPath = join(workingPath, "media-files");
            mkdirSync(mediaWorkingPath, { recursive: true });
            sourcePath = join(mediaWorkingPath, mediaEntry.archiveName);
            run("zstd", ["-q", "-d", "-f", archivedPath, "-o", sourcePath]);
          } else {
            sourcePath = archivedPath;
          }
          decompressedMedia.set(mediaEntry.archiveName, sourcePath);
        }

        if (statSync(sourcePath).size !== mediaEntry.size) {
          throw new Error(`Size mismatch for ${sourceName}`);
        }
        copyFileSync(sourcePath, join(stagedAudio, outputName));
        referencedMedia.add(sourceName);
      }

      return {
        id,
        deck_order: id,
        word: word.word,
        word_furigana: word.wordFurigana,
        meaning: word.meaning,
        sentence: word.sentence,
        sentence_target_start: word.sentenceTargetStart,
        sentence_target_length: word.sentenceTargetLength,
        sentence_furigana: word.sentenceFurigana,
        sentence_meaning: word.sentenceMeaning,
        word_audio: word.wordAudioSource ? `audio/${wordAudio}` : null,
        sentence_audio: `audio/${sentenceAudio}`,
      };
    });

    const deck = {
      schema_version: 1,
      source: {
        name: KAISHI_NOTETYPE,
        version: sourceVersion,
        url: SOURCE_URL,
        archive_sha256: archiveSha256,
      },
      words: deckWords,
    };
    const jsonPath = join(stagedOutput, "kaishi.json");
    writeFileSync(jsonPath, `${JSON.stringify(deck, null, 2)}\n`, "utf8");

    const audioFiles = deckWords.flatMap((word) =>
      word.word_audio
        ? [basename(word.word_audio), basename(word.sentence_audio)]
        : [basename(word.sentence_audio)],
    );
    const jsonBytes = statSync(jsonPath).size;
    const audioBytes = byteCount(stagedAudio, audioFiles);
    const summary: ExtractionSummary = {
      sourceVersion,
      archiveSha256,
      wordCount: deckWords.length,
      audioFileCount: audioFiles.length,
      uniqueSourceAudioCount: referencedMedia.size,
      jsonBytes,
      audioBytes,
      totalBytes: jsonBytes + audioBytes,
    };
    writeFileSync(join(stagedOutput, "extraction-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

    if (args.force) rmSync(args.outputPath, { recursive: true, force: true });
    renameSync(stagedOutput, args.outputPath);
    return summary;
  } finally {
    rmSync(workingPath, { recursive: true, force: true });
    rmSync(stagedOutput, { recursive: true, force: true });
  }
}

const args = parseArguments(process.argv.slice(2));
extract(args)
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });

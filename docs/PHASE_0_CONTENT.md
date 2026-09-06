# Phase 0 content report

Checked on 2026-09-06 against the official Kaishi repository and release v2.4.2.

## Redistribution decision

Do not bundle or download Kaishi content in the app yet.

The [official repository](https://github.com/donkuri/kaishi) has no `LICENSE` file or license statement. Its GitHub API metadata also reports `license: null`. GitHub's [licensing documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) says that the default copyright rules apply when a repository has no license and do not grant permission to reproduce, distribute, or make derivative works.

The repository README says the deck combines material from Core 2k, Core 10k, Tango N4, and Tango N5. It also says some audio came from AJT Japanese and that sentences came from Core decks on AnkiWeb. Permission from the Kaishi maintainer alone may not cover every text and audio asset. Get written permission that covers redistribution of the word data, sentences, translations, furigana, word audio, and sentence audio in Zen. Record the exact attribution text and any other conditions in this file before committing generated assets.

Public availability on GitHub Releases and AnkiWeb permits downloading the deck for its intended use. It does not supply the missing redistribution grant.

Required attribution is therefore unresolved. Attribution alone cannot replace permission. The permission grant should provide the text Zen must display and confirm which contributor and upstream-source credits it must retain. Until then, preserve this credit trail from the official README:

- 栗 and Tyogin are the deck's main architects.
- shoui, Julian, karifurai, cindsa, Kuuube, stephenmk, and Kaanium contributed proofreading, translations, pitch data, notes, tooling, or furigana work.
- AJT Japanese supplied generated furigana, pitch data, and some audio. The deck's sentences and other audio trace back to Core and Tango decks.

Zen does not use the deck's pictures, so its Irasutoya picture credit is outside the requested content set.

## Extraction result

The extractor was run locally against the official [v2.4.2 release](https://github.com/donkuri/kaishi/releases/tag/v2.4.2), whose package is 108,690,108 bytes. Generated content was measured outside the repository and was not committed.

| Item | Result |
| --- | ---: |
| Vocabulary records | 1,500 |
| Output audio files | 2,999 |
| Unique referenced source audio files | 2,972 |
| `kaishi.json` | 826,608 bytes |
| Renamed audio | 76,142,996 bytes |
| Total generated deck | 76,969,604 bytes, 73.40 MiB |

This is below the plan's approximate 200 MB installed-size switch point. Once redistribution permission exists, use bundled content for V1. A first-launch download would add failure modes without solving the license problem.

The source package SHA-256 is `9a3da60472d940f4a63d79882bb06aa34da8a3ea057d14079668e754c58a22fc`.

## Reproducing the extraction

The script requires Node.js, `unzip`, `zstd`, and `sqlite3` on the developer machine.

```sh
pnpm install
pnpm extract:kaishi -- /path/to/Kaishi.1.5k.apkg --output /tmp/zen-kaishi
```

It reads the 1,500 vocabulary notes in card order, drops the introductory card and unused fields, removes Anki HTML while retaining furigana notation and the exact sentence-highlight offset, and writes deterministic audio filenames. It fails if required text, sentence highlighting, or sentence audio is absent, if referenced audio is not MP3, or if the word count changes. Kaishi v2.4.2 has no word-audio reference for `失礼します`, so that record has `word_audio: null` and the output contains 2,999 audio files.

When permission is documented, run it with the repository output path and commit `assets/deck/kaishi.json`, `assets/deck/extraction-summary.json`, and `assets/deck/audio/`:

```sh
pnpm extract:kaishi -- /path/to/Kaishi.1.5k.apkg --output assets/deck
```

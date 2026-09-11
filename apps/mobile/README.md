# Zen mobile

The local-only Expo app for Zen's Japanese vocabulary review loop.

From the repository root:

```sh
pnpm install
pnpm ios
```

Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before opening a pull request.

## Supported platforms

Zen targets iOS and Android only. `expo.platforms` excludes web so browser requests
to Metro do not render the app or bundle SQLite's web worker. Restart Metro after
changing the platform configuration.

## Deck content

The app bundles all 1,500 cards and the word and sentence audio extracted from
[Kaishi 1.5k v2.4.2](https://github.com/donkuri/kaishi/releases/tag/v2.4.2).
`src/assets/deck/extraction-summary.json` records the source version, archive hash,
card count, and generated asset sizes.

To regenerate the bundled deck from an official `.apkg` release:

```sh
pnpm extract:kaishi -- /path/to/kaishi.apkg --output apps/mobile/src/assets/deck --force
```

The upstream repository does not include a license file. Confirm redistribution
permission before publishing a build that contains these assets.

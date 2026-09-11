# Zen mobile

The local-only Expo app for Zen's Japanese vocabulary review loop.

From the repository root:

```sh
pnpm install
pnpm ios
```

Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before opening a pull request.

## Web rendering

Keep `expo.web.output` set to `single`. Zen loads its data from local SQLite
after mounting, so its web app renders on the client. Static rendering currently
makes Expo's server bundle fail with `Worker chunk not found` for the SQLite web
worker, including when a web request reaches Metro during Expo Go development.
Restart Metro after changing this setting.

Web hosting must serve `index.html` for app routes such as `/words/1` and preserve
the SQLite isolation headers configured in `metro.config.js`.

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

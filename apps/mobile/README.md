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

## Native settings and typography

Settings shares its routes and persistence logic across platforms. The
`settings-controls.ios.tsx` implementation uses Expo UI's SwiftUI Form, Picker,
Toggle, Stepper, and Slider. The default implementation supplies Android controls.
Use a matching SDK 57 Expo Go runtime; no additional native dependency is required.

For redesigned React Native screens, `<Text native>` selects the platform system
font and the 17-point `text-body` baseline. Tailwind also defines `text-subhead`,
`text-footnote`, `text-content-title`, and `text-large-title`. These use explicit
sizes because changing NativeWind's 14-point rem would also change app spacing.
SwiftUI controls use Dynamic Type styles. Japanese text keeps the bundled Gothic
and Mincho fonts; SwiftUI needs their PostScript names from `Fonts`, while React
Native uses their Expo aliases.

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

# Zen mobile

The local-only Expo app for Zen's Japanese vocabulary review loop.

From the repository root:

```sh
pnpm install
pnpm ios
```

Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` before opening a pull request.

## Deck content

The checked-in 12-card deck is original development content. Kaishi 1.5k is not
redistributed because its repository does not provide a license. Once distribution
permission is documented, generate the production deck with:

```sh
pnpm extract:kaishi -- /path/to/kaishi.apkg --output apps/mobile/src/assets/deck --force
```

The generated JSON and static audio map replace the development deck without
changing runtime code.

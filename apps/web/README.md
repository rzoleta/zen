# Zen web

The landing page for Zen, built with SvelteKit, Tailwind CSS, and shadcn-svelte.

From the repository root:

```sh
pnpm install
pnpm web
```

Run `pnpm --filter @zen/web check` and `pnpm --filter @zen/web lint` before opening a pull request.

## Layout

- `src/routes/+page.svelte` renders `src/lib/components/landing.svelte`, the page itself.
- `src/lib/components/flashcard.svelte` is the working review card in the hero; it cycles through
  the real deck entries in `src/lib/data/words.ts`.
- `src/lib/components/furigana.svelte` renders Kaishi's `漢字[かんじ]` markup as `<ruby>`, mirroring
  `apps/mobile/src/lib/furigana.ts`.
- `src/routes/layout.css` holds the theme tokens, copied from the mobile app's palette, and the
  Geist, Noto Sans JP, and Noto Serif JP font imports.

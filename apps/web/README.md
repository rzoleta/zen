# Zen web

The landing page for Zen, built with SvelteKit, Tailwind CSS, and shadcn-svelte.

From the repository root:

```sh
pnpm install
pnpm web
```

Run `pnpm --filter @zen/web check` and `pnpm --filter @zen/web lint` before opening a pull request.

## Design directions

Five directions live in `src/lib/designs/` and are switched with the temporary
control at the bottom of the page (or keys 1–5). The choice persists in the
`?design=` query parameter. Once a direction is picked, delete the other four,
`design-switcher.svelte`, and the `?design=` handling in `src/routes/+page.svelte`.

| Key | File | Idea |
| --- | --- | --- |
| 1 | `card.svelte` | App's light palette; the hero is a working review card |
| 2 | `sentence.svelte` | White, Mincho; a huge native sentence with furigana as the hero |
| 3 | `night.svelte` | App's dark palette; a Zen vs. Anki comparison table |
| 4 | `tategaki.svelte` | Sticky vertical Japanese column; blue marks the target word |
| 5 | `phone.svelte` | Sticky handset whose screen follows the copy as you scroll |

`src/lib/data/words.ts` holds real entries from the bundled Kaishi deck, and
`static/screens/` holds simulator captures copied from `docs/ui/native-ios/`.

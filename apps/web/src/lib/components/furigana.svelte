<script lang="ts">
	import { parseFuriganaMarkup, splitSegmentsAt, type FuriganaSegment } from '$lib/furigana';

	interface Props {
		markup: string;
		/** Character range of the target word inside the plain text. */
		highlight?: { start: number; length: number };
		/** When true, everything outside the highlight is muted, like the card front. */
		dim?: boolean;
		/** Hide readings entirely (card front before reveal). */
		readings?: boolean;
		/** Extra classes for the highlighted range. */
		highlightClass?: string;
		class?: string;
	}

	let {
		markup,
		highlight,
		dim = false,
		readings = true,
		highlightClass = '',
		class: className = ''
	}: Props = $props();

	// Consecutive segments with the same in-range state are grouped so the
	// highlighted word never breaks across lines.
	const runs = $derived.by(() => {
		const parts = highlight
			? splitSegmentsAt(parseFuriganaMarkup(markup), highlight.start, highlight.length)
			: parseFuriganaMarkup(markup).map((segment) => ({ segment, inRange: false }));
		const grouped: { inRange: boolean; segments: FuriganaSegment[] }[] = [];
		for (const { segment, inRange } of parts) {
			const last = grouped.at(-1);
			if (last && last.inRange === inRange) last.segments.push(segment);
			else grouped.push({ inRange, segments: [segment] });
		}
		return grouped;
	});
</script>

<span class="jp {className}" lang="ja">
	{#each runs as run, i (i)}
		<span
			class={run.inRange
				? `whitespace-nowrap ${highlightClass}`
				: dim && highlight
					? 'text-muted-foreground/70'
					: ''}
		>
			{#each run.segments as segment, j (j)}
				{#if segment.reading && readings}
					<ruby>{segment.text}<rp>(</rp><rt>{segment.reading}</rt><rp>)</rp></ruby>
				{:else}
					{segment.text}
				{/if}
			{/each}
		</span>
	{/each}
</span>

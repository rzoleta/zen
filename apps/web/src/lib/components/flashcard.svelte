<script lang="ts">
	// A working replica of the app's review card: tap to flip, grade to advance.
	import { words } from '$lib/data/words';
	import Furigana from './furigana.svelte';
	import { ArrowDown, ArrowUp, Volume2 } from '@lucide/svelte';

	interface Props {
		class?: string;
		/** Serif (Mincho) or sans (Gothic) Japanese, matching the app setting. */
		font?: 'gothic' | 'mincho';
	}

	let { class: className = '', font = 'gothic' }: Props = $props();

	let index = $state(0);
	let revealed = $state(false);
	let leaving = $state<'pass' | 'fail' | null>(null);
	let studied = $state(0);

	const word = $derived(words[index % words.length]!);
	const jpFont = $derived(font === 'mincho' ? 'mincho' : '');

	function flip() {
		if (!revealed) revealed = true;
	}

	function grade(answer: 'pass' | 'fail') {
		if (leaving) return;
		leaving = answer;
		setTimeout(() => {
			index = (index + 1) % words.length;
			studied += 1;
			revealed = false;
			leaving = null;
		}, 220);
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			flip();
		}
	}
</script>

<div class="flex w-full flex-col gap-3.5 {className}">
	<div class="relative aspect-[3/4] w-full" style="perspective: 1100px" data-leaving={leaving}>
		<div
			class="card-inner absolute inset-0 transition-transform duration-[430ms] ease-out"
			class:flipped={revealed}
			class:leave-up={leaving === 'pass'}
			class:leave-down={leaving === 'fail'}
		>
			<!-- Front -->
			<button
				type="button"
				class="face absolute inset-0 flex flex-col items-center justify-center gap-8 rounded-3xl border bg-card p-7 text-center focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
				aria-label="Show answer"
				onclick={flip}
				onkeydown={onKey}
				tabindex={revealed ? -1 : 0}
			>
				<span class="jp {jpFont} text-[3.75rem] leading-none font-medium">{word.word}</span>
				<Furigana
					markup={word.sentenceFurigana}
					highlight={{ start: word.targetStart, length: word.targetLength }}
					dim
					readings={false}
					class="{jpFont} text-xl leading-relaxed"
				/>
			</button>
			<!-- Back -->
			<div
				class="face back absolute inset-0 flex flex-col items-stretch justify-between rounded-3xl border bg-card p-7 text-center"
				aria-hidden={!revealed}
			>
				<div class="flex flex-1 flex-col items-center justify-center gap-2">
					<Furigana
						markup={word.wordFurigana}
						class="{jpFont} text-[3.25rem] leading-tight font-medium"
					/>
					<p class="text-xl text-muted-foreground">{word.meaning}</p>
					<span
						class="mt-1 inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
						aria-hidden="true"><Volume2 class="size-4" /></span
					>
				</div>
				<hr class="border-border" />
				<div class="flex flex-1 flex-col items-center justify-center gap-2">
					<Furigana
						markup={word.sentenceFurigana}
						highlight={{ start: word.targetStart, length: word.targetLength }}
						class="{jpFont} text-xl leading-relaxed"
					/>
					<p class="text-base text-muted-foreground">{word.sentenceMeaning}</p>
				</div>
			</div>
		</div>
	</div>

	{#if revealed}
		<div class="flex gap-3">
			<button
				type="button"
				class="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary text-base font-semibold text-foreground transition-colors hover:bg-fail hover:text-white focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
				onclick={() => grade('fail')}
			>
				<ArrowDown class="size-4" /> Fail
			</button>
			<button
				type="button"
				class="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary text-base font-semibold text-foreground transition-colors hover:bg-pass hover:text-white focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
				onclick={() => grade('pass')}
			>
				<ArrowUp class="size-4" /> Pass
			</button>
		</div>
	{:else}
		<button
			type="button"
			class="h-12 w-full rounded-2xl bg-secondary text-base font-semibold text-foreground transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
			onclick={flip}
		>
			Show answer
		</button>
	{/if}
	<p class="tabular text-center text-sm text-muted-foreground" aria-live="polite">
		{#if revealed}
			Did you know it?
		{:else if studied === 0}
			Tap the card, then grade yourself
		{:else}
			{studied} {studied === 1 ? 'card' : 'cards'} studied
		{/if}
	</p>
</div>

<style>
	.card-inner {
		transform-style: preserve-3d;
	}
	.card-inner.flipped {
		transform: rotateY(180deg);
	}
	.card-inner.leave-up {
		transition: transform 220ms ease-in;
		transform: rotateY(180deg) translateY(-140%);
	}
	.card-inner.leave-down {
		transition: transform 220ms ease-in;
		transform: rotateY(180deg) translateY(140%);
	}
	.face {
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}
	.face.back {
		transform: rotateY(180deg);
	}
</style>

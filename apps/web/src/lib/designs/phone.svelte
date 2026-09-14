<script lang="ts">
	// Direction 5 — "Phone": a sticky handset whose screen follows the copy as you scroll.
	import { Button } from '$lib/components/ui/button';
	import Furigana from '$lib/components/furigana.svelte';
	import { site } from '$lib/data/site';
	import { wordById } from '$lib/data/words';
	import { ArrowDown, ArrowUp, Volume2 } from '@lucide/svelte';

	const word = wordById(303); // 最後
	const screens = ['home', 'front', 'back', 'detail', 'progress'] as const;
	type Screen = (typeof screens)[number];

	const chapters: { screen: Screen; title: string; body: string }[] = [
		{
			screen: 'home',
			title: 'Open the app. Today is already counted.',
			body: 'New cards and due reviews are queued the moment you launch. Ten new words a day is the default; change it if you like.'
		},
		{
			screen: 'front',
			title: 'Read the word where it lives.',
			body: 'The front shows the word and the sentence it appears in, with the word picked out. Say the reading and meaning before you flip.'
		},
		{
			screen: 'back',
			title: 'Flip, then answer one question.',
			body: 'Furigana, meaning, translation, and audio for both word and sentence. Did you know it? Pass or fail, tap or swipe. FSRS takes it from there.'
		},
		{
			screen: 'detail',
			title: 'Every word has a page.',
			body: 'Look any of the 1,500 words up, play its audio, see its next review, or mark it known if you already have it.'
		},
		{
			screen: 'progress',
			title: 'Watch retention hold at ninety.',
			body: 'A review heatmap, daily counts, and where every card sits in the deck. All of it stays on your phone; there is no account.'
		}
	];

	let active = $state<Screen>('home');

	function observe(node: HTMLElement, screen: Screen) {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) if (entry.isIntersecting) active = screen;
			},
			{ rootMargin: '-45% 0px -45% 0px' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

{#snippet phone(current: Screen, sizeClass: string)}
	<div
		class="relative mx-auto aspect-[1206/2622] {sizeClass} overflow-hidden rounded-[2.6rem] border-[6px] border-black bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18),0_24px_48px_-12px_rgba(0,0,0,0.25)]"
		aria-hidden="true"
	>
		<!-- Home -->
		<div
			class="screen absolute inset-0 flex flex-col bg-[#fcfcfc] px-5 pt-14 pb-8 transition-opacity duration-300"
			class:opacity-0={current !== 'home'}
		>
			<div class="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black"></div>
			<div class="flex items-start justify-between">
				<span class="text-2xl font-semibold"><span class="jp">前</span> Zen</span>
				<span class="text-right text-[11px] leading-tight text-neutral-500"
					>Monday<br />September 14</span
				>
			</div>
			<div class="relative flex flex-1 items-center justify-center">
				<div class="relative h-[52%] w-[62%]">
					<div
						class="absolute inset-0 rounded-2xl border border-neutral-200 bg-white"
						style="transform: translate(-12px, 4px) rotate(-11deg)"
					></div>
					<div
						class="absolute inset-0 rounded-2xl border border-neutral-200 bg-white"
						style="transform: translate(12px, 5px) rotate(9deg)"
					></div>
					<div
						class="absolute inset-0 rounded-2xl border border-neutral-200 bg-white"
						style="transform: translate(-5px, 2px) rotate(-4deg)"
					></div>
					<div
						class="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
						style="transform: translate(2px, -2px) rotate(1.5deg)"
					>
						<span class="tabular text-5xl font-semibold tracking-tighter">12</span>
						<span class="text-[11px] text-neutral-500">cards to study</span>
					</div>
				</div>
			</div>
			<p class="mb-3 text-center text-[11px] text-neutral-500">2 to review, 10 new</p>
			<div class="rounded-full bg-black py-3 text-center text-sm font-semibold text-white">
				Start studying
			</div>
		</div>
		<!-- Front -->
		<div
			class="screen absolute inset-0 flex flex-col bg-[#fcfcfc] px-4 pt-14 pb-8 transition-opacity duration-300"
			class:opacity-0={current !== 'front'}
		>
			<div class="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black"></div>
			<div
				class="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-neutral-200 bg-white p-5 text-center"
			>
				<span class="jp text-5xl font-medium">{word.word}</span>
				<Furigana
					markup={word.sentenceFurigana}
					highlight={{ start: word.targetStart, length: word.targetLength }}
					dim
					readings={false}
					class="text-base leading-relaxed"
				/>
			</div>
			<div class="mt-3 rounded-full bg-neutral-200 py-3 text-center text-sm font-semibold">
				Show answer
			</div>
		</div>
		<!-- Back -->
		<div
			class="screen absolute inset-0 flex flex-col bg-[#fcfcfc] px-4 pt-14 pb-8 transition-opacity duration-300"
			class:opacity-0={current !== 'back'}
		>
			<div class="absolute top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black"></div>
			<div
				class="flex flex-1 flex-col rounded-3xl border border-neutral-200 bg-white p-5 text-center"
			>
				<div class="flex flex-1 flex-col items-center justify-center gap-1">
					<Furigana markup={word.wordFurigana} class="text-4xl leading-tight font-medium" />
					<p class="text-neutral-500">{word.meaning}</p>
					<span
						class="mt-1 inline-flex size-7 items-center justify-center rounded-full bg-neutral-100"
						><Volume2 class="size-3.5" /></span
					>
				</div>
				<hr class="border-neutral-200" />
				<div class="flex flex-1 flex-col items-center justify-center gap-1">
					<Furigana
						markup={word.sentenceFurigana}
						highlight={{ start: word.targetStart, length: word.targetLength }}
						class="text-sm leading-relaxed"
					/>
					<p class="text-xs text-neutral-500">{word.sentenceMeaning}</p>
				</div>
			</div>
			<div class="mt-3 flex gap-2">
				<div
					class="flex flex-1 items-center justify-center gap-1 rounded-full bg-neutral-200 py-3 text-sm font-semibold"
				>
					<ArrowDown class="size-3.5" /> Fail
				</div>
				<div
					class="flex flex-1 items-center justify-center gap-1 rounded-full bg-neutral-200 py-3 text-sm font-semibold"
				>
					<ArrowUp class="size-3.5" /> Pass
				</div>
			</div>
		</div>
		<!-- Detail, Progress: real captures -->
		<img
			src="/screens/word-detail.png"
			alt=""
			class="screen absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
			class:opacity-0={current !== 'detail'}
			loading="lazy"
		/>
		<img
			src="/screens/progress.png"
			alt=""
			class="screen absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
			class:opacity-0={current !== 'progress'}
			loading="lazy"
		/>
	</div>
{/snippet}

<div class="min-h-screen bg-background text-foreground">
	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2 font-semibold">
			<span class="jp text-2xl leading-none">前</span> Zen
		</a>
		<nav class="flex items-center gap-2">
			<Button variant="ghost" href={site.github}>Source</Button>
			<Button href={site.download} class="rounded-full px-4">Get the app</Button>
		</nav>
	</header>

	<section class="mx-auto max-w-6xl px-6 pt-12 pb-16 md:pt-20">
		<h1 class="max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight md:text-7xl">
			Japanese flashcards, finished.
		</h1>
		<p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
			The 1,500 words of Kaishi, each in a native sentence with audio, scheduled by FSRS, graded
			with two buttons. Free and open source. Here's a session, start to finish.
		</p>
	</section>

	<div class="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<!-- Sticky handset (desktop) -->
		<div class="hidden md:block">
			<div class="sticky top-0 flex h-screen items-center">
				{@render phone(active, 'w-[18rem] lg:w-[20rem]')}
			</div>
		</div>

		<div>
			{#each chapters as chapter (chapter.screen)}
				<section
					class="flex min-h-[70vh] flex-col justify-center py-16 md:min-h-screen"
					use:observe={chapter.screen}
				>
					<div class="mb-10 md:hidden">{@render phone(chapter.screen, 'w-[14rem]')}</div>
					<h2 class="max-w-md text-3xl font-semibold tracking-tight md:text-4xl">
						{chapter.title}
					</h2>
					<p class="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{chapter.body}</p>
				</section>
			{/each}
		</div>
	</div>

	<section class="border-t">
		<div class="mx-auto grid max-w-6xl gap-x-16 gap-y-10 px-6 py-20 md:grid-cols-3">
			<div>
				<h3 class="text-lg font-semibold">Kaishi 1.5k, built in</h3>
				<p class="mt-2 leading-relaxed text-muted-foreground">
					The deck the immersion community recommends, with every word and sentence voiced. Nothing
					to import.
				</p>
			</div>
			<div>
				<h3 class="text-lg font-semibold">FSRS, on by default</h3>
				<p class="mt-2 leading-relaxed text-muted-foreground">
					Intervals fit to your own review history. Fewer reviews for the same retention, and no
					ease hell.
				</p>
			</div>
			<div>
				<h3 class="text-lg font-semibold">Your words, soon</h3>
				<p class="mt-2 leading-relaxed text-muted-foreground">
					Adding vocabulary from your own reading and watching is coming, so the deck keeps going
					after Kaishi.
				</p>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-24 md:flex-row md:items-end"
		>
			<h2 class="text-4xl font-semibold tracking-tight md:text-5xl">Ten new words. Today.</h2>
			<div class="flex gap-3">
				<Button href={site.download} size="lg" class="h-12 rounded-full px-6 text-base"
					>Get the app</Button
				>
				<Button
					href={site.github}
					size="lg"
					variant="outline"
					class="h-12 rounded-full px-6 text-base">GitHub</Button
				>
			</div>
		</div>
	</section>

	<footer class="border-t">
		<div
			class="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-8 text-sm text-muted-foreground"
		>
			<p>Zen 前. Free and open source.</p>
			<p>
				Deck content from <a class="underline underline-offset-4" href={site.deck.url}
					>Kaishi 1.5k</a
				>.
			</p>
		</div>
	</footer>
</div>

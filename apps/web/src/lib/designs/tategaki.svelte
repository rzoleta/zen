<script lang="ts">
	// Direction 4 — "Tategaki": a sticky vertical Japanese column the page scrolls past; blue marks the target word.
	import { Button } from '$lib/components/ui/button';
	import Furigana from '$lib/components/furigana.svelte';
	import { site } from '$lib/data/site';
	import { wordById } from '$lib/data/words';

	const sample = wordById(1500); // 九つ
	const second = wordById(908); // 雨
	const steps = [
		['Read', 'The word, with its sentence underneath. No readings yet.'],
		['Recall', 'Say the reading and the meaning to yourself. Both, not either.'],
		['Flip', 'Reading, meaning, translation, and audio for the word and the sentence.'],
		['Grade', 'Pass or fail. Swipe up or down. FSRS decides when you see it next.']
	];
</script>

<div class="min-h-screen bg-[#f5f5f5] text-black">
	<div class="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_7rem] lg:grid-cols-[1fr_9rem]">
		<!-- Main column -->
		<div class="min-w-0 border-neutral-200 md:border-r">
			<header class="flex items-center justify-between px-6 py-6 lg:px-12">
				<a href="/" class="flex items-center gap-2 font-medium">
					<span class="mincho text-2xl leading-none">前</span> Zen
				</a>
				<nav class="flex items-center gap-6 text-sm">
					<a href={site.github} class="text-[#2d62ef] hover:underline hover:underline-offset-4"
						>Source</a
					>
					<a href={site.download} class="text-[#2d62ef] hover:underline hover:underline-offset-4"
						>Get the app</a
					>
				</nav>
			</header>

			<!-- Mobile stand-in for the vertical column -->
			<p class="mincho border-y border-neutral-200 px-6 py-3 text-lg md:hidden" lang="ja">
				最後の単語帳。
			</p>

			<section class="px-6 pt-16 pb-24 lg:px-12 lg:pt-28">
				<h1
					class="max-w-3xl text-5xl leading-[1.05] font-medium tracking-tight md:text-6xl lg:text-7xl"
				>
					Fifteen hundred words, and then the world does the teaching.
				</h1>
				<p class="mt-8 max-w-xl text-lg leading-relaxed text-neutral-600">
					Zen is a free flashcard app for Japanese, built around the Kaishi 1.5k deck and FSRS
					scheduling. It's the deck you finish before native content becomes your teacher, and the
					one you keep for the words you pick up after.
				</p>
				<div class="mt-10 flex flex-wrap gap-3">
					<Button
						href={site.download}
						size="lg"
						class="h-12 rounded-md bg-[#2d62ef] px-6 text-base text-white hover:bg-[#2455d6]"
						>Get the app</Button
					>
					<Button
						href={site.github}
						size="lg"
						variant="outline"
						class="h-12 rounded-md border-neutral-300 bg-white px-6 text-base hover:bg-neutral-100"
						>Source</Button
					>
				</div>
			</section>

			<section class="border-t border-neutral-200 px-6 py-20 lg:px-12">
				<div class="grid gap-12 md:grid-cols-[auto_1fr] md:gap-20">
					<!-- The sentence, set vertically like a page of a book -->
					<div
						class="flex h-[30rem] flex-row-reverse justify-center gap-10 rounded-md border border-neutral-200 bg-white px-10 py-8 md:h-[34rem]"
						lang="ja"
					>
						<p class="mincho vertical text-2xl leading-loose md:text-3xl">
							<Furigana
								markup={sample.sentenceFurigana}
								highlight={{ start: sample.targetStart, length: sample.targetLength }}
								highlightClass="text-[#2d62ef]"
								class="mincho"
							/>
						</p>
						<p class="mincho vertical text-2xl leading-loose text-neutral-400 md:text-3xl">
							<Furigana
								markup={second.sentenceFurigana}
								highlight={{ start: second.targetStart, length: second.targetLength }}
								highlightClass="text-[#2d62ef]"
								class="mincho"
							/>
						</p>
					</div>
					<div class="max-w-md self-center">
						<h2 class="text-3xl font-medium tracking-tight">Every word arrives in a sentence</h2>
						<p class="mt-4 leading-relaxed text-neutral-600">
							<span class="text-[#2d62ef]">{sample.word}</span> is nine things.
							{sample.sentenceMeaning} You'll meet the word this way in the wild, so that's how the card
							shows it: highlighted inside a native sentence, with audio for both.
						</p>
						<p class="mt-4 leading-relaxed text-neutral-600">
							All 1,500 sentences come from Kaishi 1.5k, curated by hand and chosen because they use
							words you already know from earlier in the deck.
						</p>
					</div>
				</div>
			</section>

			<section class="border-t border-neutral-200 px-6 py-20 lg:px-12">
				<h2 class="text-3xl font-medium tracking-tight">One card, four beats</h2>
				<ol class="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{#each steps as [title, body], i (title)}
						<li class="border-t border-neutral-300 pt-4">
							<span class="tabular text-sm text-neutral-500">{i + 1}</span>
							<h3 class="mt-2 text-xl font-medium">{title}</h3>
							<p class="mt-2 leading-relaxed text-neutral-600">{body}</p>
						</li>
					{/each}
				</ol>
				<p class="mt-10 max-w-xl leading-relaxed text-neutral-600">
					Two grades instead of four keeps the honest question honest. FSRS uses your answers to fit
					each card's next review to how you actually forget, which in the developers' benchmarks
					means fewer reviews for the same retention than Anki's default scheduler.
				</p>
			</section>

			<section class="border-t border-neutral-200 px-6 py-20 lg:px-12">
				<div class="grid gap-x-16 gap-y-10 md:grid-cols-2">
					<div>
						<h3 class="text-xl font-medium">Nothing to set up</h3>
						<p class="mt-2 leading-relaxed text-neutral-600">
							The deck, the audio, and the scheduler are in the app. Open it and the first ten cards
							are waiting.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-medium">Nothing to sign up for</h3>
						<p class="mt-2 leading-relaxed text-neutral-600">
							Reviews live on your phone. No account, no subscription. The source is public.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-medium">Set in the type you prefer</h3>
						<p class="mt-2 leading-relaxed text-neutral-600">
							Gothic or Mincho for all Japanese text, furigana on the back, light or dark.
						</p>
					</div>
					<div>
						<h3 class="text-xl font-medium">Room to grow</h3>
						<p class="mt-2 leading-relaxed text-neutral-600">
							Adding words from your own reading and watching is coming soon, so the deck outlives
							Kaishi.
						</p>
					</div>
				</div>
			</section>

			<section class="border-t border-neutral-200 px-6 py-24 lg:px-12">
				<h2 class="text-4xl font-medium tracking-tight md:text-5xl">Begin with 私.</h2>
				<div class="mt-8 flex flex-wrap gap-3">
					<Button
						href={site.download}
						size="lg"
						class="h-12 rounded-md bg-[#2d62ef] px-6 text-base text-white hover:bg-[#2455d6]"
						>Get the app</Button
					>
					<Button
						href={site.github}
						size="lg"
						variant="outline"
						class="h-12 rounded-md border-neutral-300 bg-white px-6 text-base hover:bg-neutral-100"
						>Source</Button
					>
				</div>
			</section>

			<footer class="border-t border-neutral-200 px-6 py-8 text-sm text-neutral-500 lg:px-12">
				<p>
					Zen 前. Free and open source. Deck content from <a
						class="text-[#2d62ef] underline underline-offset-4"
						href={site.deck.url}>Kaishi 1.5k</a
					>.
				</p>
			</footer>
		</div>

		<!-- Sticky vertical column -->
		<aside class="hidden md:block">
			<div class="sticky top-0 flex h-screen items-start justify-center py-10" lang="ja">
				<p class="mincho vertical text-3xl leading-none tracking-[0.2em] lg:text-4xl">
					最後の単語帳。
				</p>
			</div>
		</aside>
	</div>
</div>

<style>
	.vertical {
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}
</style>

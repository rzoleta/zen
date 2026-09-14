<script lang="ts">
	// Direction 2 — "Sentence": pure white, Mincho display type, one huge native sentence as the hero.
	import { Button } from '$lib/components/ui/button';
	import Furigana from '$lib/components/furigana.svelte';
	import { site } from '$lib/data/site';
	import { wordById } from '$lib/data/words';

	const hero = wordById(303); // 最後 — last, final
	const front = wordById(154); // 忘れる — to forget
	const intervals = ['10 min', '1 day', '4 days', '12 days', '1 month', '3 months'];
</script>

<div class="min-h-screen bg-white text-black">
	<header class="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
		<a href="/" class="mincho text-xl">前</a>
		<nav class="flex items-center gap-6 text-sm">
			<a href={site.github} class="hover:underline hover:underline-offset-4">Source</a>
			<a href={site.download} class="hover:underline hover:underline-offset-4">Get the app</a>
		</nav>
	</header>

	<section class="mx-auto max-w-5xl px-3 pt-16 pb-24 text-center sm:px-6 md:pt-24">
		<p
			class="mincho text-[1.625rem] leading-[1.9] font-medium sm:text-5xl sm:tracking-wide md:text-7xl md:leading-[1.8]"
		>
			<Furigana
				markup={hero.sentenceFurigana}
				highlight={{ start: hero.targetStart, length: hero.targetLength }}
				dim
				class="mincho"
			/>
		</p>
		<p class="mt-2 text-neutral-500">{hero.sentenceMeaning}</p>
		<p class="mt-1 text-neutral-500">
			<span class="mincho text-black">{hero.word}</span> is read {hero.reading} and means {hero.meaning}.
		</p>

		<h1
			class="mx-auto mt-20 max-w-2xl text-3xl leading-tight font-medium tracking-tight md:text-5xl"
		>
			Learn each word inside the sentence you'll meet it in.
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-600">
			Zen is a flashcard app for Japanese. It holds the 1,500 words of Kaishi, a native sentence and
			audio for each, and a scheduler that learns how you forget. Free, open source, no account.
		</p>
		<div class="mt-8 flex justify-center gap-3">
			<Button
				href={site.download}
				size="lg"
				class="h-11 rounded-none bg-black px-6 text-base text-white hover:bg-neutral-800"
			>
				Get the app
			</Button>
			<Button
				href={site.github}
				size="lg"
				variant="outline"
				class="h-11 rounded-none border-black px-6 text-base hover:bg-neutral-100"
			>
				Source
			</Button>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-20">
		<div class="grid gap-12 md:grid-cols-2 md:gap-8">
			<figure
				class="flex flex-col items-center gap-6 border border-neutral-200 px-8 py-14 text-center"
			>
				<span class="mincho text-6xl font-medium">{front.word}</span>
				<Furigana
					markup={front.sentenceFurigana}
					highlight={{ start: front.targetStart, length: front.targetLength }}
					dim
					readings={false}
					class="mincho text-2xl leading-relaxed"
				/>
				<figcaption class="mt-auto text-sm text-neutral-500">
					Front: word and sentence, no readings
				</figcaption>
			</figure>
			<figure
				class="flex flex-col items-center gap-5 border border-neutral-200 px-8 py-14 text-center"
			>
				<Furigana markup={front.wordFurigana} class="mincho text-5xl leading-tight font-medium" />
				<p class="text-xl text-neutral-600">{front.meaning}</p>
				<Furigana
					markup={front.sentenceFurigana}
					highlight={{ start: front.targetStart, length: front.targetLength }}
					class="mincho mt-4 text-xl leading-relaxed"
				/>
				<p class="text-neutral-600">{front.sentenceMeaning}</p>
				<figcaption class="mt-auto text-sm text-neutral-500">
					Back: reading, meaning, translation, audio
				</figcaption>
			</figure>
		</div>
		<p class="mx-auto mt-10 max-w-xl text-center leading-relaxed text-neutral-600">
			Word on the front, sentence just under it, everything else on the back. It's the card format
			Kaishi ships with, and the one the immersion community converged on after years of word-card
			versus sentence-card debate.
		</p>
	</section>

	<section class="border-t border-neutral-200">
		<div class="mx-auto max-w-5xl px-6 py-20 text-center">
			<h2 class="mincho text-4xl font-medium md:text-5xl">分かった？</h2>
			<p class="mt-3 text-neutral-500">Did you know it?</p>
			<div class="mx-auto mt-10 flex max-w-sm gap-3">
				<div
					class="flex h-12 flex-1 items-center justify-center border border-neutral-300 text-base font-medium"
				>
					Fail
				</div>
				<div
					class="flex h-12 flex-1 items-center justify-center border border-black bg-black text-base font-medium text-white"
				>
					Pass
				</div>
			</div>
			<p class="mx-auto mt-10 max-w-xl leading-relaxed text-neutral-600">
				Two answers, not four. "Hard" and "Easy" turn every review into a judgment call and quietly
				corrupt the schedule when you guess wrong. Zen asks one honest question and moves on. Swipe
				up for pass, down for fail.
			</p>
		</div>
	</section>

	<section class="border-t border-neutral-200">
		<div class="mx-auto max-w-5xl px-6 py-20">
			<h2 class="text-center text-3xl font-medium tracking-tight md:text-4xl">
				Reviews that spread out as you remember
			</h2>
			<div class="mt-12 flex items-end justify-between gap-2" aria-hidden="true">
				{#each intervals as label, i (label)}
					<div class="flex flex-col items-center gap-3" style="flex-grow: {i + 1}">
						<div class="h-10 w-px bg-black"></div>
						<span class="tabular text-xs whitespace-nowrap text-neutral-500">{label}</span>
					</div>
				{/each}
			</div>
			<p class="mx-auto mt-12 max-w-xl text-center leading-relaxed text-neutral-600">
				Zen schedules with FSRS, which fits each card's next review to your own history rather than
				a fixed multiplier. Fewer reviews for the same retention, and no card ever gets stuck at a
				short interval forever. Aim for 90% retention and let the app do the rest.
			</p>
		</div>
	</section>

	<section class="border-t border-neutral-200">
		<div class="mx-auto grid max-w-5xl gap-x-16 gap-y-10 px-6 py-20 md:grid-cols-3">
			<div>
				<h3 class="text-lg font-medium">1,500 words, ready on first launch</h3>
				<p class="mt-2 leading-relaxed text-neutral-600">
					The full Kaishi 1.5k deck is built in: frequency-ordered vocabulary, curated sentences,
					and audio for every word and sentence. No import step.
				</p>
			</div>
			<div>
				<h3 class="text-lg font-medium">Yours, on your phone</h3>
				<p class="mt-2 leading-relaxed text-neutral-600">
					Reviews are stored locally. There's no account, no subscription, and the code is open for
					anyone to read.
				</p>
			</div>
			<div>
				<h3 class="text-lg font-medium">Quiet by design</h3>
				<p class="mt-2 leading-relaxed text-neutral-600">
					Light or dark. Gothic or Mincho. A card, a question, and the next card. Add your own words
					from the things you read and watch, coming soon.
				</p>
			</div>
		</div>
	</section>

	<section class="border-t border-neutral-200">
		<div class="mx-auto max-w-5xl px-6 py-28 text-center">
			<p class="mincho text-8xl font-medium md:text-9xl">前</p>
			<p class="mt-6 text-2xl font-medium tracking-tight">Zen. The last one.</p>
			<div class="mt-8 flex justify-center gap-3">
				<Button
					href={site.download}
					size="lg"
					class="h-11 rounded-none bg-black px-6 text-base text-white hover:bg-neutral-800"
					>Get the app</Button
				>
				<Button
					href={site.github}
					size="lg"
					variant="outline"
					class="h-11 rounded-none border-black px-6 text-base hover:bg-neutral-100">Source</Button
				>
			</div>
		</div>
	</section>

	<footer class="border-t border-neutral-200">
		<div
			class="mx-auto flex max-w-5xl flex-wrap justify-between gap-4 px-6 py-8 text-sm text-neutral-500"
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

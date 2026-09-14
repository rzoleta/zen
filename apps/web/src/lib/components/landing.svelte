<script lang="ts">
	// Landing page: the app's own light palette; the hero is a working review card.
	import { Button } from '$lib/components/ui/button';
	import Flashcard from '$lib/components/flashcard.svelte';
	import GithubIcon from '$lib/components/github-icon.svelte';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import Furigana from '$lib/components/furigana.svelte';
	import { site } from '$lib/data/site';
	import { wordById } from '$lib/data/words';

	const sample = wordById(318);
	const facts = [
		['Words', '1,500, ordered by frequency'],
		['Sentences', 'One native sentence per word'],
		['Audio', 'Every word and every sentence'],
		['Scheduling', 'FSRS, tuned to your own reviews'],
		['Grading', 'Pass or fail, by tap or swipe'],
		['Fonts', 'Gothic or Mincho, your choice'],
		['Storage', 'On your phone, nothing to sign up for'],
		['Price', 'Free, open source']
	];
</script>

<div class="min-h-screen bg-background text-foreground">
	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2 text-lg font-semibold">
			<span class="jp text-2xl leading-none">前</span> Zen
		</a>
		<nav class="flex items-center gap-2">
			<ModeToggle />
			<Button variant="ghost" href={site.github}><GithubIcon class="size-4" /> GitHub</Button>
			<Button href={site.download} class="rounded-full px-4">Get the app</Button>
		</nav>
	</header>

	<section
		class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-10 pb-24 md:grid-cols-[1.1fr_0.9fr] md:pt-16"
	>
		<div class="max-w-xl">
			<h1 class="text-5xl leading-[1.02] font-semibold tracking-tight md:text-7xl">
				The last Japanese flashcard app you'll need.
			</h1>
			<p class="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
				The best Anki settings already baked in. Modern SRS algorithms. Based on the highly popular
				Kaishi 1.5k deck.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<Button href={site.download} size="lg" class="h-12 rounded-full px-6 text-base">
					Get the app
				</Button>
				<Button
					href={site.github}
					size="lg"
					variant="outline"
					class="h-12 rounded-full px-6 text-base"
				>
					<GithubIcon class="size-4" /> GitHub
				</Button>
			</div>
			<p class="mt-4 text-sm text-muted-foreground">iOS and Android. Free.</p>
		</div>
		<div class="mx-auto w-full max-w-sm">
			<Flashcard />
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16">
			<div class="max-w-md">
				<h2 class="text-3xl font-semibold tracking-tight">Learn words in sentences</h2>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Learn vocabulary in the context they are used in. Improves retention much better than
					learning words in isolation. Perfectly crafted for immersion-based techniques.
				</p>
			</div>
			<div class="rounded-3xl border bg-card p-8">
				<div class="flex flex-col gap-6">
					<div>
						<Furigana markup={sample.wordFurigana} class="text-5xl leading-tight font-medium" />
						<p class="mt-1 text-lg text-muted-foreground">{sample.meaning}</p>
					</div>
					<hr />
					<div>
						<Furigana
							markup={sample.sentenceFurigana}
							highlight={{ start: sample.targetStart, length: sample.targetLength }}
							class="text-2xl leading-relaxed"
						/>
						<p class="mt-2 text-muted-foreground">{sample.sentenceMeaning}</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:gap-16">
			<div class="order-2 md:order-1">
				<div class="rounded-3xl border bg-card p-8">
					<p class="text-sm text-muted-foreground">Study</p>
					<dl class="mt-3 divide-y text-lg">
						<div class="flex justify-between py-3">
							<dt>Status</dt>
							<dd class="text-muted-foreground">Review</dd>
						</div>
						<div class="flex justify-between py-3">
							<dt>Next review</dt>
							<dd class="text-muted-foreground">In 12 days</dd>
						</div>
						<div class="flex justify-between py-3">
							<dt>Interval</dt>
							<dd class="tabular text-muted-foreground">12 days</dd>
						</div>
						<div class="flex justify-between py-3">
							<dt>Reviews</dt>
							<dd class="tabular text-muted-foreground">6</dd>
						</div>
						<div class="flex justify-between py-3">
							<dt>Lapses</dt>
							<dd class="tabular text-muted-foreground">1</dd>
						</div>
					</dl>
				</div>
			</div>
			<div class="order-1 max-w-md md:order-2">
				<h2 class="text-3xl font-semibold tracking-tight">Modern SRS Algorithms</h2>
				<p class="mt-4 text-lg leading-relaxed">
					Zen schedules reviews with FSRS, a spaced repetition algorithm that models how memory
					fades and fits each card's next review to your own history.
				</p>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Best-in-class algorithms for optimal retention.
				</p>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto max-w-6xl px-6 py-20">
			<h2 class="text-3xl font-semibold tracking-tight">What's in the box</h2>
			<dl class="mt-8 grid gap-x-12 md:grid-cols-2">
				{#each facts as [label, value] (label)}
					<div class="flex justify-between gap-6 border-t py-4">
						<dt class="font-medium">{label}</dt>
						<dd class="text-right text-muted-foreground">{value}</dd>
					</div>
				{/each}
			</dl>
			<p class="mt-8 max-w-lg text-sm leading-relaxed text-muted-foreground">
				Coming soon: add words from your own reading and watching, so the deck keeps growing after
				Kaishi runs out.
			</p>
		</div>
	</section>

	<section class="border-t">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 md:flex-row md:items-end md:justify-between"
		>
			<h2 class="max-w-lg text-4xl font-semibold tracking-tight md:text-5xl">
				Start grinding now.
			</h2>
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

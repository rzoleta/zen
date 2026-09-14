<script lang="ts">
	// Direction 3 — "Night": the app's dark palette, amber from its charts, and a Zen-vs-Anki table.
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import Furigana from '$lib/components/furigana.svelte';
	import { site } from '$lib/data/site';
	import { wordById } from '$lib/data/words';

	const sample = wordById(194); // 進む — to move forward
	const comparison = [
		['Scheduler', 'FSRS, on from the first card', 'SM-2 by default, FSRS if you find the setting'],
		['Grading', 'Pass or fail', 'Again, Hard, Good, Easy'],
		['Starter deck', 'Kaishi 1.5k built in', 'Find and import an .apkg'],
		['Audio', 'Every word and sentence, bundled', 'Depends on the deck'],
		['First session', 'Open the app', 'Deck options, add-ons, learning steps'],
		['Account', 'None', 'AnkiWeb for sync'],
		['Price', 'Free', 'Free on desktop and Android, $24.99 on iOS'],
		['Source', 'Open', 'Open']
	];
	const deck = [
		['New', 1187, '#a4a4a4'],
		['Learning', 22, '#ffae04'],
		['Mature', 264, '#ffffff'],
		['Known', 27, '#2671f4']
	] as const;
</script>

<div class="dark min-h-screen bg-background text-foreground">
	<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2 font-semibold">
			<span class="jp text-2xl leading-none">前</span> Zen
		</a>
		<nav class="flex items-center gap-2">
			<Button variant="ghost" href={site.github}>Source</Button>
			<Button href={site.download} class="rounded-full px-4">Get the app</Button>
		</nav>
	</header>

	<section
		class="mx-auto grid max-w-6xl items-center gap-16 px-6 pt-12 pb-24 md:grid-cols-[1fr_auto] md:pt-20"
	>
		<div class="max-w-2xl">
			<h1 class="text-5xl leading-[1.02] font-semibold tracking-tight md:text-7xl">
				A better Anki, for one language, with the setup already done.
			</h1>
			<p class="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
				Zen is a flashcard app for Japanese that ships with the deck, the audio, the scheduler, and
				the two-button grading the immersion community recommends. Open it and start.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<Button href={site.download} size="lg" class="h-12 rounded-full px-6 text-base"
					>Get the app</Button
				>
				<Button
					href={site.github}
					size="lg"
					variant="outline"
					class="h-12 rounded-full px-6 text-base">Read the source</Button
				>
			</div>
		</div>

		<!-- Home screen card stack, as CSS -->
		<div class="relative mx-auto h-[22rem] w-[19rem]" aria-hidden="true">
			<div
				class="absolute inset-x-8 inset-y-6 rounded-3xl border bg-card"
				style="transform: translate(-18px, 5px) rotate(-11deg)"
			></div>
			<div
				class="absolute inset-x-8 inset-y-6 rounded-3xl border bg-card"
				style="transform: translate(18px, 7px) rotate(9deg)"
			></div>
			<div
				class="absolute inset-x-8 inset-y-6 rounded-3xl border bg-card"
				style="transform: translate(-7px, 3px) rotate(-4deg)"
			></div>
			<div
				class="absolute inset-x-8 inset-y-6 flex flex-col items-center justify-center rounded-3xl border bg-card shadow-[0_10px_18px_rgba(0,0,0,0.5)]"
				style="transform: translate(3px, -3px) rotate(1.5deg)"
			>
				<span class="tabular text-8xl leading-none font-semibold tracking-tighter">1,500</span>
				<span class="mt-2 text-muted-foreground">cards to study</span>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto max-w-6xl px-6 py-20">
			<h2 class="max-w-xl text-3xl font-semibold tracking-tight">
				Everything you'd configure in Anki, decided for you
			</h2>
			<p class="mt-4 max-w-xl leading-relaxed text-muted-foreground">
				Anki is a general-purpose engine and it's excellent at that. Zen is what you'd build with it
				if you only ever wanted to learn Japanese and followed the current advice to the letter.
			</p>
			<div class="mt-10 overflow-hidden rounded-2xl border">
				<Table.Root class="text-base">
					<Table.Header>
						<Table.Row class="hover:bg-transparent">
							<Table.Head class="h-12 w-[26%] px-5 font-normal text-muted-foreground"></Table.Head>
							<Table.Head class="h-12 w-[37%] px-5 font-semibold text-foreground">Zen</Table.Head>
							<Table.Head class="h-12 w-[37%] px-5 font-normal text-muted-foreground"
								>Anki</Table.Head
							>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each comparison as [row, zen, anki] (row)}
							<Table.Row class="hover:bg-transparent">
								<Table.Cell class="px-5 py-4 whitespace-normal text-muted-foreground"
									>{row}</Table.Cell
								>
								<Table.Cell class="px-5 py-4 font-medium whitespace-normal">{zen}</Table.Cell>
								<Table.Cell class="px-5 py-4 whitespace-normal text-muted-foreground"
									>{anki}</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16">
			<div class="flex flex-col items-center gap-6 rounded-3xl border bg-card p-10 text-center">
				<Furigana markup={sample.wordFurigana} class="text-6xl leading-tight font-medium" />
				<p class="text-xl text-muted-foreground">{sample.meaning}</p>
				<Furigana
					markup={sample.sentenceFurigana}
					highlight={{ start: sample.targetStart, length: sample.targetLength }}
					class="text-2xl leading-relaxed"
				/>
				<p class="text-muted-foreground">{sample.sentenceMeaning}</p>
			</div>
			<div class="max-w-md self-center">
				<h2 class="text-3xl font-semibold tracking-tight">Native sentences, native audio</h2>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Each of the 1,500 words comes with the sentence Kaishi's maintainers chose for it and
					audio for both. The word is highlighted inside the sentence, so you read it in context
					every single time it comes up.
				</p>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Readings show as furigana on the back. Choose Gothic or Mincho for all Japanese text.
				</p>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div class="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16">
			<div class="max-w-md self-center">
				<h2 class="text-3xl font-semibold tracking-tight">Progress you can read at a glance</h2>
				<p class="mt-4 leading-relaxed text-muted-foreground">
					Retention, cards per day, a review heatmap, and where every card in the deck sits.
					Everything is stored on your phone. No account, no sync server, no telemetry.
				</p>
			</div>
			<div class="rounded-3xl border bg-card p-8">
				<p class="text-sm text-muted-foreground">Deck</p>
				<div class="mt-4 flex items-center justify-between gap-8">
					<dl class="flex-1 space-y-3 text-lg">
						{#each deck as [label, count, color] (label)}
							<div class="flex items-center justify-between">
								<dt class="flex items-center gap-3">
									<span class="size-2 rounded-full" style="background: {color}"></span>{label}
								</dt>
								<dd class="tabular">{count.toLocaleString()}</dd>
							</div>
						{/each}
					</dl>
					<svg viewBox="0 0 120 120" class="size-36 shrink-0" aria-hidden="true">
						<circle cx="60" cy="60" r="50" fill="none" stroke="#a4a4a4" stroke-width="14" />
						<circle
							cx="60"
							cy="60"
							r="50"
							fill="none"
							stroke="#ffffff"
							stroke-width="14"
							stroke-dasharray="55 314"
							transform="rotate(-90 60 60)"
						/>
						<circle
							cx="60"
							cy="60"
							r="50"
							fill="none"
							stroke="#ffae04"
							stroke-width="14"
							stroke-dasharray="5 314"
							stroke-dashoffset="-55"
							transform="rotate(-90 60 60)"
						/>
						<circle
							cx="60"
							cy="60"
							r="50"
							fill="none"
							stroke="#2671f4"
							stroke-width="14"
							stroke-dasharray="6 314"
							stroke-dashoffset="-60"
							transform="rotate(-90 60 60)"
						/>
						<text x="60" y="58" text-anchor="middle" fill="#fff" font-size="20" font-weight="600"
							>1,500</text
						>
						<text x="60" y="76" text-anchor="middle" fill="#a4a4a4" font-size="11">cards</text>
					</svg>
				</div>
			</div>
		</div>
	</section>

	<section class="border-t">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-24 md:flex-row md:items-end"
		>
			<div>
				<h2 class="text-4xl font-semibold tracking-tight md:text-5xl">Free. Open source. Yours.</h2>
				<p class="mt-3 max-w-md text-muted-foreground">
					Adding words from your own reading and watching is coming soon.
				</p>
			</div>
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

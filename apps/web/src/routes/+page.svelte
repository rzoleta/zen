<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import DesignSwitcher from '$lib/components/design-switcher.svelte';
	import { designs, type DesignId } from '$lib/data/site';
	import Card from '$lib/designs/card.svelte';
	import Sentence from '$lib/designs/sentence.svelte';
	import Night from '$lib/designs/night.svelte';
	import Tategaki from '$lib/designs/tategaki.svelte';
	import Phone from '$lib/designs/phone.svelte';

	const components = {
		card: Card,
		sentence: Sentence,
		night: Night,
		tategaki: Tategaki,
		phone: Phone
	};

	const design = $derived.by((): DesignId => {
		const requested = page.url.searchParams.get('design');
		return designs.some((d) => d.id === requested) ? (requested as DesignId) : 'card';
	});

	const Design = $derived(components[design]);

	function select(id: DesignId) {
		const url = new URL(page.url);
		url.searchParams.set('design', id);
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>Zen 前 — the last Japanese flashcard app you'll need</title>
	<meta
		name="description"
		content="Zen bundles the Kaishi 1.5k deck, native audio, and FSRS scheduling into a clean, free, open-source flashcard app for Japanese."
	/>
</svelte:head>

<!-- Bottom padding keeps the temporary switcher clear of each design's footer. -->
<div class="pb-16">
	{#key design}
		<Design />
	{/key}
</div>

<DesignSwitcher value={design} onchange={select} />

<script lang="ts">
	import LegalPage from '$lib/components/legal-page.svelte';
	import { site } from '$lib/data/site';
</script>

<svelte:head>
	<title>Terms of Use — Zen 前</title>
	<meta
		name="description"
		content="The terms for using Zen, a free and open-source flashcard app."
	/>
</svelte:head>

<LegalPage title="Terms of Use" updated="September 14, 2026">
	<p>
		Zen is a free, open-source Japanese flashcard app. By using the app or this website, you agree
		to these terms. They're short.
	</p>

	<h2>Using Zen</h2>
	<p>
		Zen is free to use for learning Japanese. There are no accounts, subscriptions, or purchases.
	</p>

	<h2>Open source</h2>
	<p>
		Zen's source code is released under the MIT License. You can read, modify, and share it under
		the terms in the <a href="{site.github}/blob/main/LICENSE">LICENSE file</a>.
	</p>

	<h2>Deck content</h2>
	<p>
		The vocabulary, example sentences, and audio in Zen come from the
		<a href={site.deck.url}>{site.deck.name}</a> deck, a community project. That content belongs to its
		authors and is included with credit. Zen doesn't claim ownership of it, and the MIT License doesn't
		cover it.
	</p>

	<h2>Your data</h2>
	<p>
		Your progress is stored only on your device. There's no cloud backup, so keeping a copy is up to
		you and your phone's backup settings. See the <a href="/privacy">Privacy Policy</a> for details.
	</p>

	<h2>No warranty</h2>
	<p>
		Zen is provided "as is", without warranty of any kind. We do our best, but the app may have
		bugs, and a translation or reading may be wrong. To the extent the law allows, we're not liable
		for any loss or damage that comes from using it.
	</p>

	<h2>Changes</h2>
	<p>
		If these terms change, the date at the top will be updated. Continuing to use Zen after a change
		means you accept the new terms.
	</p>

	<h2>Contact</h2>
	<p>
		Questions? <a href="{site.github}/issues">Open an issue on GitHub</a>.
	</p>
</LegalPage>

<script lang="ts">
	import LegalPage from '$lib/components/legal-page.svelte';
	import { site } from '$lib/data/site';
</script>

<svelte:head>
	<title>Privacy Policy — Zen 前</title>
	<meta
		name="description"
		content="Zen keeps everything on your device. No accounts, no analytics, no tracking."
	/>
</svelte:head>

<LegalPage title="Privacy Policy" updated="September 14, 2026">
	<p>
		Zen is a free, open-source Japanese flashcard app. This page explains what data the app and this
		website handle. The short version: everything stays on your device, and we don't collect
		anything.
	</p>

	<h2>The app</h2>
	<ul>
		<li>
			<strong>Everything stays on your phone.</strong> Your review history, card progress, and settings
			live in a local database on your device. None of it is sent to us or to anyone else.
		</li>
		<li>
			<strong>No account.</strong> You don't sign up, log in, or give us an email address.
		</li>
		<li>
			<strong>No analytics or tracking.</strong> The app has no analytics libraries, ad networks, or crash
			reporters.
		</li>
		<li>
			<strong>No network requests.</strong> The deck, audio, and everything else ship inside the app.
			It works fully offline.
		</li>
		<li>
			<strong>Audio permissions.</strong> On Android the app may ask for audio permissions so it can play
			word and sentence audio. It doesn't record anything.
		</li>
		<li>
			<strong>Uninstalling deletes your data.</strong> There is no copy anywhere else. Your phone's own
			backup (such as iCloud or Google backup) may keep a copy under your account; that's handled by your
			platform, not by us.
		</li>
	</ul>

	<h2>This website</h2>
	<ul>
		<li>The site is static. There are no accounts, forms, or tracking cookies.</li>
		<li>
			Your light or dark theme choice is saved in your browser's local storage. It never leaves your
			browser.
		</li>
		<li>
			The hosting provider that serves this site may keep standard request logs, such as your IP
			address and browser type, to operate the service. We don't use those logs to identify or track
			you.
		</li>
	</ul>

	<h2>Children</h2>
	<p>The app doesn't collect personal data from anyone, including children.</p>

	<h2>Changes</h2>
	<p>
		If this policy changes, the date at the top will be updated. The full history is in the
		<a href={site.github}>GitHub repository</a>.
	</p>

	<h2>Contact</h2>
	<p>
		Questions? <a href="{site.github}/issues">Open an issue on GitHub</a>.
	</p>
</LegalPage>

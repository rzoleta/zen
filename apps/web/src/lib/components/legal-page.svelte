<script lang="ts">
	// Shell for the privacy and terms pages: same header and footer as the landing page,
	// with a narrow prose column in between.
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import GithubIcon from '$lib/components/github-icon.svelte';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import { site } from '$lib/data/site';

	let { title, updated, children }: { title: string; updated: string; children: Snippet } =
		$props();
</script>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2 text-lg font-semibold">
			<span class="jp text-2xl leading-none">{site.mark}</span>
			{site.name}
		</a>
		<nav class="flex items-center gap-2">
			<ModeToggle />
			<Button variant="ghost" href={site.github}><GithubIcon class="size-4" /> GitHub</Button>
			<Button href={site.download} class="rounded-full px-4">Get the app</Button>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-2xl flex-1 px-6 pt-10 pb-24 md:pt-16">
		<h1 class="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
		<p class="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
		<div class="legal mt-10">
			{@render children()}
		</div>
	</main>

	<SiteFooter />
</div>

<style>
	.legal :global(h2) {
		margin-top: 2.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
	.legal :global(p),
	.legal :global(li) {
		margin-top: 1rem;
		line-height: 1.7;
	}
	.legal :global(ul) {
		padding-left: 1.25rem;
		list-style: disc;
	}
	.legal :global(li) {
		margin-top: 0.5rem;
	}
	.legal :global(a) {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
</style>

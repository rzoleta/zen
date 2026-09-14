<script lang="ts">
	import { site } from '$lib/data/site';

	const year = new Date().getFullYear();
</script>

<footer class="border-t">
	<div
		class="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-8 text-sm text-muted-foreground"
	>
		<p>&copy; {year} {site.legalName}</p>
		<nav class="flex gap-6">
			<a class="underline underline-offset-4" href="/privacy">Privacy</a>
			<a class="underline underline-offset-4" href="/terms">Terms</a>
		</nav>
	</div>
</footer>

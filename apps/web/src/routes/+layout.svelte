<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/favicon.png" /></svelte:head>
<ModeWatcher />
{@render children()}

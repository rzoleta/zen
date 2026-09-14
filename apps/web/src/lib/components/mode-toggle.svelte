<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { mode, toggleMode } from 'mode-watcher';
	import { Moon, Sun } from '@lucide/svelte';
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleMode}
	aria-label={mode.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if mode.current === 'dark'}
		<Sun />
	{:else}
		<Moon />
	{/if}
</Button>

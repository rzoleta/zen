<script lang="ts">
	// Temporary: lets the five landing page directions be compared in place.
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { designs, type DesignId } from '$lib/data/site';

	interface Props {
		value: DesignId;
		onchange: (id: DesignId) => void;
	}

	let { value, onchange }: Props = $props();

	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		const target = event.target as HTMLElement | null;
		if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
		const n = Number(event.key);
		if (n >= 1 && n <= designs.length) onchange(designs[n - 1]!.id);
	}
</script>

<svelte:window onkeydown={onKey} />

<div
	class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-neutral-200 bg-white/90 p-1 text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur"
	role="region"
	aria-label="Design switcher"
>
	<ToggleGroup.Root
		type="single"
		{value}
		onValueChange={(v) => v && onchange(v as DesignId)}
		spacing={1}
		class="gap-0.5"
	>
		{#each designs as design, i (design.id)}
			<ToggleGroup.Item
				value={design.id}
				class="h-8 rounded-full px-3 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:hover:bg-neutral-900"
				aria-label="{design.label} (press {i + 1})"
			>
				<span class="tabular opacity-50 sm:mr-1.5">{i + 1}</span><span class="hidden sm:inline"
					>{design.label}</span
				>
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
</div>

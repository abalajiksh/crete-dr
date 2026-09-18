<script>
	import { inline } from './inline.js';

	/** @type {{ text: string }} */
	let { text } = $props();

	const tokens = $derived(inline(text));
</script>

{#each tokens as t}{#if t.kind === 'code'}<code>{t.value}</code>{:else if t.kind === 'strong'}<strong
			>{t.value}</strong
		>{:else if t.kind === 'em'}<em>{t.value}</em>{:else}{t.value}{/if}{/each}

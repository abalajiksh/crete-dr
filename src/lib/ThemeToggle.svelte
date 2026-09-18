<script>
	import { onMount } from 'svelte';
	import { current, toggle } from './theme.js';

	// Starts null so the server-rendered markup commits to neither theme: the
	// page is prerendered once and served to both, and app.html has already
	// stamped the real theme on <html> before this ever runs.
	let theme = $state(/** @type {'light' | 'dark' | null} */ (null));

	onMount(() => {
		theme = current();
	});
</script>

<button
	type="button"
	class="toggle"
	aria-label="Switch to {theme === 'dark' ? 'light' : 'dark'} theme"
	aria-pressed={theme === 'dark'}
	onclick={() => (theme = toggle())}
>
	<!-- Lucide sun / moon, per the design system's icon note. -->
	<svg
		viewBox="0 0 24 24"
		width="16"
		height="16"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if theme === 'dark'}
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
		{:else}
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		{/if}
	</svg>
	<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
</button>

<style>
	/* Square, flush-left label, 2px border — the system's button geometry at
	   interface size. No radius anywhere, per the design system. */
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: 2px solid var(--color-divider);
		color: inherit;
		font: inherit;
		font-size: 13px;
		padding: 5px 10px;
		cursor: pointer;
		border-radius: var(--radius-sm);
	}

	.toggle:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	/* The label swaps between "Light" and "Dark", which are different widths;
	   reserving the wider one stops the nav shifting on click. */
	.toggle span {
		min-width: 5ch;
		text-align: left;
	}
</style>

<script>
	/** @type {{ version: string, note?: string }} */
	let { version, note } = $props();
</script>

<footer class="wrap">
	<span class="name">crête {version}</span>
	{#if note}
		<span class="note">{@render note()}</span>
	{:else}
		<span class="note">
			MIT License — Ashwin Balaji 2026. DSD decode by libdsddpcm (BSD-2-Clause). FFmpeg tier under
			LGPL 2.1+.
		</span>
	{/if}
	<a href="https://codeberg.org/abksh/Crete">codeberg.org/abksh/Crete</a>
</footer>

<style>
	footer {
		border-top: 2px solid var(--color-divider);
		padding: 32px 24px 64px;
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
		align-items: baseline;
	}

	.name {
		font-family: var(--font-heading);
		font-weight: var(--font-heading-weight);
		font-size: 18px;
	}

	.note {
		font-size: 13px;
		color: var(--color-neutral-700);
		max-width: 70ch;
	}

	footer a {
		font-size: 13px;
		margin-left: auto;
	}
</style>

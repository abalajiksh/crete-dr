<script>
	/**
	 * A screenshot slot. Until a real capture is dropped into static/screenshots/
	 * and named in the data file, this renders a labelled placeholder at the same
	 * aspect ratio — so a missing image is obvious rather than silently absent,
	 * and adding one needs no change here.
	 *
	 * @type {{ src: string | null, placeholder: string, caption: string,
	 *          alt?: string, width?: number, height?: number, wide?: boolean }}
	 */
	let { src, placeholder, caption, alt, width, height, wide = false } = $props();
</script>

<figure class:wide>
	<div class="frame">
		{#if src}
			<img {src} alt={alt ?? caption} {width} {height} loading="lazy" decoding="async" />
		{:else}
			<div class="slot" role="img" aria-label="{placeholder} — capture pending">
				<span>{placeholder}</span>
				<span class="pending">capture pending</span>
			</div>
		{/if}
	</div>
	<figcaption>{caption}</figcaption>
</figure>

<style>
	figure {
		margin: 0;
	}

	.frame {
		border: 2px solid var(--color-divider);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* Matches the captures' own 1600×1118, so a pending slot reserves the same
	   box the real image will occupy and nothing reflows when one is added. */
	.slot {
		aspect-ratio: 1600 / 1118;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		gap: 4px;
		padding: 16px;
		background: var(--color-neutral-100);
		/* A hatch, so an empty slot cannot be mistaken for a pale screenshot. */
		background-image: repeating-linear-gradient(
			45deg,
			transparent 0 10px,
			color-mix(in srgb, var(--color-text) 5%, transparent) 10px 20px
		);
		font-size: 13px;
	}

	.pending {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-accent-700);
	}

	figcaption {
		font-size: 13px;
		color: var(--color-neutral-700);
		margin-top: 8px;
	}
</style>

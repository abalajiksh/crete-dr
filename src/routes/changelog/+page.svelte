<script>
	import Footer from '$lib/Footer.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import { releases, IMPACT } from '$lib/releases.js';

	/** @param {string} iso */
	function longDate(iso) {
		const [y, m, d] = iso.split('-').map(Number);
		return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}
</script>

<svelte:head>
	<title>Changelog — crête</title>
	<meta
		name="description"
		content="Every crête release, and whether it moved a number. Where measurements changed, the flag that reproduces the old behaviour is named."
	/>
</svelte:head>

<div class="wrap">
	<header class="page-head">
		<p class="kicker">Changelog</p>
		<h1>Every release says whether it moved a number.</h1>
		<p class="lede">
			A meter's version history has one obligation ordinary software does not: it must state, for
			each change, whether previously recorded measurements are still comparable. Entries below are
			marked accordingly — and where numbers did move, the flag that reproduces the old behaviour is
			named.
		</p>
	</header>

	<section class="legend">
		{#each Object.entries(IMPACT) as [key, meta] (key)}
			<div class="legend-item">
				<span class="chip {key}">{meta.label}</span>
				<span class="note">{meta.hint}</span>
			</div>
		{/each}
	</section>

	<section class="section releases">
		{#each releases as r (r.version)}
			<article class="release">
				<div class="meta">
					<h2 class="ver">{r.version}</h2>
					<time datetime={r.date}>{longDate(r.date)}</time>
					{#if r.version === version}
						<span class="chip current">current</span>
					{/if}
					<div class="chips">
						{#each r.impact as i}
							<span class="chip {i}" title={IMPACT[i].hint}>{IMPACT[i].label}</span>
						{/each}
					</div>
				</div>
				<div class="body">
					<h3>{r.title}</h3>
					{#each r.body as para}
						<p><Inline text={para} /></p>
					{/each}
				</div>
			</article>
		{/each}
	</section>

	<section class="section">
		<div class="cols-tight">
			<div>
				<h2>What the history is for</h2>
				<p class="measure">
					Three of these releases changed every DR value crête had ever produced. Each one names the
					flag that gives them back.
				</p>
				<p class="measure">
					A measurement you cannot attribute to a version and an algorithm is not a measurement. That
					is why JSON records the averaging mode, the block set, and the full DSD decode
					configuration on every result it writes.
				</p>
				<a class="btn btn-secondary" href="/testing/">How each change was validated →</a>
			</div>
		</div>
	</section>
</div>

<Footer {version}>
	{#snippet note()}
		Release notes condensed from the project's working record. Full commit history on Codeberg.
	{/snippet}
</Footer>

<style>
	h2 {
		margin-bottom: 8px;
	}

	/* ── The impact legend ────────────────────────────────────────────── */

	.legend {
		border-top: 2px solid var(--color-divider);
		border-bottom: 2px solid var(--color-divider);
		padding: 20px 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 12px 32px;
	}

	.legend-item {
		display: flex;
		gap: 10px;
		align-items: baseline;
	}

	.legend-item .note {
		font-size: 13px;
	}

	/* ── Chips ────────────────────────────────────────────────────────── */

	/* Square, bordered, uppercase — the system's tag at label size. The one that
	   matters most (numbers moved) is the only one that carries the accent. */
	.chip {
		display: inline-block;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 3px 7px;
		border: 1px solid var(--color-divider);
		white-space: nowrap;
	}

	.chip.moves {
		background: var(--color-accent);
		color: var(--poster-ink);
		border-color: var(--color-accent);
	}

	.chip.identical {
		border-color: var(--color-text);
	}

	.chip.current {
		background: var(--color-text);
		color: var(--color-bg);
		border-color: var(--color-text);
	}

	/* ── The release list ─────────────────────────────────────────────── */

	.releases {
		padding-top: 0;
	}

	/* Version and chips held in a left column, the notes beside them — the
	   history reads as one ruled run rather than a stack of cards. */
	.release {
		display: grid;
		grid-template-columns: minmax(180px, 220px) 1fr;
		gap: 40px;
		border-top: 2px solid var(--color-divider);
		padding: 32px 0;
	}

	.release:first-child {
		border-top: none;
	}

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		position: sticky;
		top: 88px;
		align-self: start;
	}

	.ver {
		font-size: 30px;
		line-height: 1;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.meta time {
		font-size: 13px;
		color: var(--color-neutral-700);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 4px;
	}

	.body h3 {
		font-size: 24px;
		margin: 0 0 16px;
		max-width: 30ch;
	}

	.body p {
		max-width: 68ch;
		margin: 0 0 14px;
	}

	.body p:last-child {
		margin-bottom: 0;
	}

	@media (max-width: 720px) {
		.release {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.meta {
			position: static;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: baseline;
			gap: 10px;
		}
	}
</style>

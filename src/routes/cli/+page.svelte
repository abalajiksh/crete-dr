<script>
	import Footer from '$lib/Footer.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import {
		EFFECT,
		flagGroups,
		lfeTable,
		formats,
		provenance,
		exits,
		recipes
	} from '$lib/cliData.js';
</script>

<svelte:head>
	<title>CLI reference — crête</title>
	<meta
		name="description"
		content="Every crête command-line flag, its default, and whether it moves a number: the three DR axes, the three DSD decode axes, SACD area and stream selection, the five output formats, exit status and parallelism."
	/>
</svelte:head>

<div class="wrap">
	<header class="page-head">
		<p class="kicker">CLI reference</p>
		<h1>Every flag, its default, and whether it moves a number.</h1>
		<p class="lede">
			crête needs no flags to measure correctly — the defaults are the validated path, and the
			figures on this site are all produced without one. The flags exist for the cases where the
			default is not what you want: a different mix on the disc, a different area of the SACD, or a
			deliberate A/B against a value someone recorded under an older algorithm. This page is the
			complete surface of <code>crete {version}</code>, grouped by what each flag actually changes.
		</p>
	</header>

	<section class="stats band">
		<div class="stat">
			<div class="stat-num">14</div>
			<div class="stat-label">flags in total</div>
		</div>
		<div class="stat">
			<div class="stat-num accent">0</div>
			<div class="stat-label">needed for a correct run</div>
		</div>
		<div class="stat">
			<div class="stat-num">3</div>
			<div class="stat-label">axes recorded in every JSON row</div>
		</div>
		<div class="stat">
			<div class="stat-num">2</div>
			<div class="stat-label">marked A/B-only in the help text</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">01 — What a flag can do</p>
		<div class="cols-tight">
			<div>
				<h2 class="h-lead">Three kinds of flag, and only one of them is dangerous</h2>
				<p class="measure">
					Conflating these is how an unreproducible measurement gets recorded. A flag that changes
					the presentation is free. A flag that changes which stream is decoded produces a perfectly
					valid number about a different piece of audio. A flag that changes the algorithm produces
					a different number about the same audio — and that one has to travel with the number, or
					the number is worthless.
				</p>
				<p class="measure">
					crête’s answer is that the third kind is written into every JSON result it emits. The
					table below carries the same distinction in its last column.
				</p>
			</div>
			<div class="legend">
				{#each Object.entries(EFFECT) as [key, meta] (key)}
					<div class="legend-item">
						<span class="chip {key}">{meta.label}</span>
						<span class="note">{meta.hint}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	{#each flagGroups as g, i (g.id)}
		<section class="section">
			<p class="kicker">{String(i + 2).padStart(2, '0')} — {g.title}</p>
			<p class="intro">{g.intro}</p>
			<div class="scroll-x">
				<table class="table flags">
					<thead>
						<tr>
							<th style="width:17%">Flag</th>
							<th style="width:19%">Values</th>
							<th style="width:13%">Default</th>
							<th>What it does</th>
						</tr>
					</thead>
					<tbody>
						{#each g.flags as f (f.flag)}
							<tr>
								<td><code class="flagname">{f.flag}</code></td>
								<td>
									{#if f.values}<code class="vals">{f.values}</code>{:else}<span class="dim">—</span
										>{/if}
								</td>
								<td><span class="def">{f.fallback}</span></td>
								<td>
									<Inline text={f.note} />
									<span class="chip {f.effect}" title={EFFECT[f.effect].hint}
										>{EFFECT[f.effect].label}</span
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if g.id === 'measurement'}
				<div class="cols-tight sub">
					<div>
						<h3>The LFE rule, with both sides measured</h3>
						<p class="measure">
							crête’s DR for a 5.1 or 7.1 file is the mean of the <em>scored</em> channels —
							everything but the LFE. A <code>.1</code> track is a band-limited effects channel whose
							crest factor is nearly flat and whose level is mix-dependent, so averaging it in measures
							the mixer’s bass management rather than the music. TT DR defines nothing past stereo, so
							this is a <a href="/standards/">chosen rule</a>, and crête says which rule produced which
							number rather than presenting one as <em>the</em> multichannel DR. foobar2000 chooses the
							other way; the flag exists so the two can be compared directly.
						</p>
					</div>
					<div>
						<table class="ab">
							<caption class="note">{lfeTable.caption}</caption>
							<thead>
								<tr><th>Setting</th><th>DR raw</th><th>Scored</th><th>Lowest</th></tr>
							</thead>
							<tbody>
								{#each lfeTable.rows as r (r.mode)}
									<tr>
										<td><code>{r.mode}</code> <span class="dim tagnote">{r.tag}</span></td>
										<td class="num">{r.raw}</td>
										<td class="num">{r.scored}</td>
										<td>{r.lowest}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			{#if g.id === 'dsd'}
				<p class="note after-table">
					The support matrix, the tap counts and the reasoning behind each chain are on the
					<a href="/formats/">Formats</a> page. <code>crete --version</code> prints the resolved
					chain, decimation, tap count and group delay for DSD64 through DSD512 at whatever settings
					you pass it, which is the fastest way to see what a combination actually does before
					committing a run to it.
				</p>
			{/if}

			{#if g.id === 'input'}
				<div class="sub">
					<h3>A music Blu-ray commonly ships the same album several times over</h3>
					<p class="measure">
						One DSOTM remux carries six audio streams — LPCM 5.1 96 kHz, DTS-HD MA 5.1, TrueHD 7.1
						Atmos, an AC-3 core, and stereo LPCM and DTS-HD MA. These are
						<strong>different mixes with different DR</strong>, not different encodings of one mix,
						so crête refuses to pick one silently:
					</p>
					<pre class="term">{`Warning: album.mkv has 6 audio streams; measured stream 2 (PCM_S24LE, 6 ch, 96000 Hz). Use --stream N to choose.`}</pre>
					<p class="note after-table">
						FFmpeg’s unaided pick is not stable across remuxes of the same content: on the file above
						it selects the 13.8 Mbps LPCM track, while on a 60-second copy of the same six streams it
						selects the TrueHD one. Single-stream files are unaffected — no warning, and no extra
						JSON keys.
					</p>
				</div>
			{/if}

			{#if g.id === 'run'}
				<div class="cols-tight sub">
					<div>
						<h3>What <code>-j</code> parallelises, and what it cannot</h3>
						<p class="measure">
							A worker takes one <em>unit of work</em>, and a unit is a plain file, a cue album, or
							an SACD area — not a track. So a folder of twelve FLACs uses twelve workers’ worth of
							parallelism, while a cue-sliced monolith or a disc image is a single unit and runs on
							one thread however high <code>-j</code> goes. The pool is capped at the number of units
							present, so asking for more never costs anything.
						</p>
					</div>
					<div>
						<h3>Why the default is not one per core</h3>
						<p class="measure">
							crête loads a file before decoding it, and each in-flight file holds its full decoded
							float64 buffer. A monolithic 60-minute DSD64 album is about 2.6 GB at the default
							output rate and eight times that at 352.8 kHz. Up to 0.18.1 the default was one
							worker per core, so a 16 GB box measuring DSD512 asked for 22 GB and was killed by
							the OS — with empty stderr, which reads as a crash. Since 0.19.0 the default pool is
							fitted to free memory as well as cores, estimated per item from its header, and says
							so when memory decides:
						</p>
						<pre class="term">{`Note: using 3 of 12 cores -- each worker needs about 3.7 GB
and 12 GB is available. Override with --jobs or --memory-limit.`}</pre>
						<p class="measure">
							It is a memory control, not a correctness one: the JSON tracks array is
							byte-identical across <code>--jobs</code> and <code>--memory-limit</code> settings,
							and <code>-j</code> is verified bit-identical to a sequential run on FLAC, DSD and cue
							albums. The Linux and Windows detection paths have not yet been run.
						</p>
					</div>
				</div>
			{/if}
		</section>
	{/each}

	<section class="section">
		<p class="kicker">07 — Output formats</p>
		<h2>Five renderings of one analysis</h2>
		<p class="intro">
			Chosen with <code>-f</code>. The analysis is identical in all five — these differ in what they
			print, not in what they measured.
		</p>
		<div class="rows">
			{#each formats as f (f.flag)}
				<div class="fmt">
					<code class="fmtflag">-f {f.flag}</code>
					<span>
						<strong>{f.name}</strong><br />
						<span class="note"><Inline text={f.note} /></span>
					</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<p class="kicker">08 — Reproducibility</p>
		<div class="cols-tight">
			<div>
				<h2 class="h-lead">A JSON row is readable without knowing how it was produced</h2>
				<p class="measure">
					Every axis that can move a figure is written into the result alongside the figure. This is
					the whole reason the flags are safe to have: an A/B run cannot be mistaken later for a
					default one, because the record says which it was.
				</p>
				<a class="btn btn-secondary" href="/changelog/">Which releases moved a number →</a>
			</div>
			<div class="scroll-x">
				<table class="table prov">
					<thead>
						<tr><th style="width:38%">Key</th><th style="width:22%">Present</th><th>What it pins</th></tr>
					</thead>
					<tbody>
						{#each provenance as p (p.key)}
							<tr>
								<td><code>{p.key}</code></td>
								<td class="dim">{p.when}</td>
								<td>{p.what}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">09 — Exit status</p>
		<h2>A meter that measured nothing has not succeeded</h2>
		<p class="intro">
			Three codes, and the new one is the one worth wiring into a script. Since 0.17.0
			<code>0</code> means every input decoded cleanly rather than “something came back”, so a run
			that silently averaged a damaged track into an album value can no longer exit the same way a
			clean one does.
		</p>
		<div class="rows">
			{#each exits as e (e.code)}
				<div class="exit">
					<code class="code-num">exit {e.code}</code>
					<span>
						<strong>{e.when}</strong><br />
						<span class="note"><Inline text={e.note} /></span>
					</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<p class="kicker">10 — Recipes</p>
		<h2>The invocations worth knowing</h2>
		<div class="recipes">
			{#each recipes as r (r.title)}
				<div class="recipe">
					<h3>{r.title}</h3>
					<pre class="term">{#each r.lines as [cmd, note], i (cmd)}<span class="comment"
								># {note}</span
							>{'\n'}{cmd}{i < r.lines.length - 1 ? '\n\n' : ''}{/each}</pre>
				</div>
			{/each}
		</div>
	</section>

	<section class="poster-wrap">
		<div class="poster">
			<p class="kicker">The default is the point</p>
			<h2>No flag on this page is needed to measure an album correctly.</h2>
			<p>
				The defaults are the reference block set, quadratic averaging, the LFE excluded, the
				multistage DSD chain at 44.1 kHz and the 2-channel SACD area — every one of them the path
				the weekly parity run gates. The rest of this page is for deliberately leaving it.
			</p>
			<a class="btn" href="/testing/">What the defaults are gated against →</a>
		</div>
	</section>
</div>

<Footer {version}>
	{#snippet note()}
		Flags, defaults and accepted spellings taken from the argument parser in the Crete repository,
		not from documentation. Run <code>crete --help</code> on your own build for that binary's tiers.
	{/snippet}
</Footer>

<style>
	h2 {
		margin-bottom: 8px;
	}

	.intro {
		max-width: 68ch;
		margin: 0 0 28px;
	}

	.sub {
		margin-top: 40px;
	}

	.sub h3 {
		font-size: 18px;
		margin: 0 0 10px;
	}

	/* ── The effect legend and chips ──────────────────────────────────── */

	.legend {
		display: grid;
		gap: 14px;
		align-content: start;
		border-top: 2px solid var(--color-divider);
		border-bottom: 2px solid var(--color-divider);
		padding: 20px 0;
	}

	.legend-item {
		display: flex;
		gap: 12px;
		align-items: baseline;
	}

	/* Square, bordered, uppercase — the same tag the changelog uses for release
	   impact, and for the same reason: the one that changes a recorded number is
	   the only one that carries the accent. */
	.chip {
		display: inline-block;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 3px 7px;
		border: 1px solid var(--color-divider);
		white-space: nowrap;
	}

	.chip.numbers {
		background: var(--color-accent);
		color: var(--poster-ink);
		border-color: var(--color-accent);
	}

	.chip.selection {
		border-color: var(--color-text);
	}

	/* ── The flag tables ──────────────────────────────────────────────── */

	.scroll-x .table.flags {
		min-width: 760px;
	}

	.flags .flagname {
		white-space: nowrap;
	}

	.flags .vals {
		font-size: 12px;
	}

	.flags .def {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 12.5px;
	}

	/* The chip trails the description rather than taking a column of its own: at
	   this table width a fifth column would force a scroll on the desktop too. */
	.flags .chip {
		margin-left: 8px;
		vertical-align: 1px;
	}

	.ab caption {
		text-align: left;
		padding-bottom: 10px;
	}

	.tagnote {
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	/* ── The ruled lists ──────────────────────────────────────────────── */

	/* Two-column rows: a fixed monospace label, then the prose. Same shape as the
	   DR bands on the home page. */
	.fmt,
	.exit {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 20px;
		align-items: baseline;
	}

	.fmtflag,
	.code-num {
		font-size: 13px;
		white-space: nowrap;
	}

	.rows .fmt strong,
	.rows .exit strong {
		font-size: 14px;
	}

	.prov td code {
		font-size: 12px;
	}

	/* ── Recipes ──────────────────────────────────────────────────────── */

	.recipes {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.recipe h3 {
		font-size: 14px;
		margin: 0 0 10px;
	}

	.recipe .term {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.poster-wrap {
		padding: 64px 0;
	}

	@media (max-width: 720px) {
		.fmt,
		.exit {
			grid-template-columns: 1fr;
			gap: 6px;
		}
	}
</style>

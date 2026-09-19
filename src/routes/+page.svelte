<script>
	import Footer from '$lib/Footer.svelte';
	import Figure from '$lib/Figure.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import { metrics, bands, builds, limits, premises, shots } from '$lib/homeData.js';
</script>

<svelte:head>
	<title>crête — a meter that can prove its own numbers</title>
	<meta
		name="description"
		content="crête measures TT Dynamic Range, EBU R128 loudness, true peak, PLR, PSR and LRA on lossless audio — and gates every figure weekly against an external reference implementation."
	/>
</svelte:head>

<div class="wrap">
	<header>
		<div class="tagrow chips">
			<span class="tag tag-accent">v{version}</span>
			<span class="tag tag-neutral">MIT + BSD-2-Clause</span>
			<span class="tag tag-outline">C++17 · zero dependencies</span>
		</div>
		<h1 class="hero-title">A meter that can prove its own numbers.</h1>
		<p class="lede">
			crête measures TT Dynamic Range, EBU R128 integrated loudness, true peak, PLR, PSR and LRA on
			lossless audio — and every figure it prints is gated weekly against an external reference
			implementation. The name is French for <em>crest</em>: the origin of the audio term
			<em>crest factor</em>.
		</p>
		<div class="btnrow">
			<a class="btn btn-primary" href="#build">Build it</a>
			<a class="btn btn-secondary" href="/testing/">Read the test methodology</a>
		</div>
	</header>

	<section class="stats">
		<div class="stat">
			<div class="stat-num">0</div>
			<div class="stat-label">dependencies, default build</div>
		</div>
		<div class="stat">
			<div class="stat-num">2241</div>
			<div class="stat-label">DR comparisons per weekly run</div>
		</div>
		<div class="stat">
			<div class="stat-num">159 / 0</div>
			<div class="stat-label">passed / failed, weekly #73</div>
		</div>
		<div class="stat">
			<div class="stat-num accent">0.000e+00</div>
			<div class="stat-label">aarch64 vs x86_64, 273 fields</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">01 — What it is for</p>
		<div class="cols">
			<div>
				<h2 class="h-lead">
					The loudness war is a measurable crime. This is the evidence kit.
				</h2>
				<p class="measure">
					Thirty years of masters pushed to the ceiling left a catalogue of records with no dynamics
					left in them — brickwalled, distorted, exhausting after twenty minutes. A dynamic range
					figure is the cheapest way to see it, which is why a DR number is only worth having if it
					is <em>correct</em>.
				</p>
				<p class="measure">
					Most meters hand you a number and no way to check it. crête's whole design premise is the
					opposite: every metric names the specification that governs it, every algorithmic choice
					that the specification does not cover is stated as a choice rather than smuggled in, and
					the whole corpus is re-measured against an external commercial reference every week.
				</p>
			</div>
			<div class="rows">
				{#each premises as p (p.head)}
					<div>
						<h3>{p.head}</h3>
						<p><Inline text={p.body} /></p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">02 — What it measures</p>
		<h2>Every metric, and the standard that governs it</h2>
		<p class="intro">
			Reported per track and per channel. The tags are printed in the output itself and carried in
			the JSON <code>standards</code> map, so a measurement records its own provenance.
		</p>
		<div class="scroll-x">
			<table class="table">
				<thead>
					<tr>
						<th style="width:26%">Metric</th>
						<th style="width:24%">Governing standard</th>
						<th>Definition as implemented</th>
					</tr>
				</thead>
				<tbody>
					{#each metrics as m (m.metric)}
						<tr>
							<td><strong>{m.metric}</strong></td>
							<td>
								{m.standard}
								{#if m.tag}
									<span class="tag tag-{m.tag.kind} inline-tag">{m.tag.text}</span>
								{/if}
							</td>
							<td><Inline text={m.definition} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note after-table">
			Where a standard stops, crête says so rather than implying coverage. TT DR defines nothing past
			stereo, so the multichannel rule is <a href="/standards/">documented as a chosen rule</a> and
			shipped alongside two companion figures instead of one number presented as authoritative.
		</p>
	</section>

	<section class="section">
		<p class="kicker">03 — Reading a DR score</p>
		<div class="cols-tight">
			<div>
				<h2 class="h-bands">Five bands, and what they sound like</h2>
				<div class="rows bandlist">
					{#each bands as b (b.range)}
						<div class="band">
							<span class="band-range" class:warn={b.tone === 'warn'} class:bad={b.tone === 'bad'}
								>{b.range}</span
							>
							<span>
								<strong class:warn={b.tone === 'warn'} class:bad={b.tone === 'bad'}>{b.name}</strong
								><br />
								<span class="note">{b.note}</span>
							</span>
						</div>
					{/each}
				</div>
			</div>
			<div>
				<h4 class="out-head">Standard output — <code>crete -f std</code></h4>
				<pre class="term">{`------------------------------------------------
 Analyzed Folder: /Music/Random Access Memories
------------------------------------------------
DR         Peak       RMS        Filename
------------------------------------------------

DR11       -1.77 dB   -17.31 dB  01. Horizon Ouverture.wav
DR10       -0.01 dB   -12.91 dB  02. Horizon (Japan CD).wav
DR9        over       -10.56 dB  03. GLBTM (Outtakes).wav
------------------------------------------------

 Number of Files: 9
 Official DR Value: DR9

================================================`}</pre>
				<p class="note out-note">
					Compatible with the dr.loudness-war.info submission format. Four further formats:
					<code>foobar</code>, <code>ext</code> (26-column parity table), <code>detail</code>, and
					<code>json</code>.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">04 — The application</p>
		<div class="cols-tight app-intro">
			<div>
				<h2 class="h-lead">A GUI that is the same measurement, not a lighter one</h2>
				<p class="measure">
					<code>crete-gui</code> is Dear ImGui over SDL2 and OpenGL, laid out as horizontal bands:
					source bar, DSD strip, verdict band, a DR meter-bar table and a grouped detail panel.
					Drag-and-drop, native file and folder dialogs, sortable results, light and dark shells.
				</p>
				<p class="measure">
					An album's files are decoded and analysed across a thread pool sized to the host's cores,
					order-preserving and verified bit-identical to a sequential run — around 5–6× faster on a
					typical album, with no number moved. Log writing is opt-in; by default results stay in the
					window.
				</p>
			</div>
			<div class="rows">
				<div>
					<strong>DSD strip</strong>
					<p>
						Appears only for DSD sources; exposes chain, filter and output rate. Picking
						<em>Direct</em> auto-restricts the other two to the one valid combination.
					</p>
				</div>
				<div>
					<strong>Channel matrix</strong>
					<p>
						Per-channel meter bars with the lowest scored channel in accent and the LFE greyed as
						unscored.
					</p>
				</div>
				<div>
					<strong>About &amp; DSD Guide panels</strong>
					<p>
						The measurement standard behind each metric, and the full decimation support matrix, in
						the app.
					</p>
				</div>
			</div>
		</div>
		<div class="figures">
			{#each shots as s (s.id)}
				<Figure
					src={s.src}
					placeholder={s.placeholder}
					caption={s.caption}
					alt={s.alt}
					width={s.width}
					height={s.height}
				/>
			{/each}
		</div>
	</section>

	<section class="section" id="build">
		<p class="kicker">05 — Build</p>
		<h2>Three CLI tiers, one GUI. The default has nothing to install.</h2>
		<p class="intro">
			A single translation unit, no external libraries, no build step beyond <code>make</code>.
			Optional tiers layer on top and never enter the default path.
		</p>
		<div class="cols-tight">
			<div>
				<pre class="term build-cmd">{`git clone https://codeberg.org/abksh/Crete
cd Crete
make                  `}<span class="comment"># zero-dep CLI</span>{`
./crete /path/to/album/`}</pre>
				<div class="btnrow">
					<a class="btn btn-primary" href="https://codeberg.org/abksh/Crete">Repository on Codeberg</a>
					<a class="btn btn-secondary" href="/formats/">Full build matrix</a>
				</div>
			</div>
			<div class="scroll-x">
				<table class="table">
					<thead>
						<tr><th>Target</th><th>Binary</th><th>Adds</th></tr>
					</thead>
					<tbody>
						{#each builds as b (b.target)}
							<tr>
								<td><code>{b.target}</code></td>
								<td><code>{b.binary}</code></td>
								<td><Inline text={b.adds} /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">06 — Known limitations</p>
		<div class="cols-tight">
			<div>
				<h2 class="h-lead">What crête does not do, stated before you find out</h2>
				<p class="measure">
					Nothing below is hidden in a footnote elsewhere. Every one of these is an open item with a
					measurement behind it, and the <a href="/testing/">Testing</a> page carries the numbers.
				</p>
				<a class="btn btn-secondary limits-btn" href="/testing/">All limitations in detail</a>
			</div>
			<div class="rows">
				{#each limits as l (l.head)}
					<div><strong>{l.head}</strong> <span class="note">{l.body}</span></div>
				{/each}
			</div>
		</div>
	</section>

	<section class="poster-wrap">
		<div class="poster">
			<p class="kicker">The whole point</p>
			<h2>Every number has an oracle. Anything else is a vibe with a decimal point.</h2>
			<p>
				Reference-validated, deterministic, bit-reproducible across architectures. Where no reference
				exists, crête declines to invent one — it states the rule, reports the companion figures, and
				tells you what it could not check.
			</p>
			<a class="btn" href="/testing/">See how it is gated →</a>
		</div>
	</section>
</div>

<Footer {version} />

<style>
	header {
		padding: 72px 0 0;
	}

	.chips {
		margin-bottom: 28px;
	}

	.btnrow {
		margin-bottom: 56px;
	}

	.h-lead {
		font-size: 34px;
		max-width: 22ch;
		margin-bottom: 20px;
	}

	.h-bands {
		margin-bottom: 20px;
	}

	h2 {
		margin-bottom: 8px;
	}

	.intro {
		max-width: 56ch;
		margin-bottom: 28px;
	}

	.after-table {
		margin-top: 20px;
		max-width: 62ch;
	}

	.inline-tag {
		margin-left: 6px;
	}

	/* The band list is a two-column ruled run: the score, then what it means. */
	.band {
		display: grid;
		grid-template-columns: 76px 1fr;
		gap: 16px;
	}

	.band-range {
		font-family: var(--font-heading);
		font-weight: var(--font-heading-weight);
		font-size: 20px;
	}

	.warn {
		color: var(--color-accent-700);
	}

	.bad {
		color: var(--color-accent);
	}

	.out-head {
		margin-bottom: 12px;
	}

	.out-note {
		margin-top: 10px;
	}

	.build-cmd {
		margin-bottom: 16px;
		font-size: 13px;
	}

	.app-intro {
		margin-bottom: 32px;
	}

	.limits-btn {
		margin-top: 8px;
	}

	.poster-wrap {
		padding: 0 0 64px;
	}
</style>

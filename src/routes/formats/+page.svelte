<script>
	import Footer from '$lib/Footer.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import { native, ffmpeg, dsdAxes, buildCmds, platforms } from '$lib/formatsData.js';
</script>

<svelte:head>
	<title>Formats — crête</title>
	<meta
		name="description"
		content="crête's own decoders first, the opt-in FFmpeg tier second, and the routing rules that keep it out of the validated paths — plus disc audio, DSD decimation, MQA detection and the platform matrix."
	/>
</svelte:head>

<div class="wrap">
	<header class="page-head">
		<p class="kicker">Formats &amp; decoding</p>
		<h1>Its own decoders first. Everything else is routed, and labelled.</h1>
		<p class="lede">
			crête ships decoders for every format the parity corpus depends on, so that a measurement never
			changes because a library did. The optional FFmpeg tier adds the formats it cannot reasonably
			own — and the routing rules that keep it out of the validated paths are strict, deliberate, and
			stated in the output.
		</p>
	</header>

	<section class="section">
		<p class="kicker">01 — Native decoders</p>
		<h2>In every build, with no dependencies</h2>
		<p class="intro">
			Container parsing and PCM extraction are crête's own, including the FLAC decoder. The FORMAT
			suite transcodes every master into all of these and requires
			<strong>bit-identical metrics</strong> across them.
		</p>
		<div class="scroll-x">
			<table class="table fmt">
				<thead>
					<tr><th style="width:18%">Format</th><th style="width:20%">Extension</th><th>Notes</th></tr>
				</thead>
				<tbody>
					{#each native as f (f.name)}
						<tr>
							<td><strong>{f.name}</strong></td>
							<td>
								{#each f.ext as e}<code class="ext">{e}</code>{/each}
							</td>
							<td><Inline text={f.note} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="cols-tight sub">
			<div>
				<h3>The 4 GB ceiling, and the crash it exposed</h3>
				<p class="measure">
					Plain RIFF stops at 4 GB, which is not an exotic limit for this material — a 43-minute 5.1
					96 kHz/24 extract is 4.47 GB. All three containers now share one payload decoder and
					measure identically to plain WAV. The rewrite also fixed a reachable crash: a truncated WAV
					declaring more data than it holds read past the end of the buffer and
					<strong>segfaulted</strong>. All three walkers now clamp to the bytes actually present and
					report the audio that is there.
				</p>
			</div>
			<div>
				<h3>Cue slicing</h3>
				<p class="measure">
					The sheet is parsed, the referenced file located case-insensitively, decoded once, then
					sliced by track boundary and run through the full pipeline per slice. Track times are held
					as CDDA frames and converted at the actual decoded rate, so one sheet works for 44.1 kHz
					WAV and 352.8 kHz DSD-decoded PCM without rounding loss. Tracks are named to match what the
					common splitters produce, so a sliced monolith pairs cleanly against the per-track album.
				</p>
			</div>
			<div>
				<h3>A memory warning, not a footnote</h3>
				<p class="measure">
					crête loads a file before decoding it. At the default DSD output rate a monolithic
					60-minute DSD64 album decodes to about 2.6 GB of float64; at 352.8 kHz that is 8× more. Cue
					slicing adds one slice plus roughly twice its size as working set. On constrained hosts,
					cap the worker count with <code>-j</code>.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">02 — The FFmpeg tier</p>
		<div class="cols-tight">
			<div>
				<h2>Opt-in, LGPL-only, decode-only, statically linked</h2>
				<p class="measure">
					A one-time script builds a minimal static FFmpeg with no GPL and no nonfree components, so
					<code>crete-ffmpeg</code> is still a single self-contained binary. The default
					<code>make</code> target remains zero-dependency and nothing about this tier is required for
					PCM or DSD analysis.
				</p>
			</div>
			<div>
				<h3 class="routing-head">Routing is strict, for parity reasons</h3>
				<div class="rows">
					<div>
						<strong>Native formats always use crête's own decoders</strong>
						<p>Even in the FFmpeg build. This is what preserves parity against the reference data.</p>
					</div>
					<div>
						<strong>FFmpeg handles only what crête does not own.</strong>
						<p>In zero-dependency builds these formats are rejected with a hint rather than guessed at.</p>
					</div>
					<div>
						<strong>DSD is never routed through FFmpeg.</strong>
						<p>Its decimation is a different filter chain and would break DSD parity outright.</p>
					</div>
				</div>
			</div>
		</div>
		<div class="scroll-x sub">
			<table class="table fmt">
				<thead>
					<tr><th style="width:18%">Format</th><th style="width:20%">Extension</th><th>Notes</th></tr>
				</thead>
				<tbody>
					{#each ffmpeg as f (f.name)}
						<tr>
							<td><strong>{f.name}</strong></td>
							<td>
								{#each f.ext as e}<code class="ext">{e}</code>{/each}
							</td>
							<td><Inline text={f.note} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note rules">
			<code>crete-ffmpeg --version</code> advertises the linked FFmpeg, and the About panel lists every
			extra codec. Video containers work directly — crête ignores video and subtitle streams, so music
			Blu-ray rips need no preparation. Also accepted in folder scans and dialogs: Vorbis, WMA v1/v2/Pro/Lossless,
			WavPack, APE, Musepack and TAK.
		</p>
	</section>

	<section class="section">
		<p class="kicker">03 — Disc audio</p>
		<h2>Three ways a Blu-ray will hand you the wrong number</h2>
		<p class="intro">
			Disc audio is where a meter quietly stops measuring what is on the disc. Each of these was
			found by measuring, and each is now either fixed or labelled in the output.
		</p>

		<article class="case">
			<h3>It is not one album. It is six.</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						One UHD remux of a single title carried six audio streams — LPCM 5.1 at 96 kHz, DTS-HD MA
						5.1, a TrueHD 7.1 Atmos track, an AC-3 core, and stereo LPCM and DTS-HD MA.
						<strong>Those are different mixes with different DR</strong>, not different encodings of one
						mix.
					</p>
					<p class="measure">
						With no explicit choice, crête takes FFmpeg's own pick, which ranks by bitrate and
						channel count. That is reasonable but it is <em>not</em> the container's default flag and
						<em>not</em> stable across remuxes: on the full file it selects the 13.8 Mbps LPCM track;
						on a 60-second stream copy of the same six streams it selects the TrueHD one, because the
						copy carries no bitrate tags. Same audio, different measurement, and originally nothing in
						the output said so.
					</p>
				</div>
				<div>
					<pre class="term">{`Warning: album.mkv has 6 audio streams;
measured stream 2 (PCM_S24LE, 6 ch, 96000 Hz).
Use --stream N to choose.`}</pre>
					<p class="note spaced">
						The chosen index and the stream count appear in the detail output and in JSON, so a
						measurement is reproducible from its own record. Single-stream files gain no warning and
						no extra keys — verified byte-identical.
					</p>
				</div>
			</div>
		</article>

		<article class="case">
			<h3>Dolby DRC is disabled</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						AC-3 and E-AC-3 carry dynamic-range-control metadata and FFmpeg's decoder
						<em>applies it by default</em>. That is correct for a player and wrong for a meter: DRC is
						a playback-time compressor driven by authoring metadata, so measuring it means measuring a
						rendition that is not on the disc. crête pins the DRC scale to zero.
					</p>
					<p class="measure">The difference is large and easy to miss.</p>
					<p class="measure">
						DR barely moves because it is peak minus RMS and DRC scales both. If crête disagrees with
						a player's readout, this is usually why.
					</p>
				</div>
				<div>
					<p class="term-head">On one 5.1 bed, leaving DRC enabled moved</p>
					<table class="ab">
						<tbody>
							<tr><td>Sample peak</td><td class="num after">6.2 dB</td></tr>
							<tr><td>RMS</td><td class="num">3.9 dB</td></tr>
							<tr><td>Integrated loudness</td><td class="num">4.0 LU</td></tr>
							<tr><td>DR</td><td class="num">0.24</td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</article>

		<article class="case">
			<h3>Object audio is measured as its bed</h3>
			<p class="measure wide">
				There is no Atmos or DTS:X renderer in the chain. What gets decoded is the underlying channel
				bed — TrueHD 7.1, or E-AC-3 5.1 for Dolby Digital Plus with Atmos — and the object metadata is
				discarded. crête's numbers for such a file are the bed's numbers, which is exactly what a
				non-Atmos playback chain delivers, and <em>not</em> what a renderer would produce.
			</p>
		</article>

		<article class="case">
			<h3>One thing the disc proves about itself</h3>
			<p class="measure wide">
				Two of those six streams are the same 5.1 96 kHz master delivered as LPCM and as DTS-HD MA.
				Measured on a clip, <strong>every metric is exactly equal</strong> — DR, per-channel DR, sample
				and true peak, all three loudness figures, LRA, PLR, PSR — to <code>0.000e+00</code>. Only RMS
				moves, by 1.2e-04 dB, and the sample counts explain it: one DTS frame of decoder tail, and RMS
				is the only metric that divides by total sample count. The file gates itself, with no external
				oracle — which matters, because none of these formats has reference data.
			</p>
		</article>
	</section>

	<section class="section">
		<p class="kicker">04 — DSD</p>
		<h2>A clean-room decimation kernel, on three declared axes</h2>
		<div class="cols-tight">
			<div>
				<p class="measure">
					DSD bitstreams are decimated to PCM by <code>libdsddpcm</code>, vendored and statically
					linked. It is a clean-room BSD-2-Clause kernel: linear-phase FIR only, so group delay is
					constant, and <strong>unity DC gain</strong> — the +6 dB SACD makeup gain is not applied.
					crête keeps its own container parsing and its one-thread-per-channel decode.
				</p>
				<p class="measure">
					It replaced an LGPL engine transcribed from another player's source, which resolved a
					licensing conflict with crête's MIT terms and made the project cleanly MIT plus
					BSD-2-Clause. Different clean-room filters mean <strong>different numbers</strong>, so every
					DSD reference baseline was regenerated against the commercial reference rather than carried
					over.
				</p>
			</div>
			<div class="rows">
				{#each dsdAxes as a (a.flag)}
					<div>
						<h3><code>{a.flag}</code></h3>
						<p><Inline text={a.text} /></p>
					</div>
				{/each}
			</div>
		</div>

		<div class="cols-tight sub">
			<div>
				<h3>Support matrix</h3>
				<table class="ab matrix">
					<thead>
						<tr><th></th><th>44100</th><th>88200 / 176400 / 352800</th></tr>
					</thead>
					<tbody>
						<tr>
							<td><code>multistage</code></td>
							<td>DSD64–512, any filter</td>
							<td>DSD64–512, <code>default</code> filter only</td>
						</tr>
						<tr>
							<td><code>direct</code></td>
							<td>DSD64 only, <code>default</code> only</td>
							<td class="off">unsupported</td>
						</tr>
					</tbody>
				</table>
				<p class="note spaced">
					Unsupported combinations fail fast with an explanatory message rather than producing a
					number. DSD1024 and above are rejected — the library's input enum tops out at DSD512.
					<code>crete --version</code> prints the resolved chain, decimation, tap count and group delay
					for every rate at the current settings.
				</p>
			</div>
			<div>
				<h3>Read this before quoting a DSD number</h3>
				<p class="measure">
					DSD dynamic range depends on the output rate, and only 44.1 kHz carries a parity claim. At
					352.8 kHz the retained ultrasonic noise-shaping inflates the second-highest block peak far
					more than it inflates RMS, so DR reads +1 to +3 higher. crête and the reference agree on the
					direction but not the magnitude, and <strong
						>every DSD album-level mismatch on record occurs only at that rate</strong
					>. Unfiltered, the ultrasonic content alone drives the meter past full scale — a sample peak
					of +1.7 dBFS on one track.
				</p>
				<p class="measure">
					Results at 88.2 / 176.4 / 352.8 kHz are offered for analysis, not parity. Treat them as a
					different measurement, not a more precise one. There is deliberately
					<strong>no band-limiting flag</strong>: it would be a worse version of what the 44.1 kHz path
					already does.
				</p>
				<h4 class="val-head">Validation</h4>
				<p class="note">
					crête on a <code>.dsf</code> and crête on the WAV exported from it agree exactly, because
					both go through the same decode. Reference rows come from measuring those 32-bit-float
					exports at a pinned decode configuration, at both 44.1 and 352.8 kHz — so the exporter is
					load-bearing for the entire DSD corpus, and it has its own gate. The caveat is stated: this
					validates <em>metrics</em> end to end, not the decimation, whose correctness rests on the library's
					own golden vectors plus crête's internal parity suites.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">05 — MQA</p>
		<h2>Reported unconditionally. There is no flag to turn it off.</h2>
		<p class="intro">
			MQA is a lossy codec delivered inside an ordinary lossless-looking container — 44.1 or 48 kHz,
			stereo, 16 or 24-bit — with the encoded data hidden in the low bits. A dynamic range measurement
			on such a file describes lossy audio dressed as hi-res, so crête flags it every time.
		</p>
		<div class="cols-tight">
			<div>
				<h3>Detection is deterministic, not statistical</h3>
				<p class="measure">
					The primary MQA bitstream is the XOR of one low bit from each left/right sample pair. crête
					reconstructs that bitstream across candidate carrier positions — bit 8 for 24-bit hi-res
					MQA, bit 0 for 16-bit MQA-CD, which shifts the whole encoding down a byte — and searches for
					the <code>datasync</code> packet: a 40-bit sync value followed by a well-formed field structure.
				</p>
				<p class="measure">
					A match is proof rather than a guess; the odds of a coincidental 40-bit magic number
					<em>plus</em> valid fields are negligible, and in practice only the true carrier plane ever hits.
					From the packet crête reads the authored sample rate, the authentication level that distinguishes
					Studio from green, the render filter and bit-depth indices, and the carrier bit position.
				</p>
				<p class="measure">
					A raw low-bit entropy figure is exposed in JSON as a diagnostic and is <em>never</em> treated
					as a verdict — near-full low-bit entropy is equally consistent with analog tape hiss or a prior
					lossy generation, so using it to claim MQA would false-positive on legitimate lossless masters.
				</p>
			</div>
			<div>
				<pre class="term">{`==================================================
⚠  MQA LOSSY ENCODING DETECTED
source is not lossless
--------------------------------------------------
11 track(s) · MQA Studio · authored 44.1 kHz
carrier bit 8 · auth level 9
--------------------------------------------------
DR is measured on the delivered PCM stream;
content encoded above the base band is not
reconstructed (no open MQA decoder exists).
==================================================`}</pre>
				<h4 class="val-head">What it does not do</h4>
				<p class="note">
					crête does not unfold or render MQA. That DSP exists only in the proprietary licensed
					decoder, so DR is always measured on the delivered base-band PCM and the warning says so
					rather than leaving you to infer it.
				</p>
				<p class="note spaced">
					Provenance: the bitstream layout is a clean-room reimplementation of the format
					<em>description</em> in a BSD-2-Clause project's specification and in the published patent —
					facts and an interface, no decoder code — so crête stays MIT.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">06 — Build &amp; platforms</p>
		<h2>One executable, everywhere it is built</h2>
		<div class="cols-tight">
			<div>
				<pre class="term">{#each buildCmds as b, i}{b.cmd}{#if b.note}{' '.repeat(Math.max(1, 28 - b.cmd.length))}<span
								class="comment"># {b.note}</span
							>{/if}{#if i < buildCmds.length - 1}{'\n'}{/if}{/each}</pre>
				<p class="note spaced">
					GUI prerequisites are SDL2 and an OpenGL development package; Dear ImGui is fetched once by
					<code>make setup-imgui</code>. The FFmpeg tier needs its compact static build run once, and
					<code>pkg-config</code>.
				</p>
			</div>
			<div>
				<h3>Platform status</h3>
				<div class="rows">
					{#each platforms as p (p.target)}
						<div>
							<div class="plat">
								<strong>{p.target}</strong>
								<span
									class="state"
									class:good={p.tone === 'good'}
									class:bad={p.tone === 'bad'}>{p.state}</span
								>
							</div>
							<p><Inline text={p.note} /></p>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<p class="note rules">
			There is not one POSIX-threads call in the source — only C++17 standard threading — and file
			dialogs and directory walking are already branched per platform. The only thing that ever
			mattered for Windows was the toolchain's threading model. Packaging and a signed release matrix
			are <strong>scoped but not built</strong>.
		</p>
	</section>
</div>

<Footer {version} />

<style>
	h2 {
		margin-bottom: 8px;
	}

	.intro {
		max-width: 66ch;
		margin-bottom: 28px;
	}

	.rules {
		max-width: 80ch;
		margin-top: 20px;
	}

	.spaced {
		margin-top: 16px;
	}

	.sub {
		margin-top: 40px;
	}

	h3 {
		font-size: 22px;
		margin: 0 0 16px;
	}

	/* A heading inside a ruled list is a list label, not a sub-heading — it keeps
	   the list's size. This page's scoped `h3` would otherwise outrank the
	   `.rows h3` rule in pages.css, which is a specificity tie broken by order. */
	.rows h3 {
		font-size: 14px;
		margin: 0 0 4px;
	}

	.routing-head {
		font-size: 18px;
	}

	.val-head {
		margin: 24px 0 8px;
		font-size: 15px;
	}

	.wide {
		max-width: 80ch;
	}

	/* Extensions sit as a row of small mono chips, not a comma list. */
	.ext {
		display: inline-block;
		font-size: 12px;
		padding: 1px 6px;
		margin: 0 4px 2px 0;
		background: var(--color-neutral-100);
	}

	.scroll-x .table.fmt {
		min-width: 720px;
	}

	.matrix td,
	.matrix th {
		vertical-align: top;
	}

	.matrix .off {
		color: var(--color-neutral-700);
	}

	.case {
		border-top: 2px solid var(--color-divider);
		padding-top: 28px;
		margin-top: 32px;
	}

	.case h3 {
		margin-bottom: 20px;
	}

	.term-head {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-neutral-700);
		margin: 0 0 10px;
	}

	/* Target and its state on one line, the state right-aligned and coloured by
	   how far the target is actually proven. */
	.plat {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
	}

	.state {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-neutral-700);
		white-space: nowrap;
	}

	.state.good {
		color: var(--color-accent-700);
	}

	.state.bad {
		color: var(--color-neutral-600);
	}
</style>

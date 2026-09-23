<script>
	import Footer from '$lib/Footer.svelte';
	import { version } from '$lib/version.js';

	const authorities = [
		{
			body: 'ITU',
			name: 'ITU-R BS.1770-4',
			text: 'K-weighted loudness, channel weighting, and the definition of true peak. Governs integrated loudness, momentary and short-term loudness, and the peak measurement.'
		},
		{
			body: 'EBU',
			name: 'EBU R128 / Tech 3341 / 3342',
			text: 'Gating, meter rates and block grids; loudness range. crête passes the official 3341 and 3342 compliance vector suites.'
		},
		{
			body: 'AES',
			name: 'AES eBrief 373',
			text: 'Peak-to-short-term loudness ratio. Implemented as published, which is why it disagrees with the commercial reference — see below.'
		},
		{
			body: 'PMF',
			name: 'TT Dynamic Range',
			text: 'The Pleasurize Music Foundation procedure behind the DR number and the dr.loudness-war.info submission format. Defined for stereo only.'
		}
	];

	const layouts = [
		{ ch: '1', name: 'mono', order: [{ t: 'M' }] },
		{ ch: '2', name: 'stereo', order: [{ t: 'L R' }] },
		{
			ch: '3 / 4 / 5',
			name: '3.0 / quad / 5.0',
			order: [{ t: 'L R C' }, { t: ' · ', sep: true }, { t: 'L R Ls Rs' }, { t: ' · ', sep: true }, { t: 'L R C Ls Rs' }]
		},
		{ ch: '6', name: '5.1', order: [{ t: 'L R C ' }, { t: 'LFE', lfe: true }, { t: ' Ls Rs' }] },
		{
			ch: '8',
			name: '7.1',
			order: [{ t: 'L R C ' }, { t: 'LFE', lfe: true }, { t: ' Lss Rss Lrs Rrs' }]
		}
	];
</script>

<svelte:head>
	<title>Standards — crête</title>
	<meta
		name="description"
		content="Which specification governs each metric, how the TT DR procedure is implemented, and where the standard runs out: multichannel DR, LFE scoring and the one deliberate divergence."
	/>
</svelte:head>

<div class="wrap">
	<header class="page-head">
		<p class="kicker">Standards &amp; algorithms</p>
		<h1>Which specification, and where the specification runs out.</h1>
		<p class="lede">
			Four bodies govern the metrics crête reports, and they do not cover everything it is asked to
			measure. Where a standard is silent — multichannel dynamic range, DSD decimation, LFE scoring —
			crête states its rule as a rule and reports companions alongside it, rather than presenting one
			figure as authoritative.
		</p>
	</header>

	<section class="section">
		<p class="kicker">01 — The four authorities</p>
		<div class="steps">
			{#each authorities as a (a.name)}
				<div>
					<div class="step-num">{a.body}</div>
					<strong class="aname">{a.name}</strong>
					<p>{a.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<p class="kicker">02 — TT Dynamic Range</p>
		<div class="cols-tight">
			<div>
				<h2>The procedure, as implemented</h2>
				<ol class="proc">
					<li>
						Split the audio into <strong>3-second non-overlapping blocks</strong>. The trailing
						partial block is kept, normalised by its own length.
					</li>
					<li>Compute RMS and peak per block.</li>
					<li>
						Sort <em>that channel's own</em> block RMS values descending; take the loudest 20 %, a floor
						division of the block count.
					</li>
					<li>
						Combine them with the <strong>quadratic mean</strong> — averaging power, not amplitude.
					</li>
					<li>
						<strong>DR(channel)</strong> = 20·log₁₀( that channel's 2nd-highest block peak ÷ that
						channel's top-20 % RMS ).
					</li>
					<li>
						<strong>DR (PMF)</strong> = mean of the per-channel values, rounded to an integer once.
					</li>
					<li>
						<strong>Album DR</strong> = the mean of the raw per-track values, rounded once. Per-track
						values are never rounded before averaging.
					</li>
				</ol>
				<p class="note">
					Using the second-highest peak rather than the highest follows the foobar2000 DR Meter
					changelog. Step 6 taking the channel <em>mean</em> — rather than a separate joint
					measurement — is what removed a structural bias that could never let the joint figure fall
					below either channel.
				</p>
			</div>
			<div>
				<h2 class="h-ab">Two A/B axes, both defaulting to the reference</h2>
				<p class="measure">
					Both switches exist so old numbers can be re-read and new ones attributed. Neither is a
					preference; each has a right answer and it is the default.
				</p>
				<div class="rows">
					<div>
						<h3><code>--dr-mean quadratic | arithmetic</code></h3>
						<p>
							How the loudest 20 % of blocks are averaged. <code>quadratic</code> is the PMF
							procedure and the default; <code>arithmetic</code> reproduces ≤ 0.12.1 bit-for-bit.
							Applies to every format, not just DSD.
						</p>
					</div>
					<div>
						<h3><code>--dr-blocks reference | legacy</code></h3>
						<p>
							Which blocks are ranked at all. <code>reference</code> is the PMF reference
							implementation — trailing block kept, no gate — and the default since 0.14.0.
							<code>legacy</code> reproduces ≤ 0.13.1.
						</p>
					</div>
				</div>
				<p class="note spaced">
					In JSON, every result carries <code>dr_rms_mean</code> and <code>dr_blocks</code>, and DSD
					tracks additionally carry chain, filter and output rate — recording exactly how the numbers
					were produced. An unlabelled DSD result is not interpretable.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">03 — Loudness &amp; peak</p>
		<div class="rows">
			<div>
				<h3>Integrated loudness</h3>
				<p>
					K-weighting per BS.1770-4 through hardcoded biquad coefficients, with absolute gating at
					−70 LUFS and relative gating at 10 LU below the ungated mean. Momentary blocks are 400 ms
					at 75 % overlap; short-term blocks are 3 s at 67 % overlap.
				</p>
				<p>
					Cross-checked against an independent implementation on a 5.1 master: integrated −13.57
					against −13.6 LUFS, LRA 8.22 against 8.2 LU.
				</p>
			</div>
			<div>
				<h3>True peak, and why it is clamped</h3>
				<p>
					A 4× polyphase FIR with 12 taps per phase, per channel; the joint result is the maximum
					across the <strong>scored</strong> channels, so on a multichannel layout the LFE is excluded
					exactly as it is from the joint sample peak, and <code>--dr-lfe</code> moves both together.
					The result is clamped to be at least the sample peak, which BS.1770 requires by definition —
					the reconstructed continuous waveform passes through every sample.
				</p>
				<p>
					Up to 0.14.0 the joint true peak alone had no such guard, so the two joint peaks were
					measured over different channel sets. On a file whose LFE is its loudest channel that
					produced a true peak far above the sample peak for reasons that had nothing to do with
					inter-sample overshoot — a synthetic 5.1 with every channel at −20 dBFS and the LFE at −3
					read −20.000 against −2.986 — and PLR inherited it. The <a href="/changelog/">0.15.0 entry</a>
					has the measurement.
				</p>
				<p>
					The interpolation filter is designed for audio-band content and attenuates energy near
					Nyquist, so without the clamp the oversampled peak can land <em>below</em> the sample peak
					on signals with heavy ultrasonic content. This never happens on PCM or on DSD Direct; it
					does happen on DSD Multistage, whose 80-tap <code>fir1_8</code> stage leaves enough shaped
					noise floor in place to trigger it — five violations on one album, worst −0.143 dB. The
					clamp is a no-op wherever the true peak already exceeds the sample peak, so the official
					true-peak compliance battery is unaffected.
				</p>
			</div>
			<div>
				<h3>One shared short-term grid</h3>
				<p>
					Max Short-Term, LRA and Min PSR share a single short-term block grid — a 3 s window at the
					EBU 3341 meter rate with a 0.1 s hop — computed once per track. Previously LRA and PSR
					sampled the same window on a private 1.0 s grid, which biased Min PSR high, because the
					true minimum window could fall between hops, and thinned the LRA percentile distribution on
					sparse material.
				</p>
				<p>
					Every other metric is bit-identical across that change, and the official compliance vector
					suites pass on the new grid.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">04 — Channel layouts</p>
		<h2>Mono through 7.1, on one shared table</h2>
		<p class="intro">
			Speaker names, LFE identification and BS.1770 weights live in one source file read by the CLI,
			the JSON writer and the GUI, so the three front-ends cannot describe a layout differently.
			Layouts outside this list are measured per channel but carry no speaker semantics: no LFE is
			assumed and every channel is scored at unity weight.
		</p>
		<div class="scroll-x layout-table">
			<table class="table">
				<thead>
					<tr><th style="width:12%">ch</th><th style="width:22%">Layout</th><th>Order</th></tr>
				</thead>
				<tbody>
					{#each layouts as l (l.ch)}
						<tr>
							<td class="num">{l.ch}</td>
							<td><strong>{l.name}</strong></td>
							<td class="order">
								{#each l.order as part}<span
										class:lfe={part.lfe}
										class:sep={part.sep}>{part.t}</span
									>{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note rules">
			<strong>Loudness weighting</strong> follows BS.1770-4: front channels unity, surrounds +1.5 dB,
			LFE excluded. The standard tabulates weights only to 5.1, so the 7.1 rears take the same +1.5 dB
			as the sides, as broadcast meters do. Mono and stereo weights are all unity, which makes the
			weighted sum <strong>bit-identical</strong> to the unweighted code it replaced — the stereo corpus
			is untouched by construction, not by measurement.
		</p>

		<div class="cols-tight sub">
			<div>
				<h3>Dynamic range past stereo is a chosen rule</h3>
				<p class="measure">
					TT DR defines no procedure beyond two channels, so crête states its rule rather than
					implying one. <strong>DR (PMF) is the mean of the scored channels</strong> — whose
					two-channel case <em>is</em> the stereo rule — with the LFE excluded. A band-limited effects
					channel has a nearly flat crest factor and a mix-dependent level, so folding it in measures
					bass management rather than the music.
				</p>
				<p class="measure">
					Two companions ship alongside it, never in place of it: <strong>Front L/R DR</strong>, the
					figure directly comparable with the stereo release of the same master, and the
					<strong>lowest scored channel</strong>, which is what a mastering check wants flagged, since
					a mean cannot fall below its worst member.
				</p>
				<p class="measure">
					The LFE is measured in full — its own peak, RMS and DR are reported, bracketed in the
					detail output and marked unscored in JSON — and scored in nothing. Joint peak, overall RMS
					and the 3 s block gate likewise run over the scored channels only.
				</p>
			</div>
			<div>
				<h3>The other way is one flag away</h3>
				<p class="measure">
					foobar2000's DR Meter includes the LFE — measured 6–0 on discriminating tracks, with no
					counter-examples. <code>--dr-lfe include</code> matches it so the two can be compared directly
					instead of argued about.
				</p>
				<p class="measure">
					And the flag now has an oracle, not just an argument. Against foobar's own logs for the
					three 5.1 albums, <code>include</code> reproduces foobar's album DR <strong>exactly</strong>
					on all three, with per-channel DR agreeing to a mean of 0.036 dB over 264 values. The control
					is a 4.0 album: with no LFE the two rules are the same rule, and there the flag changes
					nothing byte for byte while every track's integer DR matches foobar's.
				</p>
				<table class="ab">
					<thead>
						<tr>
							<th>DSOTM 5.1 96 kHz</th><th>DR raw</th><th>scored</th><th>lowest</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>exclude</code> (default)</td><td class="num">11.9772</td>
							<td class="num">5</td><td class="num">Ls</td>
						</tr>
						<tr>
							<td><code>include</code></td><td class="num">11.8606</td>
							<td class="num">6</td><td class="num">LFE</td>
						</tr>
					</tbody>
				</table>
				<p class="note spaced">
					It affects TT DR only. Integrated loudness, Max M/S, LRA and Min PSR do not move at all —
					BS.1770-4 weights the LFE at zero, which is a standard rather than a preference. Mono and
					stereo have no LFE, so no stereo measurement can change.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">05 — The one deliberate divergence</p>
		<div class="cols-tight">
			<div>
				<h2>Min PSR: crête follows the paper, the reference follows a peak-hold</h2>
				<p class="measure">
					Min PSR is the worst-agreeing metric in the entire suite — average |Δ| 0.598 dB, max 2.89,
					roughly seven times the next-worst. It is also the one metric where that gap is fully
					explained and deliberately left alone.
				</p>
				<p class="measure">
					The commercial reference's figure was reverse-engineered as a
					<strong>0.5 dB/s decaying peak-hold</strong> against 3 s short-term loudness. crête implements
					the published AES eBrief 373 formula: the window's sample peak minus its BS.1770-4 short-term
					loudness, minimum over the track, with a −50 LUFS floor.
				</p>
				<p class="measure">
					Three stacked causes were disentangled before that conclusion: an export sentinel value in
					the old reference rows, a too-coarse sampling grid in crête, and finally the formula
					difference itself. A bit-exact decode-versus-formula experiment confirmed the residual is
					not a decode artefact. No compatibility mode was added — crête stays spec-true and the
					harness tolerance reflects the documented variance.
				</p>
			</div>
			<aside class="rule">
				<p class="rule-tag">Rule of the project</p>
				<p class="rule-text">
					A metric that agrees with the reference for the wrong reason is worse than one that
					disagrees for a stated reason.
				</p>
				<p class="note">
					The corollary has been measured twice. An arithmetic mean once matched the reference on a
					DSD track because its value happened to land 0.0095 dB above a rounding boundary — a coin
					standing on edge, not agreement. And an integer comparison once reported a regression on an
					album whose continuous accuracy had improved 8.6 %.
				</p>
			</aside>
		</div>
	</section>

	<section class="section">
		<p class="kicker">06 — Determinism</p>
		<h2 class="h-det">Reproducibility is a specification too</h2>
		<div class="rows">
			<div>
				<h3>Floating-point contraction is pinned off</h3>
				<p>
					The compiler's default fuses multiply-add on architectures that have an FMA instruction and
					not on those that do not, which diverged the ARM binary from the x86 one inside the
					K-weighting biquads. <code>-ffp-contract=off</code> is pinned for both C and C++. It is a
					no-op on x86 and disciplines ARM to match — and it is <strong>gated weekly</strong> at exactly
					zero.
				</p>
			</div>
			<div>
				<h3>Parallelism never changes a number</h3>
				<p>
					An album's files are analysed across a thread pool, order-preserving, with errors and
					warnings replayed after the join. Verified bit-identical to a sequential run on FLAC, DSD
					and cue albums. <code>-j</code> only changes wall-clock time.
				</p>
			</div>
			<div>
				<h3>Bit-identity is proven, not asserted</h3>
				<p>
					When the multichannel work touched shared loops, the guard was placed so that mono and
					stereo reduce to their old form exactly — multiplication by 1.0 is exact in IEEE 754 and
					the accumulation order was preserved verbatim. Measured: 115 DSD files across four rates,
					zero value differences.
				</p>
			</div>
			<div>
				<h3>One platform caveat, stated</h3>
				<p>
					Linux and macOS differ by one ULP on <code>20·log10(x)</code>, identically on both
					architectures — libm rounding, not contraction. A macOS-produced JSON cannot be
					equality-compared against a Linux one.
				</p>
			</div>
		</div>
	</section>
</div>

<Footer {version}>
	{#snippet note()}
		Standard tags are printed in the detail output and carried in the JSON <code>standards</code> map.
	{/snippet}
</Footer>

<style>
	h2 {
		margin-bottom: 8px;
	}

	.h-ab,
	.h-det {
		margin-bottom: 20px;
	}

	.intro {
		max-width: 66ch;
		margin-bottom: 28px;
	}

	.rules {
		max-width: 76ch;
		margin-top: 20px;
	}

	.spaced {
		margin-top: 16px;
	}

	.aname {
		font-size: 15px;
		display: block;
		margin-bottom: 6px;
	}

	/* The procedure: numbered, ruled, and flush left like everything else. */
	.proc {
		margin: 20px 0;
		padding-left: 0;
		list-style: none;
		counter-reset: step;
	}

	.proc li {
		counter-increment: step;
		border-top: 1px solid var(--color-divider);
		padding: 12px 0 12px 44px;
		position: relative;
		font-size: 15px;
	}

	.proc li:first-child {
		border-top-width: 2px;
	}

	.proc li:last-child {
		border-bottom: 2px solid var(--color-divider);
	}

	.proc li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		top: 12px;
		font-family: var(--font-heading);
		font-weight: var(--font-heading-weight);
		font-size: 15px;
		color: var(--color-accent-700);
	}

	.layout-table .num,
	.layout-table .order {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 13px;
	}

	/* The LFE is the channel that is measured and never scored — it reads as an
	   aside in the layout string, which is exactly its role in the metric. */
	.order .lfe {
		color: var(--color-neutral-700);
	}

	.order .sep {
		color: var(--color-neutral-500);
	}

	.sub {
		margin-top: 40px;
	}

	.sub h3 {
		font-size: 22px;
		margin: 0 0 16px;
	}

	/* The project's one stated rule, set as a quiet poster rather than a card —
	   no radius, no shadow, just the accent rule holding it. */
	.rule {
		border-left: 2px solid var(--color-accent);
		padding-left: 24px;
	}

	.rule-tag {
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent-700);
		margin: 0 0 12px;
	}

	.rule-text {
		font-family: var(--font-heading);
		font-weight: var(--font-heading-weight);
		font-size: 24px;
		line-height: 1.2;
		margin: 0 0 16px;
		max-width: 26ch;
	}
</style>

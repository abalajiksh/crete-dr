<script>
	import Footer from '$lib/Footer.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import {
		native,
		integrityChecks,
		ffmpeg,
		dsdAxes,
		sacdArea,
		buildCmds,
		platforms
	} from '$lib/formatsData.js';
</script>

<svelte:head>
	<title>Formats — crête</title>
	<meta
		name="description"
		content="crête's own decoders first, the opt-in FFmpeg tier second, and the routing rules that keep it out of the validated paths — plus disc audio, SACD images and DST, DVD title sets, DSD decimation, MQA detection and the platform matrix."
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
					slicing adds one slice plus roughly twice its size as working set. Since 0.19.0 crête
					plans for this itself: the default worker count is fitted to free memory, and each unit is
					costed by its shape — a cue sheet as its whole monolith, a DVD title set as all its
					fragments. The SACD reader is the one exception to holding a whole file: a disc image is
					far too large to hold, so it seeks, and an area is costed as its largest track.
					<code>--memory-limit</code> overrides the budget and <code>-j</code> still pins the
					count.
				</p>
			</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">02 — Damaged files</p>
		<h2>What each container lets crête prove about itself</h2>
		<p class="intro">
			A meter's worst failure is not refusing a file — it is measuring a broken one and reporting a
			number as though nothing happened. Before 0.17.0 crête did exactly that. It now verifies what
			each format allows, and says so.
		</p>
		<div class="scroll-x">
			<table class="table fmt">
				<thead>
					<tr>
						<th style="width:22%">Check</th><th style="width:28%">Formats</th><th>What it catches</th>
					</tr>
				</thead>
				<tbody>
					{#each integrityChecks as c (c.check)}
						<tr>
							<td><strong>{c.check}</strong></td>
							<td><Inline text={c.formats} /></td>
							<td><Inline text={c.catches} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="cols-tight sub">
			<div>
				<h3>A damaged file is still measured</h3>
				<p class="measure">
					crête is a meter, not a repair tool: it reports what the bytes decode to and marks every
					affected number untrustworthy. That separation is what keeps the intact-file path
					bit-identical to the one that existed before these checks — verified across
					<strong>62 files</strong> spanning FLAC, WAV (integer and float), AIFF, RF64, Wave64, ALAC,
					TrueHD, AC-3 and DTS-HD MA in mono, stereo, quad, 5.1 and 7.1.
				</p>
			</div>
			<div>
				<h3>Always present, so it can be tested</h3>
				<p class="measure">
					Every warning also appears in <code>-f json</code> under <code>warnings</code>, which is
					always emitted — an empty array is the positive statement "nothing was wrong", rather than
					the absence of evidence a missing key would be. <code>num_tracks</code> counts what was
					<em>measured</em>, so a file that failed to decode contributes a warning and no track. The
					run exits <strong>2</strong>.
				</p>
			</div>
			<div>
				<h3>The limit, stated plainly</h3>
				<p class="measure">
					<strong>WAV and AIFF carry no checksum.</strong> Altered sample values in them are
					undetectable — by crête or by any other meter — because a run of zeros inside a
					<code>data</code> chunk is indistinguishable from a passage of digital silence the artist
					put there. Only length and range can be checked; FLAC is the one that can prove itself. The
					test suite asserts that a WAV with 4 KB of zeros written into its audio comes back
					<em>clean</em>, so the blind spot stays visible in a green run.
				</p>
			</div>
		</div>

		<pre class="term">{`Warning: 04 - damaged.flac: FLAC: CORRUPT -- 1 of 215 frames failed the CRC-16 check (0.5%).
Warning: 04 - damaged.flac: FLAC: TRUNCATED -- STREAMINFO declares 882000 samples per channel but 877904 decoded (4096 missing, 0.5%).
Warning: 04 - damaged.flac: CORRUPT -- sample peak 45.32 dBFS on 16-bit integer PCM, which cannot exceed 0 dBFS.
Error:   05 - unreadable.flac: FLAC: invalid magic`}</pre>
	</section>

	<section class="section">
		<p class="kicker">03 — The FFmpeg tier</p>
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
		<p class="kicker">04 — Disc audio</p>
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
			<h3>Object audio is measured as its bed, and now says so</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						There is no Atmos or DTS:X renderer in the chain. What gets decoded is the underlying
						channel bed — TrueHD 7.1, or E-AC-3 5.1 for Dolby Digital Plus with Atmos — and the
						object metadata is discarded. crête's numbers for such a file are the bed's numbers,
						which is exactly what a non-Atmos playback chain delivers, and <em>not</em> what a
						renderer would produce.
					</p>
					<p class="measure">
						That is a complete measurement of something real, but an unqualified "crête measures
						Atmos" would be false — so the profile is reported separately from the layout, and JSON
						carries <code>codec_profile</code> and an <code>immersive_bed</code> boolean. It is
						<strong>identification, not decode</strong>, following the precedent MQA detection already
						set: name the premium layer from an authoritative bitstream field, never imply it was
						rendered. The field is descriptive — no measured value depends on it.
					</p>
					<p class="measure">
						A non-immersive profile such as DTS-HD MA is reported too, without the bed qualifier:
						there is nothing unrendered about it. And the profile comes only from the FFmpeg tier,
						since the zero-dependency binary cannot decode these codecs at all.
					</p>
				</div>
				<div>
					<pre class="term">{`Format:   TRUEHD 24-bit / 48000 Hz
Profile:  Dolby TrueHD + Dolby Atmos
Layout:   7.1 · L R C LFE Lss Rss Lrs Rrs
          [bed -- Atmos objects not rendered]`}</pre>
					<h4 class="val-head">Auro-3D is not detectable this way</h4>
					<p class="note">
						FFmpeg reports an Auro carrier as plain DTS-HD MA, so no profile field can see it. On the
						one disc measured here the "Auro-3D 9.1" label was a container title tag, with the height
						channels buried in the carrier's low bits — a real signature, since on a solo-piano
						recording whose LFE is otherwise digitally silent that carrier held 803,853 non-zero
						samples within ±24 against the DTS:X carrier's exact zero. But reading it is inference
						rather than a declared field, so if it is ever built it belongs in a confidence-scored
						forensics namespace, gated off, never in the metrics.
					</p>
				</div>
			</div>
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
		<p class="kicker">05 — DSD</p>
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
		<p class="kicker">06 — SACD disc images</p>
		<h2>The disc is the input. Both areas of it.</h2>
		<p class="intro">
			SACD rips circulate overwhelmingly as <code>.iso</code>, so for a meter with this much DSD
			machinery that was the gap a real collection hits first — until crête read them, a disc had to
			be extracted to <code>.dsf</code> or <code>.dff</code> before it could be measured at all.
		</p>

		<div class="cols-tight">
			<div>
				<p class="measure">
					crête reads the master TOC, both area TOCs, the track list and the audio-sector packet
					stream, and hands per-channel DSD to the <strong>same decimation chain</strong> every
					<code>.dsf</code> and <code>.dff</code> goes through. So the three DSD axes above apply
					unchanged, and crête on an ISO must agree with crête on an extracted rip of the same disc —
					a crête-versus-crête gate that needs no external oracle.
				</p>
				<p class="measure">
					A disc image is a third shape alongside "one file" and "cue-sliced": the track list comes
					from the disc, and each track is decoded from its own sector range rather than sliced out of
					one decode. It is also the one decoder that <em>seeks</em> rather than loading the whole
					file — the test image is 3.88 GiB, and its stereo area alone decodes to 1.8 GB of float64
					at the default output rate, or 14.6 GB at 352.8 kHz.
				</p>
				<h3 class="axis-head"><code>{sacdArea.flag}</code></h3>
				<p class="measure"><Inline text={sacdArea.text} /></p>
			</div>
			<div>
				<pre class="term">{`crete album.iso                          # auto: the 2-channel area
crete --sacd-area multichannel album.iso # the 5.1 area
crete --sacd-area stereo       album.iso`}</pre>
				<p class="note spaced">
					Dispatch is by <strong>content, not extension</strong>. <code>.iso</code> names every disc
					image ever made, so crête checks for the SACD master TOC signature at a fixed sector and
					quietly ignores anything else rather than trying to meter a data DVD.
				</p>
				<h4 class="val-head">Validation</h4>
				<p class="note">
					On the 2018 Dark Side of the Moon SACD all ten stereo-area track durations match the
					published running order — 42:57 against the area's own declared 42:59 — and one track
					returns peak <strong>−5.489</strong> / RMS <strong>−19.753</strong> against the −5.49 /
					−19.75 already recorded for that album from a <code>.dsf</code> rip. Every non-ISO path was
					compared byte-for-byte across the change: FLAC, AC-3, TrueHD, WAV and DFF all identical.
				</p>
				<p class="note spaced">
					<strong>Gated since 0.17.0</strong>, and not before — the reader and the DST decoder were
					validated by hand once and then left, which is uncomfortable for code whose failure mode is
					silence. The suite measures a <em>reduced</em> image: the first tracks of each area, the
					multichannel one relocated so the file need not span the 1.85 GB gap before it,
					<strong>229 MB</strong> instead of ~4 GB. Every audio sector in it is the disc's own bytes;
					only the TOC fields describing extent are rewritten, and the builder measures every kept
					track in both the reduced and the full image and requires identical results, so its own
					address arithmetic cannot certify its own mistake. 6 passed / 2 skipped on its first weekly.
					The 2 skips are the <code>.dsf</code> parity tier, which is written but needs the DSD64
					corpus staged alongside and so is not running in CI yet.
				</p>
			</div>
		</div>

		<article class="case">
			<h3>DST, and the only check that caught a wrong decoder</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						DST is SACD's lossless compression, and multichannel areas commonly use it — on that
						disc the stereo area is plain DSD at 1.72 GiB while the 5.1 area is DST at 2.16 GiB
						against the 5.16 GiB it would need uncompressed. crête carries its own decoder, written
						from the published coding syntax and zero-dependency like everything else, so both areas
						of a hybrid disc go through the same chain and nothing downstream can tell which the
						disc used. DST is lossless; this is not an approximation.
					</p>
					<p class="measure">
						<strong>Every frame must consume exactly its own coded length</strong>, and the decoder
						asserts it. Arithmetic coding is exact: a decoder consumes the encoder's bits if and only
						if it applies the encoder's probabilities. That assertion exists because the first
						version of this decoder was wrong in a way nothing else could see.
					</p>
					<p class="measure">
						It read a comparison from a syntax figure that the clause prose contradicts. Every frame
						decoded without throwing. Every header parsed to stable, sane values. Mispredictions came
						out at a healthy-looking 0.75 %. The output was 1-bit data at the right density that
						decimated to audible sound. It was the prediction filter free-running on its own output,
						consuming 15 % of each frame.
					</p>
				</div>
				<div>
					<table class="ab">
						<thead>
							<tr><th>The signal that was available</th><th>broken</th><th>correct</th></tr>
						</thead>
						<tbody>
							<tr><td>Frames decoded without error</td><td class="num">all</td><td class="num">all</td></tr>
							<tr><td>Misprediction rate</td><td class="num">0.75 %</td><td class="num">0.75 %</td></tr>
							<tr><td>Per-bin probability check</td><td class="num">passes</td><td class="num">passes</td></tr>
							<tr><td><strong>Frame bits consumed</strong></td><td class="num">15 %</td><td class="num after">100.0 %</td></tr>
							<tr><td>2–15 kHz band</td><td class="num">+19 dB</td><td class="num after">−57 dB</td></tr>
							<tr><td>Sample peak</td><td class="num">+2.06</td><td class="num after">−13.87 dBFS</td></tr>
						</tbody>
					</table>
					<p class="note spaced">
						The two checks reached for first are structurally incapable of catching this. The
						misprediction rate is low <em>because</em> the decoder consumes few bits, and per-bin
						probability consistency is vacuous — an arithmetic decoder fed any probability sequence
						produces events matching that sequence. It proves the coder, not the probabilities.
					</p>
				</div>
			</div>
			<p class="note rules">
				It is not fast: roughly <strong>2× realtime for six channels</strong>, so a 43-minute 5.1 disc
				takes about 20 minutes. All channels share one arithmetic decoder, so there is no parallelism
				inside a frame — but the filter history is reinitialised per frame, so frames are independent
				and could be decoded in parallel. Not done yet.
			</p>
		</article>

		<article class="case">
			<h3>To validate a DSD de-interleave, look at the noise floor</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						Frames are byte-interleaved across channels. The other reading — contiguous per-channel
						blocks — was implemented first and "confirmed" with the obvious test, the left/right
						split. That test is worthless here: <strong>both readings give a plausible DR and a
						plausible L/R difference</strong>, because a wrong de-interleave of a 1-bit stream still
						decimates to something music-shaped.
					</p>
					<p class="measure">
						What settles it is the property DSD exists for. Byte-interleaved gives the textbook
						picture — music at low frequency, a quiet 2–20 kHz band, shaped noise climbing above
						40 kHz. Blocks give a floor rising at every frequency with no quiet band anywhere. The
						two are 34 dB apart where it matters.
					</p>
					<p class="measure">
						Two more traps in the same reader produced equally plausible wrong answers. The
						frame-format value for compressed is <em>zero</em> and the uncompressed forms are 2 and
						3, so reading it backwards labels a DST area uncompressed — and DST bytes fed to the DSD
						path decode to something that still looks like a measurement. And a DST sector's frame
						header carries one byte more than a DSD sector's, which taken unconditionally overruns
						the first packet and drops that sector's audio entirely: <strong>14 % of every track
						lost with no error</strong>, 58.65 seconds of a 68.45-second one. Both are now
						cross-checked, and the header length is read from the sector rather than assumed from
						the area.
					</p>
				</div>
				<div>
					<p class="term-head">Mean level by band, decimated to 352.8 kHz</p>
					<div class="scroll-x">
						<table class="ab bands">
							<thead>
								<tr>
									<th></th><th>0–2k</th><th>2–15k</th><th>15–20k</th><th>24–40k</th><th>40–100k</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>byte-interleaved</td><td class="num">25.8</td><td class="num after">−20.2</td>
									<td class="num">−20.4</td><td class="num">−17.6</td><td class="num">15.4</td>
								</tr>
								<tr>
									<td>per-channel blocks</td><td class="num">27.5</td><td class="num after">13.7</td>
									<td class="num">17.7</td><td class="num">23.2</td><td class="num">30.4</td>
								</tr>
							</tbody>
						</table>
					</div>
					<h4 class="val-head">Provenance</h4>
					<p class="note">
						Both readers are written from the format descriptions — structure layouts and coding
						syntax are facts about a format, used as documentation. No implementation was consulted:
						the reference extractor is GPL-2.0, which is strictly worse for an MIT project than the
						LGPL conflict the DSD engine swap existed to remove, and its DST decoder is a console
						SPU offload with no software path in it at all. The other software DST decoder available
						is LGPL. crête stays MIT plus BSD-2-Clause.
					</p>
				</div>
			</div>
		</article>
	</section>

	<section class="section">
		<p class="kicker">07 — DVD title sets</p>
		<h2>One title, several files, one stream</h2>
		<p class="intro">
			A DVD is the first container crête reads that is not one file holding one stream. The spec caps
			a file at 1 GB, so a title's program stream is split at a pack boundary and numbered — and
			metering the pieces separately is wrong twice over: each is metered alone, and the split lands
			wherever 1 GB fell, so the 3 s DR block straddling it belongs to neither piece.
		</p>

		<div class="cols-tight">
			<div>
				<p class="measure">
					<strong>Point crête at any one fragment and it measures the whole title set.</strong> The
					pieces are presented to FFmpeg as a single stream through one demuxer, so the boundary costs
					nothing. On the test corpus the joined MLP duration is 49.632 s against 25.324 + 24.289 s
					read separately — 19 ms <em>longer</em>, that being the frame the split cut in half. DVD
					LPCM joins exactly, 23.498 + 23.721 = 47.219 s either way, because its packets are
					self-contained within a pack.
				</p>
				<p class="measure">
					It also removes a trap. The FFmpeg stream <strong>index is not stable across fragments
					of one title</strong>: on the DSOTM 50th DVD the same three substreams come back in a
					different order in the second fragment than in the first, because the index follows order
					of first appearance in the program stream. A <code>--stream</code> pin correct for one
					fragment selects a different <em>codec</em> in the next. One stream means one probe and
					one answer, which is what makes <code>--stream</code> meaningful here at all.
				</p>
			</div>
			<div>
				<pre class="term">{`VIDEO_TS/VTS_02_1.VOB  _2.VOB  _3.VOB   one 43-minute title
AUDIO_TS/ATS_01_1.AOB  ...     _5.AOB   one DVD-Audio title set

         VTS_02_1.VOB      VTS_02_2.VOB
index 2  ac3               lpcm
index 3  ac3               ac3
index 4  lpcm              ac3`}</pre>
				<h4 class="val-head">Validation</h4>
				<p class="note">
					Both test discs carry a lossless stream — MLP on the DVD-Audio, DVD LPCM on the DVD-Video —
					and the corpus ships each decoded to FLAC, so crête through the disc container must equal
					crête on the FLAC <strong>exactly</strong>: two independent decode paths over the same
					samples, nothing to calibrate. The suite is <strong>10/10</strong> on its first weekly,
					#85, and fails all ten against the build before it. The whole JSON tracks array is
					byte-identical to 0.17.0 on all seven disc-audio carriers, so reading DVDs moved
					nothing that was already measured.
				</p>
			</div>
		</div>

		<article class="case">
			<h3>A DVD-Audio title set holds more than one mix</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						Fleetwood Mac's <em>Rumours</em> (2001, Warner) is one title set holding four titles — a
						96 kHz 5.1 mix, a 96 kHz stereo mix, a 48 kHz 5.1 version and a one-second tail — 39
						tracks across five <code>.aob</code> fragments, and <strong>the group boundaries do not
						align with the fragments</strong>. The 6-to-2-channel change falls partway through
						<code>ATS_01_3.AOB</code>, so even a single <code>.aob</code> can cross one.
					</p>
					<p class="measure">
						Left to itself FFmpeg decodes straight through the change into a resampler configured for
						the previous format, and reports nothing but a parity-check failure and a timestamp
						discontinuity on stderr. The numbers stay in range and nothing says they are meaningless.
						crête stops at the change, measures the <strong>first group</strong>, names it, and exits
						2 — a warning over the wrong numbers would be the silent wrong answer in camouflage.
					</p>
					<p class="measure">
						The probe had the same blind spot one level up: it can read deep enough to reach a later
						group and report 2 channels for a stream whose first frame is 6. So the channel layout and
						rate now come from the <strong>first decoded frame</strong>, not the container — the
						decision already taken for the sample format, extended to the two fields the probe can
						get wrong the same way.
					</p>
				</div>
				<div>
					<pre class="term">{`Warning: audio format changes partway through
this stream (a DVD-Audio title set holds several
audio groups); measured the first group only,
6 ch / 96000 Hz`}</pre>
					<h4 class="val-head">Reading the disc's own tables</h4>
					<p class="note">
						<code>make dvda-info</code> builds a zero-dependency tool that parses a title set's
						formats, titles and track lengths without decoding anything — one second on a 4.5 GB
						title set. On <em>Rumours</em> the track lengths sum to each title's own stated total
						<strong>exactly</strong>, on all four titles, in fields held in separate structures; a
						wrong offset or byte order cannot produce four exact matches. The three format entries
						agree, in order, with the three groups decoding had already found.
					</p>
					<p class="note spaced">
						<strong>crête does not yet use it to measure per track or per title.</strong> Durations
						do not give byte offsets — MLP is variable-rate — and the table that would is still a
						hypothesis. A wrong offset into a lossless stream yields audio that plays and a DR that
						looks reasonable, so it waits for the same arithmetic proof the track table met.
					</p>
				</div>
			</div>
		</article>

		<p class="note rules">
			<strong>One caveat on <code>--stream</code> for <code>.vob</code>:</strong> the compact FFmpeg
			lists one more audio stream than the disc carries. It cannot identify the MPEG-2 video,
			content-probes it and matches it as MP3, so three audio streams list as four and the extra
			decodes to 0.34 s at 16 kHz with a +23 dBFS peak. A full FFmpeg types it correctly. It cannot be
			filtered on crête's side, because MPEG audio is a legal DVD audio format. Automatic selection is
			unaffected — it ranks by bitrate and the phantom has none — and every genuine stream is reachable
			by index; only the listing is wrong.
		</p>
	</section>

	<section class="section">
		<p class="kicker">08 — MQA</p>
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
		<p class="kicker">09 — Build &amp; platforms</p>
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
				<p class="note spaced">
					<code>setup-deps</code> checks by <strong>capability, not package name</strong>, so a
					compiler you built yourself still counts; it prints every command before running it,
					supports <code>--check</code> and <code>--dry-run</code>, and never installs something
					already present. Homebrew, dnf, apt, pacman, zypper and MSYS2 are covered. It installs the
					<em>toolchain</em>; the three <code>setup-*</code> targets fetch the sources crête vendors.
					Two things it checks are easy to get wrong on your own: an x86 host with no assembler fails
					the FFmpeg build as a deep, confusing error rather than a missing dependency, and MinGW's
					<code>win32</code> threading model ships a standard library with no threads at all — so such
					a build links cleanly and then dies on the first album.
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

	/* The SACD area flag labels its own paragraph, exactly as the DSD axis
	   headings do inside `.rows` — so it takes their size, not this page's h3. */
	.axis-head {
		font-size: 14px;
		margin: 24px 0 4px;
	}

	/* Six bands in a half-width column: narrow the cells and let it scroll
	   rather than wrapping a numeric row. */
	.bands {
		min-width: 400px;
	}

	.bands th,
	.bands td {
		padding-right: 8px;
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

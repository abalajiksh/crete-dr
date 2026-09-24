<script>
	import Footer from '$lib/Footer.svelte';
	import Inline from '$lib/Inline.svelte';
	import { version } from '$lib/version.js';
	import { pipeline, oracles, suites, openItems } from '$lib/testingData.js';
</script>

<svelte:head>
	<title>Testing — crête</title>
	<meta
		name="description"
		content="Twelve thousand comparisons a week against an external reference: the pytest harness, the four tiers of oracle, what each suite gates, and every limitation still open."
	/>
</svelte:head>

<div class="wrap">
	<header class="page-head">
		<p class="kicker">Test pipeline</p>
		<h1>Twelve thousand comparisons, every week, against something that is not crête.</h1>
		<p class="lede">
			The harness is a separate pytest repository driven by Jenkins across two Linux agents of
			different architecture. Corpora live in object storage and are staged per suite. A run does not
			report pass or fail alone — it reports how many values were compared, how far each was from its
			reference, and whether any metric worsened against the stored baseline.
		</p>
	</header>

	<section class="stats band">
		<div class="stat">
			<div class="stat-num">210</div>
			<div class="stat-label">tests, weekly #85</div>
		</div>
		<div class="stat">
			<div class="stat-num">194</div>
			<div class="stat-label">passed · 0 failed · 16 skipped</div>
		</div>
		<div class="stat">
			<div class="stat-num">11,931</div>
			<div class="stat-label">metric comparisons, 51 albums</div>
		</div>
		<div class="stat">
			<div class="stat-num">44</div>
			<div class="stat-label">flagged (0.37 %), none catastrophic</div>
		</div>
		<div class="stat">
			<div class="stat-num accent">0</div>
			<div class="stat-label">catastrophic breaches, ever</div>
		</div>
	</section>

	<section class="section">
		<p class="kicker">01 — The pipeline</p>
		<h2 class="h-step">Corpus to verdict</h2>
		<div class="steps">
			{#each pipeline as s (s.n)}
				<div>
					<div class="step-num">{s.n}</div>
					<p><Inline text={s.text} /></p>
				</div>
			{/each}
		</div>
		<p class="note rules">
			Two report-reading rules were bought with real incidents and are now enforced in code.
			<strong>Read the comparison count before the deltas</strong> — one suite once passed while
			gating a single track out of twelve, because a filename-extension strip cut classical movement
			titles at the wrong dot. And
			<strong>read the average delta column, not the flag column</strong> — a metric with a wide tolerance
			can be the worst in the run while flagging almost nothing.
		</p>
	</section>

	<section class="section">
		<p class="kicker">02 — Oracles</p>
		<h2>Four kinds of truth, ranked</h2>
		<p class="intro">
			No single reference is trusted. Each tier answers a question the others cannot, and the
			interesting findings have all come from disagreements <em>between</em> tiers.
		</p>
		<div class="rows">
			{#each oracles as o (o.name)}
				<div class="oracle">
					<div>
						<div class="rank">{o.rank}</div>
						<strong class="oname">{o.name}</strong>
					</div>
					<p><Inline text={o.text} /></p>
				</div>
			{/each}
		</div>
	</section>

	<section class="section">
		<p class="kicker">03 — Suites</p>
		<h2 class="h-step">What each suite gates</h2>
		<div class="scroll-x">
			<table class="table suites">
				<thead>
					<tr><th>Suite</th><th>Gates</th><th>Oracle</th><th>Corpus</th><th>Latest</th></tr>
				</thead>
				<tbody>
					{#each suites as s (s.name)}
						<tr>
							<td><strong class="sname">{s.name}</strong></td>
							<td><Inline text={s.gates} /></td>
							<td><Inline text={s.oracle} /></td>
							<td><Inline text={s.corpus} /></td>
							<td>
								{#if s.latest === 'green'}
									<span class="tag tag-accent">green</span>
								{:else}
									<Inline text={s.latest} />
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="note rules">
			Ordering matters and is enforced: <code>DSD_ROUNDTRIP</code> shares DSD64's corpus so it must
			run after it, and the <code>dsd2wav</code> build must come last in the manual build stage because
			branches above it may clean the tree.
		</p>
		<p class="note narrow">
			<strong>Weekly #77 is the first run on 0.17.0 and the first to carry INTEGRITY and SACD.</strong>
			The result worth recording is not that it passed. It is that all fifteen of the per-suite detailed
			reports are <em>identical</em> to the ones the last archived weekly produced — same 11,931
			comparisons, same 44 flags, same per-metric maxima and averages, same two album mismatches — with a
			single added header line as the only textual difference anywhere. #73 recorded <strong>0.13.1</strong>
			and #77 records <strong>0.17.0</strong>, so that identity spans five releases: the RF64 and Wave64
			containers, the joint true-peak LFE guard, the DST decoder, the shared input collector with its
			natural-order fix, and the integrity checks. Each was argued to be a no-op on this corpus when it
			shipped. This is the corpus agreeing, on every number it holds.
		</p>
		<p class="note narrow">
			<strong>Weekly #85 is the first run on 0.18.0 and the first to carry DVD.</strong> The same
			fifteen reports are identical to #77's below the header — the same 11,931 comparisons, 44 flags
			and two album mismatches — so the identity now spans the DVD title-set reader and the change that
			makes every FFmpeg decode take its channel layout and rate from the first frame. The new suite
			went 10/10. Two runs sit between them and neither is counted: #81, the first on the new
			x86-64 default agent and the first on a cold cache in a long time, and #82 both went unstable on
			the same three tests. Staging, not measurement — crête was pointed at a directory holding only
			another directory, does not recurse, and said so. The check meant to catch it counted files
			recursively, and a recursive count cannot see a level of nesting.
		</p>
	</section>

	<section class="section">
		<p class="kicker">04 — Case study</p>
		<h2>The block set: how a 33 % accuracy gain was decided</h2>
		<p class="intro wide">
			Up to 0.13.1 crête's 3-second block set differed from the PMF reference implementation in two
			places: it discarded the trailing partial block, and it gated blocks at a joint-RMS threshold.
			The reference keeps the tail, normalised by its own length, and has no gate. Both deviations
			shrink the block count, and since the top-20 % count is a floor division, a smaller count keeps
			fewer and therefore <em>louder</em> top blocks — raising the reference RMS and lowering DR. A structural
			low bias, worst on short tracks and sparse channels.
		</p>
		<p class="intro wide">
			It was not shipped on the strength of that argument. Two full weekly runs, same binary, same
			corpus, back to back — #68 under the legacy block set, #69 under the reference one.
		</p>
		<div class="cols-tight">
			<div>
				<table class="ab">
					<thead>
						<tr><th>Block set</th><th>vs foobar</th><th>vs MAAT</th></tr>
					</thead>
					<tbody>
						<tr>
							<td>legacy (≤ 0.13.1)</td>
							<td class="num">mean |Δ| 0.0598, bias −0.011</td>
							<td class="num">0.0628, bias −0.014</td>
						</tr>
						<tr>
							<td>reference (default)</td>
							<td class="num after">0.0355, bias −0.004</td>
							<td class="num after">0.0339, bias −0.001</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div>
				<table class="ab">
					<thead>
						<tr><th>Weekly #68 → #69</th><th>Result</th></tr>
					</thead>
					<tbody>
						<tr>
							<td>Weighted mean |Δ|, 2241 DR comparisons</td>
							<td class="num">0.0392 → <span class="after">0.0262 (−33 %)</span></td>
						</tr>
						<tr><td>DR flags</td><td class="num">29 → 19</td></tr>
						<tr><td>Integer DR (PMF) flags</td><td class="num">10 → 5</td></tr>
						<tr><td>DR rows that regressed</td><td>not one</td></tr>
						<tr><td>crête-vs-crête control suites</td><td class="num">0.000, unmoved</td></tr>
						<tr><td>Non-DR values that moved</td><td>none, anywhere</td></tr>
					</tbody>
				</table>
			</div>
		</div>
		<p class="note rules">
			The control suites staying at exactly zero is what confirms the change is confined to block
			accounting rather than leaking into decode. And the reference block set reproduces a literal
			transcription of the reference implementation to 3.9e-05.
		</p>
		<p class="note narrow">
			It also retired an earlier conclusion. Weekly #55 had recorded the surround residual as a
			<em>short-track effect</em> — the two shortest tracks in a 45-track corpus owned nine of the top
			twenty deltas. Under the reference block set the correlation between inverse duration and error
			falls from +0.465 to −0.044. It was never about track length; it was about what fraction of a
			track's blocks the old accounting threw away.
		</p>
		<p class="note narrow">
			<code>--dr-blocks legacy</code> reproduces ≤ 0.13.1 bit-for-bit, for A/B work and for re-reading
			reference rows recorded under it.
		</p>
	</section>

	<section class="section">
		<p class="kicker">05 — Forensics</p>
		<h2>Six more defects, and what caught each one</h2>
		<p class="intro">
			Each of these passed every gate at the time it was found. Most were caught by reading the
			deltas underneath a green run — and one was caught by a synthetic, because the corpus does not
			contain the case at all.
		</p>

		<article class="case">
			<p class="case-tag">FIX 12 · 0.11.3</p>
			<h3>Per-channel DR shared one joint RMS</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						Left and right could differ only through the peak term, because both subtracted the same
						across-channel RMS. The error cancelled in the mean — which is exactly why it survived
						years of validation — but split wrongly per channel by up to 2.37 dB, often with the
						left-minus-right spread <em>opposite in sign</em> to the reference. Worse, crête emitted
						identical left and right values bit-for-bit whenever both channels happened to share a
						second-highest block peak. A per-channel metric cannot do that; a shared RMS term can.
					</p>
					<p class="measure">
						Each channel now uses its own top-20 % RMS. The accumulation order of the old joint
						value was preserved verbatim so the gate stayed bit-identical.
					</p>
				</div>
				<table class="ab">
					<thead>
						<tr><th>Weekly #53 → #54</th><th>Before</th><th>After</th></tr>
					</thead>
					<tbody>
						<tr><td>DR LEFT flags</td><td class="num">83</td><td class="num after">8</td></tr>
						<tr><td>DR RIGHT flags</td><td class="num">77</td><td class="num after">5</td></tr>
						<tr>
							<td>L−R spread error, median</td>
							<td class="num">up to 3.4 dB, sign inverted</td>
							<td class="num after">0.000 dB</td>
						</tr>
						<tr><td>Max Δ, dsd512</td><td class="num">2.09</td><td class="num after">0.15</td></tr>
						<tr><td>Album mismatches</td><td class="num">3</td><td class="num after">2</td></tr>
					</tbody>
				</table>
			</div>
			<p class="note rules">
				Where crête still reported left equal to right, so did MAAT — those tracks are genuinely
				dual-mono.
			</p>
		</article>

		<article class="case">
			<p class="case-tag">0.13.0</p>
			<h3>The top-20 % RMS averaged amplitude, not power</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						The PMF procedure averages <em>power</em> — a quadratic mean. crête averaged amplitudes.
						Since the arithmetic mean never exceeds the quadratic mean, the reference RMS was always
						biased low and DR was therefore always biased <em>high</em>, by an amount that grows with
						block-to-block RMS variance: about 0.03 dB on dense stereo, up to 1.47 dB on sparse channels.
					</p>
					<p class="measure">
						That variance dependency is why it hid for the project's entire life. On left and right
						it sat an order of magnitude below every tolerance in the harness. A 5.1 corpus exposed
						it, because centre, surround and LFE channels are sparse and high-variance — but it was
						never a surround bug. It was a core defect that surround made visible.
					</p>
					<p class="measure">
						Found by cross-checking a 5.1 corpus against two references at once, which is the only
						reason it could be attributed: the two oracles agreed with each other to 0.006 dB while
						crête sat 0.095 from both.
					</p>
				</div>
				<div>
					<table class="ab">
						<thead>
							<tr><th>264 per-channel values</th><th>mean |Δ|</th><th>bias</th></tr>
						</thead>
						<tbody>
							<tr>
								<td>arithmetic (shipped ≤ 0.12.1)</td>
								<td class="num">0.095</td>
								<td class="num">+0.056</td>
							</tr>
							<tr>
								<td>quadratic (PMF)</td>
								<td class="num after">0.061</td>
								<td class="num after">−0.011</td>
							</tr>
						</tbody>
					</table>
					<table class="ab spaced">
						<thead>
							<tr><th>Weekly #56, mean |Δ| vs MAAT</th><th>#55</th><th>#56</th><th>Change</th></tr>
						</thead>
						<tbody>
							<tr>
								<td>DR (PMF)</td><td class="num">0.0265</td><td class="num">0.0244</td>
								<td class="num after">−8 %</td>
							</tr>
							<tr>
								<td>DR LEFT</td><td class="num">0.0588</td><td class="num">0.0427</td>
								<td class="num after">−27.5 %</td>
							</tr>
							<tr>
								<td>DR RIGHT</td><td class="num">0.0588</td><td class="num">0.0420</td>
								<td class="num after">−28.5 %</td>
							</tr>
							<tr>
								<td>DR (ch)</td><td class="num">0.0951</td><td class="num">0.0584</td>
								<td class="num after">−38.5 %</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<p class="note rules">
				Net signed bias over integer DR mismatches went +9 → <strong>0</strong>. The "always reads
				high" signature, open since an earlier fix, is gone. Zero non-DR metrics moved anywhere in
				the run.
			</p>
		</article>

		<article class="case">
			<p class="case-tag">0.15.0</p>
			<h3>The corpus could not have found this one</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						The joint <em>sample</em> peak has skipped unscored channels since 0.12.0. The loop
						behind the joint <em>true</em> peak had no such guard, so the two were computed over
						different channel sets on every multichannel file, and <code>--dr-lfe</code> reached one
						of them and not the other. PLR, which divides one by the other, mixed an LFE-inclusive
						numerator with an LFE-excluded denominator.
					</p>
					<p class="measure">
						True peak is ≥ sample peak by definition and the excess is inter-sample overshoot — a few
						tenths of a dB. A 17 dB gap is not a reading anyone can interpret, and that is what a
						synthetic 5.1 produced the moment one was built for it.
					</p>
					<p class="measure">
						<strong>No corpus file could have shown it.</strong> The LFE has to be the loudest
						channel, and in real material it never is: on the 5.1 master used to check the fix, the
						LFE sits at −11.14 against front left at −1.67. Both invariants were then measured
						whole-JSON on all six carriers of that disc — <code>--dr-lfe include</code> reproduces
						0.14.0 exactly, 6/6, because the old behaviour <em>was</em> unconditional inclusion; and
						at the default setting nothing moved either, 6/6. That is not "the bug did not matter".
						It means the corpus never contained the case.
					</p>
				</div>
				<div>
					<table class="ab">
						<thead>
							<tr>
								<th>Synthetic 5.1 · all channels −20 dBFS, LFE −3</th><th>0.14.0</th><th>0.15.0</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Joint sample peak</td><td class="num">−20.000</td><td class="num">−20.000</td>
							</tr>
							<tr>
								<td>Joint true peak</td><td class="num">−2.986</td><td class="num after">−19.992</td>
							</tr>
							<tr>
								<td>Implied overshoot</td><td class="num">17.014 dB</td>
								<td class="num after">0.008 dB</td>
							</tr>
						</tbody>
					</table>
					<p class="note spaced">
						No reference row moves with it either, and the reason is structural rather than lucky:
						MAAT reads at most two channels, so every referenced true-peak row in the corpus is
						stereo, mono or per-channel — all cases where the guard is a no-op or does not apply.
					</p>
				</div>
			</div>
			<p class="note rules">
				The lesson the harness took is the one its Tier 3 oracle exists for. A corpus of real albums
				proves what happens on real albums; it cannot prove what happens on the input nobody has.
			</p>
			<p class="note rules">
				From 0.15.0 to 0.18.1 the fix itself had no regression coverage — the measurement above was
				taken once, by hand. Since 0.19.0 <code>check_lfe_peak.sh</code> gates it on every build, and
				it was checked against a 0.14.0 build before it was trusted: the default setting fails there
				with a <strong>17.01 dB</strong> gap, exactly the figure recorded when the fix landed, while
				<code>--dr-lfe include</code> passes — because include <em>is</em> the old unconditional
				behaviour, which re-confirms that every pre-0.15.0 number is still reachable through it.
			</p>
		</article>

		<article class="case">
			<p class="case-tag">0.17.0</p>
			<h3>A broken file was scored as if nothing had happened</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						The worst thing a meter can do is not refuse a file. It is to measure a broken one and
						print a number. crête did exactly that: a FLAC with one bad sector was scored, averaged
						into the album DR and returned <strong>exit 0</strong> with no error field anywhere in
						the JSON — while the reference <code>flac</code> decoder refused the same file outright.
						A single flipped byte was worse, because it produced numbers <em>identical</em> to the
						clean file. No amount of reading the measurement could have found it.
					</p>
					<p class="measure">
						Four checks now run, into one reporting channel. FLAC frame CRC-8 and CRC-16 are verified
						rather than read and discarded — the only detector that catches an altered sample value.
						Declared length is compared with decoded length on FLAC <code>STREAMINFO</code>, the
						WAV/RF64/Wave64 <code>data</code> chunk and AIFF <code>COMM</code>/<code>SSND</code>. A
						sample peak above 0 dBFS on integer PCM is impossible arithmetic and so is proof of a bad
						decode whatever the checksums said. And JSON carries a <code>warnings</code> array that is
						<em>always</em> present, so an empty array is the positive statement "nothing was wrong"
						rather than the absence of evidence a missing key would be.
					</p>
					<p class="measure">
						<strong>The file is still measured.</strong> crête is a meter, not a repair tool: it
						reports what the bytes decode to and marks every affected number untrustworthy. That
						separation is what keeps the intact-file path bit-identical by construction — verified on
						62 files across nine codecs and five channel layouts, whole-JSON against a build of
						0.16.1, <strong>0 differing</strong>.
					</p>
					<p class="measure">
						Building the corpus immediately found a <strong>reachable segfault</strong>: a truncated
						AIFF walked off the end of the buffer, because the chunk walker used file-supplied lengths
						and an <code>SSND</code> offset without bounds-checking either — the same defect the RIFF
						walker had fixed in 0.14.0, in the decoder that never got the same treatment.
					</p>
				</div>
				<div>
					<table class="ab">
						<thead>
							<tr><th>4-track album, one bad sector</th><th>0.16.1</th><th>0.17.0</th></tr>
						</thead>
						<tbody>
							<tr><td>Album DR, clean copy</td><td class="num">DR13</td><td class="num">DR13</td></tr>
							<tr><td>Album DR, damaged copy</td><td class="num">DR9</td><td class="num">DR9</td></tr>
							<tr>
								<td>Sample peak, damaged</td><td class="num">+48.16 dBFS</td>
								<td class="num">+48.16 dBFS</td>
							</tr>
							<tr><td>Reported as damaged</td><td class="num">no</td><td class="num after">yes</td></tr>
							<tr><td>Exit status</td><td class="num">0</td><td class="num after">2</td></tr>
						</tbody>
					</table>
					<table class="ab spaced">
						<thead>
							<tr><th>Corpus and suite</th><th>Result</th></tr>
						</thead>
						<tbody>
							<tr><td><code>integrity</code> suite on 0.17.0</td><td class="num after">19/19</td></tr>
							<tr><td>Same suite on 0.16.1</td><td class="num">13 fail</td></tr>
							<tr><td>Fuzz cases, five native formats</td><td class="num">240, none crash</td></tr>
							<tr><td>Truncation offsets swept per format</td><td class="num">21</td></tr>
							<tr><td>Reference files tripping a check</td><td class="num">none, in 51 albums</td></tr>
						</tbody>
					</table>
				</div>
			</div>
			<p class="note rules">
				<strong>WAV and AIFF carry no checksum</strong>, so altered sample values in them are
				undetectable — by crête or by any other meter — because a run of zeros inside a
				<code>data</code> chunk cannot be told apart from digital silence the artist put there. That
				blind spot is <em>asserted</em> rather than glossed: the suite requires a WAV with 4 KB of zeros
				written into its audio to come back clean, so the limitation stays visible in a green run.
			</p>
		</article>

		<article class="case">
			<p class="case-tag">Rejected</p>
			<h3>Band-limiting before measurement: tested, then refused</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						DSD read +2 against the reference at 352.8 kHz output on the worst album in the corpus.
						The obvious fix — filter 20 Hz to 20 kHz before measuring, since only audible content
						matters — was implemented as an experiment and measured. It works: band-limiting removes
						about 78 % of the inflation and returns both offending tracks to their 44.1 kHz integer.
					</p>
					<p class="measure">
						It still was not built. It lands on no oracle — bandpassed reads DR12–13 where the
						reference at that rate reads 14, converging on neither. Going from 12 to 48 dB/oct barely
						moved it, so the residual is not filter slope but the sheer size of DSD noise-shaping
						above 30 kHz, which needs brickwall-grade attenuation. Which is precisely what decimating
						to 44.1 kHz already does, with a 641-tap filter, by default, at full parity. A flag would
						have been a worse version of the default path.
					</p>
				</div>
				<div>
					<table class="ab">
						<thead>
							<tr>
								<th>Thriller — Beat It, DSD64</th><th>raw DR</th><th>int</th><th>sample peak</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>@44100 (default)</td><td class="num">11.665</td>
								<td class="num after">12</td><td class="num">−2.654</td>
							</tr>
							<tr>
								<td>@352800 unfiltered</td><td class="num">15.581</td><td class="num">16</td>
								<td class="num">+1.706</td>
							</tr>
							<tr>
								<td>@352800 + 12 dB/oct</td><td class="num">12.533</td><td class="num">13</td>
								<td class="num">−0.985</td>
							</tr>
							<tr>
								<td>@352800 + 48 dB/oct</td><td class="num">12.462</td><td class="num">12</td>
								<td class="num">−1.002</td>
							</tr>
							<tr><td>MAAT @352800</td><td>—</td><td class="num">14</td><td>—</td></tr>
							<tr><td>MAAT @44100</td><td>—</td><td class="num">12</td><td>—</td></tr>
						</tbody>
					</table>
				</div>
			</div>
			<p class="note rules">
				The unfiltered 352.8 kHz sample peak is <em>above full scale</em> — retained noise-shaping
				alone drives the meter over. Ruled out as an explanation: inter-sample peak resolution. At
				44.1 kHz the 4×-oversampled true peak is −2.630 against a sample peak of −2.654, so there is
				essentially no overshoot to find.
			</p>
		</article>

		<article class="case">
			<p class="case-tag">Gated weekly</p>
			<h3>Cross-architecture identity is exactly zero</h3>
			<div class="cols-tight">
				<div>
					<p class="measure">
						crête pins <code>-ffp-contract=off</code>. Without it the compiler fuses multiply-add
						into a single FMA instruction on architectures that have one and not on those that do
						not, so the ARM binary diverged from the x86 one at ULP level inside the K-weighting
						biquads — breaking the bit-reproducibility claim. For a long time that was an untested
						assertion. Now the two agents are compared directly, every week.
					</p>
					<p class="measure">
						A genuine platform finding fell out of the same work: Linux and macOS differ by one ULP
						on <code>20·log10(x)</code>, identically on both architectures. That is libm rounding, not
						contraction — so a macOS-produced JSON cannot be equality-compared against a Linux one.
					</p>
				</div>
				<div>
					<p class="term-head">aarch64 vs x86_64 — 273 lossless fields</p>
					<pre class="term">{`s01_truehd_atmos_7.1_48k.mkv  TRUEHD  EXACT  0.000e+00
s02_ac3_5.1_48k.mkv           AC3     tol    8.690e-07
s03_lpcm_5.1_96k.flac         FLAC    EXACT  0.000e+00
s04_dtshd_ma_5.1_96k.mkv      DCA     EXACT  0.000e+00
s05_lpcm_2.0_192k.flac        FLAC    EXACT  0.000e+00
s06_dtshd_ma_2.0_96k.mkv      DCA     EXACT  0.000e+00`}</pre>
				</div>
			</div>
			<p class="note rules">
				Lossless carriers are asserted <em>exact</em>; the lossy AC-3 decoder is allowed 1e-2 for
				per-architecture SIMD. A lossless-tier failure on another agent is the identity question
				itself, not noise — it must not be loosened to pass.
			</p>
		</article>
	</section>

	<section class="section">
		<p class="kicker">06 — Where the reference is wrong</p>
		<h2>Three disagreements that turned out not to be crête's</h2>
		<div class="rows wrong">
			<div>
				<h3>LRA: the reference disagrees with itself</h3>
				<p>
					Nine LRA flags on one album, the largest non-DSD residual on record, closed as external.
					crête passes all six official EBU Tech 3342 compliance vectors within tolerance and its LRA
					is rate-invariant to ≤0.06 LU. MAAT's own LRA moves by up to <strong>2.77 LU</strong> across
					sample rates of the same album — more than the entire crête-versus-MAAT disagreement — while
					the short-term loudness it is derived from moves ≤0.01 LU. crête agrees with MAAT better than
					MAAT agrees with itself.
				</p>
			</div>
			<div>
				<h3>Album DR cannot be matched by rule choice</h3>
				<p>
					MAAT prints per-track integers and an album value, so its aggregation rule is derivable with
					crête out of the loop. Rounding the mean of its own integers reproduces its own album DR on
					only <strong>37 of 41</strong> albums — and three exact <code>.5</code> means round two ways.
					No rounding rule on integers can produce that, so MAAT averages internal raw values it never
					exports. crête averages raw and rounds once, matching the reference implementation's source.
				</p>
			</div>
			<div>
				<h3>A reference decode bug on a valid file</h3>
				<p>
					One track's FLAC verifies against its own embedded checksum and crête decodes it
					bit-perfectly, matching a five-rate consensus — yet MAAT deterministically mismeasures RMS,
					LRA and DR on that encoding, and measures a re-encode of identical audio correctly. The
					corpus was re-recorded from the new render; the original is kept as a minimal reproduction.
				</p>
			</div>
		</div>
		<p class="note rules">
			A fourth is a measurement artefact rather than a bug: on an all-zero channel the two tools print
			their own floors, which manufactures a 20 dB "failure" out of digital silence. The suite now
			asserts DR equal to zero on both sides rather than skipping the case.
		</p>
	</section>

	<section class="section">
		<p class="kicker">07 — Known limitations</p>
		<h2>Everything currently open, with the number attached</h2>
		<p class="intro">
			This is the complete list as of {version}. Items are here because they are measured and
			unresolved, not because they are unexamined.
		</p>
		<div class="scroll-x">
			<table class="table limits">
				<thead>
					<tr><th style="width:24%">Limitation</th><th>Measurement</th><th style="width:16%">Status</th></tr>
				</thead>
				<tbody>
					{#each openItems as l (l.what)}
						<tr>
							<td><strong>{l.what}</strong></td>
							<td><Inline text={l.measure} /></td>
							<td class="status">{l.status}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<Footer {version}>
	{#snippet note()}
		Harness figures from weekly runs #53–#85. The pytest harness lives in a separate private
		repository.
	{/snippet}
</Footer>

<style>
	h2 {
		margin-bottom: 8px;
	}

	.h-step {
		margin-bottom: 28px;
	}

	.intro {
		max-width: 56ch;
		margin-bottom: 28px;
	}

	.intro.wide {
		max-width: 76ch;
		margin-bottom: 16px;
	}

	.rules {
		max-width: 76ch;
		margin-top: 20px;
	}

	.narrow {
		max-width: 66ch;
		margin-top: 16px;
	}

	/* The oracle list: rank and name held left, the argument beside them. */
	.oracle {
		display: grid;
		grid-template-columns: minmax(180px, 220px) 1fr;
		gap: 24px;
	}

	.rank {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-accent-700);
	}

	.oname {
		font-size: 16px;
	}

	.suites .sname {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 12.5px;
	}

	.scroll-x .table.suites {
		min-width: 900px;
	}

	.scroll-x .table.limits {
		min-width: 720px;
	}

	.limits .status {
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-neutral-700);
	}

	/* A forensics case: a tag, a heading, then the argument and its table. */
	.case {
		border-top: 2px solid var(--color-divider);
		padding-top: 28px;
		margin-top: 32px;
	}

	.case-tag {
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent-700);
		margin: 0 0 8px;
	}

	.case h3 {
		margin: 0 0 20px;
		font-size: 24px;
	}

	.spaced {
		margin-top: 24px;
	}

	.term-head {
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-neutral-700);
		margin: 0 0 10px;
	}

	.wrong h3 {
		font-size: 16px;
		margin-bottom: 6px;
	}

	@media (max-width: 640px) {
		.oracle {
			grid-template-columns: 1fr;
			gap: 8px;
		}
	}
</style>

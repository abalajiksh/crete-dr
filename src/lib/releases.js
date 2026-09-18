// The release history, derived from the Crete repository: one entry per release
// band, with the version, the tag or bump-commit date, and the copy condensed
// from that release's own commit message, its annotated tag and the README
// sections it added.
//
// Two things to know before editing:
//
// * `impact` is the point of this page. A meter's changelog has an obligation
//   ordinary software does not — it must say whether previously recorded
//   measurements are still comparable. 'moves' means recorded numbers change,
//   'identical' means they provably do not, 'additive' means new surface only.
//   Where numbers moved, `body` must name the flag that reproduces the old
//   behaviour. Do not add an entry without deciding its impact.
// * The first entry is the current release: `version` on every page and in the
//   footer reads from it (see version.js), so there is no second place to bump.
//
// Dates are the tag date where a tag exists, otherwise the version-bump commit.
// 0.13.1 and the 0.10.x / 0.11.x releases were shipped without tags; their
// dates come from the bump commits (d1061a2, 6ae068d, 666cb2f, and so on).

/**
 * @typedef {'moves' | 'identical' | 'additive'} Impact
 * @typedef {{
 *   version: string,
 *   date: string,
 *   impact: Impact[],
 *   title: string,
 *   body: string[]
 * }} Release
 */

/** @type {Release[]} */
export const releases = [
	{
		version: '0.14.0',
		date: '2026-09-18',
		impact: ['moves', 'additive'],
		title: 'The reference block set becomes the default; the 4 GB ceiling is gone',
		body: [
			'`--dr-blocks reference` ships as the default. crête’s 3-second block set now matches the PMF reference implementation: the trailing partial block is kept and normalised by its own length, and there is no RMS gate. Weighted mean error over **2241 DR comparisons fell 33 %**, integer DR flags halved, and not one DR row regressed. `--dr-blocks legacy` reproduces ≤ 0.13.1 bit-for-bit.',
			'**RF64 / BW64 / Wave64** land, sharing one payload decoder with WAV and measuring identically to it. The `ds64` 64-bit size is proven honoured by a file carrying a chunk *after* the data chunk — which a naive read-to-end swallows, moving duration by a second and DR from 12.28 to −9.21.',
			'The rewrite also fixed a **reachable crash**: a truncated WAV — an interrupted recording or a partial copy — read past the end of its buffer and segfaulted with no output at all. All three container walkers now clamp to the bytes actually present.'
		]
	},
	{
		version: '0.13.1',
		date: '2026-09-16',
		impact: ['additive'],
		title: 'Disc audio, stream selection, and three long-open items closed',
		body: [
			'TrueHD, MLP, E-AC-3, AC-3 and DTS decoders added to the compact FFmpeg tier, making music Blu-ray rips work directly. `--stream N` pins which audio stream is measured, and multi-stream files now say which one they used — the silent pick was the real bug, since the automatic choice is not stable across remuxes of the same content.',
			'`--dr-lfe include` makes the LFE-scoring divergence a setting rather than an argument.',
			'Writing the selector test immediately surfaced a genuine defect: with six streams interleaved, the default probe could run out before seeing a TrueHD frame, so the resampler was built from a format the probe had only predicted. It is now built from the first decoded *frame*.',
			'**Closed:** cross-architecture identity, now measured on both agents and gated weekly. The already-low per-channel DR tail, root-caused to the block set. And the LRA flags on one album, closed as external — the reference disagrees with itself by more than it disagrees with crête.'
		]
	},
	{
		version: '0.13.0',
		date: '2026-09-16',
		impact: ['moves'],
		title: 'The top-20 % RMS averages power, not amplitude',
		body: [
			'The PMF procedure takes a quadratic mean; crête had been taking an arithmetic mean of amplitudes. Since the arithmetic mean never exceeds the quadratic, the reference RMS was always low and DR was always **biased high** — about 0.03 dB on dense stereo, up to 1.47 dB on sparse channels. Per-channel DR accuracy against the reference improved **27–38 %** and the net signed bias over integer mismatches went from +9 to **0**.',
			'It was found by cross-checking a 5.1 corpus against two independent references simultaneously: over 264 per-channel values they agreed with each other to a mean of 0.006 dB while crête sat 0.095 from both — so the residual was crête’s, not reference noise.',
			'`--dr-mean arithmetic` reproduces ≤ 0.12.1 bit-for-bit. Every other metric is untouched: across 847 metric rows in the validating weekly, **nothing non-DR moved anywhere**.'
		]
	},
	{
		version: '0.12.0 → 0.12.1',
		date: '2026-09-13',
		impact: ['identical', 'additive'],
		title: 'Mono, 5.1 and 7.1 — a stated rule instead of an implied one',
		body: [
			'One shared channel-layout table — speaker names, LFE identification, BS.1770 weights — read by the CLI, the JSON writer and the GUI, so the three front-ends cannot describe a layout differently. BS.1770-4 channel weighting for every summed measurement; the LFE excluded from every aggregate while still measured and displayed in full.',
			'DR (PMF) becomes the mean of the scored channels, with Front L/R DR and the lowest scored channel reported alongside it. TT DR defines nothing past stereo, so the rule was *decided*, not discovered, and the output says so.',
			'**Bit-identity was verified, not assumed.** Mono and stereo weights are all unity and neither layout has an LFE, so every changed loop reduces to its old form — multiplication by 1.0 is exact in IEEE 754, and the accumulation guard sits inside the inner loop so the joint RMS accumulation order is preserved verbatim. Measured across 115 DSD files at four rates: zero value differences.',
			'A visual check of the GUI on a 5.1 master then found a defect the suites cannot see: the results-table footer was clipped against the window bottom even maximised, because the port reserved a hardcoded height for a band that wraps to two lines. It would have shipped. Fixed in 0.12.1.'
		]
	},
	{
		version: '0.11.3',
		date: '2026-07-29',
		impact: ['moves'],
		title: 'Per-channel DR gets its own RMS; album DR stops rounding twice',
		body: [
			'Left and right had shared a single across-channel RMS, so they could differ only through the peak term. The error cancelled in the mean — which is exactly why it survived years of validation — but split wrongly per channel by up to 2.37 dB, and collapsed to identical left and right values bit-for-bit whenever both channels shared a second-highest block peak. **Per-channel DR flags fell from 83 and 77 to 8 and 5**, and the left-minus-right spread error to a median of 0.000 dB.',
			'Album DR had been rounding twice — the mean of already-rounded track values. It now averages raw and rounds once, which is what the reference implementation’s source does and what the reference meter’s own published data proves it does too.',
			'Both are covered by a zero-dependency synthetic self-check with analytically known truth, needing no corpus: it passes on this release and fails on the one before it.'
		]
	},
	{
		version: '0.11.0 → 0.11.2',
		date: '2026-07-23',
		impact: ['moves'],
		title: 'One shared short-term grid, and standards tags on every figure',
		body: [
			'Max Short-Term, LRA and Min PSR now share a single 3-second window on a 0.1-second hop, computed once per track. LRA and PSR had each sampled that window on a private 1.0-second grid, which biased Min PSR high — the true minimum window could fall between hops — and thinned the LRA percentile distribution on sparse material. All other metrics are bit-identical, and the official compliance vector suites pass on the new grid.',
			'Each joint value now carries its governing-standard tag in the detail output, with a legend in the footer, a `standards` map in JSON, and the same information in the GUI’s About panel. Per-channel momentary and short-term columns are marked as informative non-standard variants.',
			'Log writing became opt-in — results stay in the window unless asked otherwise. The GUI grew a DSD Guide side panel, and `make gui-ffmpeg` arrived.'
		]
	},
	{
		version: '0.10.1',
		date: '2026-07-22',
		impact: ['identical'],
		title: 'Parallel analysis in the CLI, and floating-point contraction pinned off',
		body: [
			'The 0.9.2 thread pool was GUI-only; the CLI still analysed files serially, which is how it was spotted — as single-threaded runs under Jenkins. The same pattern is now in the CLI: per-group workers, an atomic work cursor, order-preserving result slots and errors replayed after the join so they never interleave with progress output. Verified bit-identical to a sequential run on FLAC, DSD and cue albums — `-j` changes wall-clock time and nothing else.',
			'`-ffp-contract=off` pinned for both C and C++. The compiler’s default fused multiply-add on FMA-capable targets and not on generic x86-64, so the ARM CI binary diverged from the x86 development binary at ULP level inside the K-weighting biquads — breaking the bit-reproducibility claim. A no-op on x86; it disciplines ARM to match.'
		]
	},
	{
		version: '0.10.0',
		date: '2026-07-22',
		impact: ['additive'],
		title: 'MQA is reported, and there is no flag to turn it off',
		body: [
			'A listener measuring dynamic range is entitled to know a file is lossy MQA rather than lossless, so the report is unconditional. Detection is deterministic: crête rebuilds the MQA bitstream from the XOR of the stereo low bits and verifies the `datasync` packet — a 40-bit sync value plus a well-formed field structure — then reads the authored sample rate, the authentication level that separates Studio from green, and the render filter and bit-depth indices. The carrier is scanned across bit planes 0–15, covering both 24-bit hi-res MQA at bit 8 and 16-bit MQA-CD at bit 0.',
			'**A match is proof, not a guess**, so there are no false positives on noisy-but-lossless masters. The low-bit entropy statistic is exposed in JSON as a raw diagnostic and never as a verdict — it cannot separate MQA from analog tape hiss or a prior lossy generation.',
			'There is no decode. The unfold and render DSP exists only in the proprietary licensed decoder, so DR is still measured on the delivered base-band PCM and the warning says so.'
		]
	},
	{
		version: '0.9.0 → 0.9.2',
		date: '2026-07-21',
		impact: ['moves'],
		title: 'The DSD engine is replaced, and the licence becomes clean',
		body: [
			'The former byte-LUT decimation engine was transcribed from another player’s LGPL source, and its coefficient tables and chain topology carried that licence into an MIT project. It was retired and replaced by a vendored clean-room BSD-2-Clause kernel: linear-phase FIR only, unity DC gain, flat C ABI, no container parsing. crête’s licensing is now cleanly MIT plus BSD-2-Clause.',
			'Different clean-room filters mean different numbers, so **every DSD reference baseline was regenerated** against the commercial reference rather than carried across. Two new axes appeared with it — `--dsd-filter` and `--dsd-out-rate`, defaulting to 44100 — and the default chain became multistage, the measurement-grade path. DSD512 became supported in 0.9.1; DSD1024 and above are rejected by name.',
			'The GUI was redesigned around horizontal bands with a light and dark shell, gained the DSD strip exposing all three axes, and gained parallel per-file analysis — validated bit-identical and roughly five times faster. The redesign also closed a deadlock that froze the window on Analyze, and a per-frame directory scan.'
		]
	}
];

/** The labels and explanations for the impact chips, in display order. */
export const IMPACT = {
	moves: { label: 'moves numbers', hint: 'Recorded measurements change on this release.' },
	identical: { label: 'bit-identical', hint: 'Measurements are provably unchanged.' },
	additive: { label: 'additive', hint: 'New surface only; no recorded value moves.' }
};

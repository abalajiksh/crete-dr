// Content for the Testing page. Figures are from the harness's own weekly
// reports (#53–#73) as recorded in the Crete working record; the suite table
// mirrors what crete-pytest actually gates.

/** The pipeline, corpus to verdict. */
export const pipeline = [
	{
		n: '01 Corpus',
		text: 'Real albums, never synthesised: PCM at six rates, DSD64→512, MQA, cue monoliths, mono stems, 5.1, 7.1, quad, DTS:X, Blu-ray disc audio.'
	},
	{
		n: '02 Object store',
		text: 'One zip per suite with a pinned sha256, staged and denested on the agent. Corpus shape is asserted, not assumed — depth distribution is checked before a run.'
	},
	{
		n: '03 Agents',
		text: 'Two Linux machines, aarch64 and x86-64, each building its own target natively. Per-suite capability flags decide which extra binaries get built.'
	},
	{
		n: '04 Suites',
		text: 'Each suite reads crête’s JSON and compares every field against its reference rows. A suite that produces zero comparisons **fails**.'
	},
	{
		n: '05 Report',
		text: 'Allure archive per run: comparison counts, per-metric max and mean |Δ|, flag lists, a top-20 worst-delta table.'
	},
	{
		n: '06 Baselines',
		text: 'A fully green run snapshots per-album per-metric max |Δ|. Later runs fail only on a *worsening* beyond baseline + margin, with an absolute backstop for gross breakage.'
	}
];

/** The four tiers of oracle, ranked. No single reference is trusted. */
export const oracles = [
	{
		rank: 'Tier 1 · primary',
		name: 'MAAT DROffline MkII',
		text: 'The commercial reference meter, and the sole external oracle for PCM and DSD. Reference rows are keyed to a crête version and decode configuration and stored alongside the values. DSD rows are produced by measuring crête’s own 32-bit-float exports, because MAAT cannot open a `.dsf` — which is why the exporter itself is gated.'
	},
	{
		rank: 'Tier 2 · cross-check',
		name: 'foobar2000 DR Meter',
		text: 'Retired as a routine oracle, kept as an *independent second implementation*. That distinction earned its keep: on 264 per-channel values foobar and MAAT agreed with each other to a mean of 0.006 dB while crête sat 0.095 from both — proof the residual was crête’s, not reference noise.'
	},
	{
		rank: 'Tier 3 · analytic',
		name: 'Synthetic self-checks',
		text: 'Signals whose answer is known on paper, needing no corpus and no harness. `check_fix12.sh` asserts that equal-peak / half-RMS channels differ by exactly 6.02 dB, and that raw track values 7.6/7.6/7.1 give album DR7. It passes on the fixed build and fails on the broken one. This tier is what catches the input no corpus holds: a synthetic 5.1 whose LFE is its loudest channel exposed the joint true-peak defect that every real album hides, and the DST decoder’s frame-consumption assertion caught a decoder that satisfied every other plausibility check available.'
	},
	{
		rank: 'Tier 4 · controls',
		name: 'crête versus crête',
		text: 'Suites where both sides are crête, so the answer must be zero: the same audio in five containers, a cue monolith against per-track files, FFmpeg-decoded ALAC against the native FLAC decode, DSF against DFF. These are what isolate a measurement bug from a decode bug.'
	}
];

/** What each suite gates, and where it stood at weekly #73. */
export const suites = [
	{
		name: 'QUALIFICATION',
		gates: 'The full 21-metric set on PCM',
		oracle: 'MAAT',
		corpus: '11 albums — Thriller ×5 rates, East Meets West ×6 rates',
		latest: 'green'
	},
	{
		name: 'DSD64 / 128 / 256 / 512',
		gates: 'DSD decode + measurement at 44.1 and 352.8 kHz out',
		oracle: 'MAAT, via `dsd2wav` exports',
		corpus: '8 albums across four rates',
		latest: 'green'
	},
	{
		name: 'MQA',
		gates: 'Detection and measurement on MQA-encoded releases',
		oracle: 'MAAT',
		corpus: 'MQA-CD 16-bit and 24-bit hi-res',
		latest: 'green'
	},
	{
		name: 'MONO',
		gates: 'The 1-channel path and the dual-mono stereo path',
		oracle: 'MAAT',
		corpus: 'Turtles 96/24 dual-mono + its `[M]` stems',
		latest: '330 comparisons, **zero flags**'
	},
	{
		name: 'SURROUND',
		gates: '5.1 channel weighting, LFE exclusion, per-channel DR',
		oracle: 'MAAT on 2-channel stems',
		corpus: '3 × 5.1 albums, 45 tracks × 6 channels',
		latest: '1620 comparisons'
	},
	{
		name: 'QUADIO',
		gates: 'The 4-channel layout case',
		oracle: 'MAAT',
		corpus: '1972 quad Blu-ray Audio',
		latest: '240 comparisons, **zero flags**'
	},
	{
		name: 'DTSX',
		gates: 'DTS:X bed decode at 7.1',
		oracle: 'MAAT on four stem groups',
		corpus: 'Classical Blu-ray, 12 tracks',
		latest: '350 comparisons, 1 flag'
	},
	{
		name: 'DISCAUDIO',
		gates: 'TrueHD / DTS-HD MA / AC-3 decode and stream selection',
		oracle: 'Self-carrier parity + snapshot',
		corpus: 'Six audio streams off one UHD remux',
		latest: '8/8 on both agents'
	},
	{
		name: 'FORMAT',
		gates: 'Container-independence: identical metrics across WAV, FLAC, AIFF, AIFF-C `sowt`, RF64, Wave64',
		oracle: 'crête vs crête',
		corpus: '6 albums transcoded every way',
		latest: 'Δ 0.000'
	},
	{
		name: 'CUE',
		gates: 'Cue slicing against the equivalent per-track album',
		oracle: 'crête vs crête',
		corpus: 'Monolithic albums with sheets',
		latest: 'Δ 0.000'
	},
	{
		name: 'FFMPEG_PARITY',
		gates: 'ALAC through FFmpeg against the native FLAC decode',
		oracle: 'crête vs crête',
		corpus: '105 comparisons',
		latest: 'Δ 0.000'
	},
	{
		name: 'DSD_PARITY',
		gates: 'The DSF reader against the DFF deinterleaver',
		oracle: 'crête vs crête',
		corpus: 'One album, deliberately — it proves a property of the code',
		latest: 'Δ ≤ 0.01'
	},
	{
		name: 'DSD_ROUNDTRIP',
		gates: 'The `dsd2wav` exporter that produces every DSD reference row',
		oracle: 'crête vs crête, two-tier',
		corpus: 'Thriller DSD64',
		latest: '4.5e-07 dB order statistics'
	},
	{
		name: 'CROSSARCH',
		gates: 'Bit-identity between the two architectures',
		oracle: 'Agent vs agent',
		corpus: 'Six disc-audio carriers',
		latest: '273 fields, **0.000e+00**'
	}
];

/** Everything currently open, with the number attached. Complete as of 0.16.0. */
export const openItems = [
	{
		what: '352.8 kHz DSD carries no parity claim',
		measure:
			'DR reads +1…+3 higher than at 44.1 kHz; both tools agree on direction, not magnitude. Every DSD album-level mismatch on record occurs only at this rate. 44.1 kHz is 8/8 clean.',
		status: 'Documented, deliberate'
	},
	{
		what: 'Min PSR diverges from the reference',
		measure:
			'Average |Δ| 0.611 dB, max 2.89 — about seven times the next-worst metric. MAAT’s figure was reverse-engineered as a 0.5 dB/s decaying peak-hold; crête implements AES eBrief 373. A decode-versus-formula experiment proved it is a formula difference, not a decode artefact.',
		status: 'Closed as won’t-fix'
	},
	{
		what: 'Disc audio has no external oracle',
		measure:
			'TrueHD, DTS-HD MA and AC-3 are gated against crête’s own snapshot and against the LPCM carrier of the same master — where every metric matches exactly, with only RMS moving by 1.2e-04 dB from one frame of decoder tail. SACD and DST are now in the same position.',
		status: 'Open, not a blocker'
	},
	{
		what: 'SACD is not in the weekly harness yet',
		measure:
			'The intended gate is crête-on-the-ISO against crête on an external extraction of the same disc — crête versus crête, needing no outside meter. What has been run is narrower and passed: all ten stereo-area track durations on the 2018 DSOTM disc match the published running order, and one track returns peak −5.489 / RMS −19.753 against the −5.49 / −19.75 already recorded from a `.dsf` rip of the same album. The extraction comparison is worth running once; the suite is not written.',
		status: 'Open'
	},
	{
		what: 'DST decoding is slow',
		measure:
			'Roughly 2× realtime for six channels — a 43-minute 5.1 disc takes about 20 minutes. DST interleaves every channel through one arithmetic decoder, so no parallelism exists inside a frame; the prediction history is reinitialised per frame, so frames are independent and could be decoded in parallel. Not done.',
		status: 'Open, known fix'
	},
	{
		what: 'Object audio is measured as its bed',
		measure:
			'No Atmos or DTS:X renderer exists in the chain. The 7.1 TrueHD bed is what a non-Atmos playback chain delivers, and since 0.15.0 crête names the profile and marks the layout as a bed rather than leaving it to be inferred. Do not read a bed measurement as an Atmos measurement.',
		status: 'Out of scope, labelled'
	},
	{
		what: 'Auro-3D cannot be identified',
		measure:
			'FFmpeg reports an Auro carrier as plain DTS-HD MA, so the profile field cannot see it. On the one disc measured the height channels were in the carrier’s low bits — real enough to find, at 803,853 non-zero LFE samples within ±24 against the DTS:X carrier’s exact zero — but reading that is inference, not a bitstream field. If it is ever built it belongs in the confidence-scored forensics namespace, never in the metrics.',
		status: 'Not attempted'
	},
	{
		what: 'The >4 GB allocation is untested',
		measure:
			'RF64 / BW64 / Wave64 64-bit sizes are honoured — proven by a file carrying a chunk *after* the data chunk, which a naive reader swallows. crête loads a whole file before decoding, so a genuine >4 GB decode needs a larger host than any agent has.',
		status: 'Open, host-limited'
	},
	{
		what: 'The reference cannot score short tracks',
		measure:
			'Below about 30 seconds MAAT declines to compute DR at all, needing ten 3-second windows. One DSD256 album logs 14 of 17 tracks; the suite pins that exemption to exactly those counts, conditionally, so a complete local run still passes.',
		status: 'Exempted by design'
	},
	{
		what: 'No full-length lossless-carrier parity fixture',
		measure:
			'The clip-based pair is exact, but the ideal fixture has no clip-boundary tail — and a full 43-minute 5.1 96 kHz title decodes to roughly 12 GB of float64 per side. Needs a memory plan first.',
		status: 'Open'
	},
	{
		what: 'DFF coverage is one album',
		measure:
			'Deliberate: the suite proves a property of the code — that the DSF reader and the DFF deinterleaver emit the same samples — not a property of any album. A second multi-gigabyte capture would re-prove the same invariant.',
		status: 'Deliberate'
	},
	{
		what: 'Two reference rows nothing reproduces',
		measure:
			'On one DTS:X stem crête and MAAT agree to within 0.21 dB on ten of twelve tracks; two rows match nothing, including the peaks that gate them. Quarantined as named anomalies rather than absorbed into a tolerance.',
		status: 'Quarantined'
	},
	{
		what: 'The GUI takes defaults on two axes',
		measure:
			'It has no control for the DR averaging mode or the block set and always uses the shipping defaults; both are CLI-only A/B switches.',
		status: 'By design'
	},
	{
		what: 'The GUI does not open an SACD image',
		measure:
			'`.iso` is absent from the accepted extensions and there is no area selector, so disc images go through the CLI. Nothing about the decode is CLI-specific — it is front-end surface that has not been added.',
		status: 'Open'
	},
	{
		what: 'Release packaging is not built',
		measure:
			'Windows-on-ARM needs a second toolchain; Linux builds must be native rather than cross-compiled from macOS; the macOS leg has no agent and needs signing. Decided, scoped, not started.',
		status: 'Parked'
	}
];

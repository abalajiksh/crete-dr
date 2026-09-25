// Content for the Testing page. Figures are from the harness's own weekly
// reports (#53–#85) as recorded in the Crete working record; the suite table
// mirrors what crete-pytest actually gates.
//
// Comparison counts, flag counts and per-metric averages are read off the
// archived per-suite detailed reports for weekly #85 — the first run on 0.18.0
// and the first to carry the DVD suite. Every one of its 15 detailed reports is
// byte-identical to its #77 counterpart below the header, and #77's were in turn
// identical to #73's apart from one added header line, so a figure carried from
// #73 or #77 is still current by measurement rather than by assumption. #81 and
// #82 are not used: both went unstable on the same three corpus-staging faults.

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
		text: 'Retired as a routine oracle, kept as an *independent second implementation*. That distinction earned its keep: on 264 per-channel values foobar and MAAT agreed with each other to a mean of 0.006 dB while crête sat 0.095 from both — proof the residual was crête’s, not reference noise. It is back for **one rule MAAT cannot adjudicate**: MAAT reads at most two channels, so no MAAT row holds an LFE, and foobar is the only measured implementation of the all-channel rule `--dr-lfe include` reproduces. Validated before any row was written, pairing by track number: album DR matches **exactly** on all three 5.1 albums, per-channel DR to a mean of 0.036 dB over 264 values, and on 4.0 — where the two rules are the same rule — every track integer matches and the flag is byte-inert. Added after weekly #85, so not yet through a weekly.'
	},
	{
		rank: 'Tier 3 · analytic',
		name: 'Synthetic self-checks',
		text: 'Signals whose answer is known on paper, needing no corpus and no harness. `check_fix12.sh` asserts that equal-peak / half-RMS channels differ by exactly 6.02 dB, and that raw track values 7.6/7.6/7.1 give album DR7. It passes on the fixed build and fails on the broken one. `check_lfe_peak.sh`, added in 0.19.0, holds a 5.1 with every channel at −20 dBFS and the LFE at −3 to the true-peak bound, and asserts its own premise — the joint sample peak must move ~17 dB between LFE settings, or the fixture has stopped testing anything. `check_cue_multifile.sh`, added in 0.19.1, cuts two synthetic WAV sides, each two tones at distinct levels, so a track’s sample peak names the exact file and half it was cut from; it passes, and fails on 0.19.0. This tier is what catches the input no corpus holds: that synthetic exposed the joint true-peak defect that every real album hides, and the DST decoder’s frame-consumption assertion caught a decoder that satisfied every other plausibility check available.'
	},
	{
		rank: 'Tier 4 · controls',
		name: 'crête versus crête',
		text: 'Suites where both sides are crête, so the answer must be zero: the same audio in five containers, a cue monolith against per-track files, FFmpeg-decoded ALAC against the native FLAC decode, DSF against DFF. These are what isolate a measurement bug from a decode bug.'
	}
];

/** What each suite gates, and where it stood at weekly #85. */
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
		latest: '341 comparisons, **zero flags**'
	},
	{
		name: 'SURROUND',
		gates: '5.1 channel weighting, LFE exclusion, per-channel DR',
		oracle: 'MAAT on 2-channel stems',
		corpus: '3 × 5.1 albums, 45 tracks × 6 channels',
		latest: '1620 comparisons, 3 flags'
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
		latest: '704 comparisons, **Δ 0.000**'
	},
	{
		name: 'CUE',
		gates: 'Cue slicing against the equivalent per-track album',
		oracle: 'crête vs crête',
		corpus: 'Monolithic albums with sheets',
		latest: '132 comparisons, **Δ 0.000**'
	},
	{
		name: 'FFMPEG_PARITY',
		gates: 'ALAC through FFmpeg against the native FLAC decode',
		oracle: 'crête vs crête',
		corpus: '5 ALAC albums against their FLAC equivalents',
		latest: '1672 comparisons, **Δ 0.000**'
	},
	{
		name: 'DSD_PARITY',
		gates: 'The DSF reader against the DFF deinterleaver',
		oracle: 'crête vs crête',
		corpus: 'One album, deliberately — it proves a property of the code',
		latest: '264 comparisons, max Δ 0.06 (Min PSR); DR 0.000'
	},
	{
		name: 'DSD_ROUNDTRIP',
		gates: 'The `dsd2wav` exporter that produces every DSD reference row',
		oracle: 'crête vs crête, two-tier',
		corpus: 'Thriller DSD64',
		latest: '4.5e-07 dB order statistics'
	},
	{
		name: 'SACD',
		gates: 'The Scarlet Book walk, both areas, and the DST decoder',
		oracle: 'Recorded values; `.dsf` extraction, not yet wired',
		corpus: 'A reduced DSOTM image, 229 MB, plus an ISO9660 negative control',
		latest: '6 passed / 2 skipped'
	},
	{
		name: 'DVD',
		gates: 'Title sets read as one stream, the group-change stop, stream selection',
		oracle: 'crête vs crête — each disc’s lossless stream against the same audio as FLAC',
		corpus: 'Pack-aligned byte ranges of one DVD-Video and one DVD-Audio',
		latest: '**10/10**, first weekly'
	},
	{
		name: 'INTEGRITY',
		gates: 'The damaged-input contract: warnings, exit 2, and no crash',
		oracle: 'None needed — synthetic, seeded, redistributable',
		corpus: 'Built from a fixed seed into a deterministic zip',
		latest: '**19/19**'
	},
	{
		name: 'CROSSARCH',
		gates: 'Bit-identity between the two architectures',
		oracle: 'Agent vs agent',
		corpus: 'Six disc-audio carriers',
		latest: '273 fields, **0.000e+00**'
	}
];

/** Everything currently open, with the number attached. Complete as of 0.19.5. */
export const openItems = [
	{
		what: '352.8 kHz DSD carries no parity claim',
		measure:
			'DR reads +1…+3 higher than at 44.1 kHz; both tools agree on direction, not magnitude. At 44.1 kHz the continuous per-track DR comparison flags **nothing** on any of the 8 DSD albums — in weekly #77 the only `DR (PMF) raw` flags in the whole run are 3 tracks of `Thriller_DSD64@352800` — and album DR matches on **7 of 8**. The exception is not rate-related: `BoneyM_10k_DSD128@44100` misses a `.5` boundary by **0.020 dB**, which is an accuracy question and no aggregation rule can fix it. At 352.8 kHz `Thriller_DSD64` mismatches at album level *and* on 4 of 9 tracks, maximum integer delta 2.',
		status: 'Documented, deliberate'
	},
	{
		what: 'Min PSR diverges from the reference',
		measure:
			'Average |Δ| 0.598 dB across 411 comparisons in weekly #77, max 2.89 — about eight times the next-worst metric. MAAT’s figure was reverse-engineered as a 0.5 dB/s decaying peak-hold; crête implements AES eBrief 373. A decode-versus-formula experiment proved it is a formula difference, not a decode artefact.',
		status: 'Closed as won’t-fix'
	},
	{
		what: 'Disc audio and SACD have no external oracle',
		measure:
			'TrueHD, DTS-HD MA and AC-3 are gated against crête’s own snapshot and against the LPCM carrier of the same master — where every metric matches exactly, with only RMS moving by 1.2e-04 dB from one frame of decoder tail. DST sits in the same position. For SACD the right comparison is **written** and is the strongest gate in that suite — crête on the ISO must equal crête on the `.dsf` extracted from the same disc, two independent container readers over one decode chain — but it is **not running in CI**: it needs the DSD64 corpus staged beside the SACD one, and wiring that through the corpus-reuse mechanism would make the whole suite skip whenever the sibling was not ready. Those are the 2 skips in its 6-passed / 2-skipped result. DVD is the partial exception: foobar cannot open a `.vob` or `.aob`, but the suite already requires crête through the container to equal crête on the FLAC of the same audio exactly, so foobar measuring that FLAC reaches the container decode transitively — DR9 against DR9 on the DVD-Video LPCM, DR13 against DR13 on the DVD-Audio MLP. That tier was added after weekly #85.',
		status: 'Open, not a blocker'
	},
	{
		what: 'The SACD suite gates drift, not correctness',
		measure:
			'Closed since 0.16.1: the reader and the DST decoder had **no automated test of any kind** until 0.17.0, which is uncomfortable for code whose failure mode is silence — each of the three format traps found while writing it produced audible output and a plausible DR. The suite now measures a **reduced** image, 229 MB instead of ~4 GB, every audio sector the disc’s own bytes and only the extent fields of the TOC rewritten; the builder’s `--verify` measures every kept track in both the reduced and the full image and requires identical results, so its own address arithmetic cannot certify its own mistake. **6 passed / 2 skipped** on its first weekly, #77, and again in #85. Until the `.dsf` tier runs, what it gates is drift against recorded values rather than correctness against an oracle.',
		status: 'Gated, narrowly'
	},
	{
		what: 'A DVD-Audio title set measures as its first group',
		measure:
			'A title set can hold several mixes — *Rumours* carries a 96 kHz 5.1, a 96 kHz stereo and a 48 kHz 5.1 version in one, 39 tracks — and the group boundaries do not align with the file fragments. crête measures the first group as one stream, warns, and exits 2 rather than metering through the change. Since 0.18.1 `dvda-info` reads the titles and track lengths exactly, but durations do not give byte offsets in variable-rate MLP, and the table that would is a hypothesis until it meets the same arithmetic proof. So there is no per-track or per-title DVD-Audio measurement yet.',
		status: 'Open, tables parsed'
	},
	{
		what: 'A `.vob` lists one phantom audio stream',
		measure:
			'The compact FFmpeg cannot type the MPEG-2 video, content-probes it and matches it as MP3: three audio streams list as four, the extra decoding to 0.34 s at 16 kHz with a +23 dBFS peak. Adding the video parser and then the decoder changed nothing, and it cannot be filtered crête-side because MPEG audio is a legal DVD format. Automatic selection and every genuine `--stream` index are unaffected; the suite asserts those instead of an exact stream count.',
		status: 'Known, left alone'
	},
	{
		what: 'One LFE two oracles disagree with',
		measure:
			'DSOTM 5.1 `08 - Any Colour You Like`, LFE channel: foobar2000 reads 10.47 against crête’s 9.24, a 1.226 dB gap on a channel whose next-worst peer is 0.892 and everything else under 0.38. It is the **same track and channel** the MAAT stem comparison already flags as the one surround residual that never resolved, 1.38 → 1.23 across the quadratic-mean and block-set corrections. Two independent references, different paths, landing on one LFE makes it a lead rather than reference noise.',
		status: 'Open, a lead'
	},
	{
		what: 'DST decoding is slow',
		measure:
			'Roughly 2× realtime for six channels — a 43-minute 5.1 disc takes about 20 minutes. DST interleaves every channel through one arithmetic decoder, so no parallelism exists inside a frame; the prediction history is reinitialised per frame, so frames are independent and could be decoded in parallel. Not done.',
		status: 'Open, known fix'
	},
	{
		what: 'Altered samples in WAV and AIFF are undetectable',
		measure:
			'Neither container carries a checksum, so a changed sample value cannot be caught — by crête or by any other meter — because a run of zeros inside a `data` chunk is indistinguishable from digital silence the artist put there. Only declared length and the 0 dBFS range check apply. FLAC is the one native format that can prove itself, through frame CRC-8 and CRC-16. The `integrity` suite **asserts** the blind spot: a WAV with 4 KB of zeros written into its audio must come back clean, so a green run keeps the limitation visible rather than assuming it away.',
		status: 'Format-limited, asserted'
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
		what: 'The 0.19.5 duration guard has not yet run on Linux',
		measure:
			'Weekly #92 failed the DVD suite’s group-change test with `std::bad_alloc` on a Linux agent: a wrapped MPEG-PS timestamp declared 95 268 s for 12 MB of MLP, and the 0.19.0 decode reserve asked for about 40 GB per channel — which Linux refuses and macOS maps lazily, so the suite had passed on the development Mac. 0.19.5 rejects a duration the file is too small to hold. It is verified on macOS — DVD suite 12/12, seven FFmpeg carriers byte-identical with unchanged peak memory — and the Linux path is confirmed only by the next weekly. The census on this page remains weekly #85.',
		status: 'Open, unverified'
	},
	{
		what: 'Memory detection has only run on macOS',
		measure:
			'0.19.0 fits the worker pool to free memory, honouring a container limit — and the Linux and Windows paths behind that, `/proc/meminfo`, the cgroup v1 and v2 memory and CPU limits, CPU affinity and `GlobalMemoryStatusEx`, are written from the documented interfaces and **have never been run**. The cgroup read most needs a real test and is also the one with the most value, since it is the case the old one-per-core default got wrong. There is no admission control either: the pool is sized once, up front, and a worker heavier than its estimate is not throttled mid-run. The next weekly on the Linux agents is the first test.',
		status: 'Open, unverified'
	},
	{
		what: 'The packages are smoke-tested, not measured',
		measure:
			'Since 0.19.2 `crete` and `crete-gui` are published for openSUSE, Fedora, Debian, Ubuntu and Arch, and the only check inside each package build is that the binary runs and reports the version it was packaged as. The Homebrew `crete` formula, since 0.19.3, carries a test that measures a 20 s 1 kHz sine at −6 dBFS and asserts DR0, a −6.02 dBFS sample peak and −6.01 LUFS — but Homebrew runs it only on `brew test`, not on install. Since 0.19.4 releases are published from Jenkins, which smoke-builds the CLI tier from the release tarball and bumps the tap only after all 15 OBS repositories publish — but it has no macOS agent, so the formulae are never built on a Mac before users get them. The Linux packages are built with crête’s own flags — distribution `CFLAGS`, LTO and debug builds all off — so bit-identity with the gated builds holds **by construction, not by comparison**. No figure on this site was measured with a packaged binary: the census is weekly #85, on 0.18.0. The packaged `crete` is the FFmpeg tier without `-f json`.',
		status: 'Open'
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
		what: 'The new GUI bands were never looked at',
		measure:
			'0.16.1’s SACD, cue and stream-picker bands are verified by construction — both front-ends call one collector — and headlessly, which is not the same as having been seen. 0.17.0 adds warnings to that surface without adding a test that anyone looked at them either. The SACD row’s trailing hint is long, so narrow window widths are the case to check. The results-table footer clipping in 0.12.0 is precisely the class of defect a suite cannot catch.',
		status: 'Open'
	},
	{
		what: 'Release packaging is not built',
		measure:
			'Windows-on-ARM needs a second toolchain; Linux builds must be native rather than cross-compiled from macOS; the macOS leg has no agent and needs signing. Decided, scoped, not started.',
		status: 'Parked'
	}
];

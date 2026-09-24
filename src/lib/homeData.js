// Tabular content for the Overview page. Every figure here is carried from the
// Crete README / CLAUDE.md working record — see the page for what each one is.

/** The metric table: what crête reports and which specification governs it. */
export const metrics = [
	{
		metric: 'DR (PMF)',
		standard: 'TT Dynamic Range',
		tag: { text: 'PMF', kind: 'accent' },
		definition:
			'Mean of the per-channel DR values, rounded once. Per channel: 2nd-highest block peak over the quadratic mean of that channel’s loudest 20 % of 3 s blocks.'
	},
	{
		metric: 'Integrated loudness',
		standard: 'ITU-R BS.1770-4 / EBU R128',
		tag: { text: 'ITU', kind: 'neutral' },
		definition:
			'K-weighting via hardcoded biquads, absolute gate −70 LUFS, relative gate −10 LU below the ungated mean.'
	},
	{
		metric: 'True peak',
		standard: 'ITU-R BS.1770-4',
		definition:
			'4× polyphase FIR, 12 taps per phase, per channel; the joint figure takes the **scored** channels, matching the joint sample peak. Clamped to ≥ the sample peak, which the standard requires by definition.'
	},
	{
		metric: 'Max M / Max S',
		standard: 'EBU Tech 3341',
		definition:
			'400 ms momentary at 75 % overlap; 3 s short-term at 67 % overlap, on one shared 0.1 s hop grid.'
	},
	{
		metric: 'LRA',
		standard: 'EBU Tech 3342',
		definition: 'Relative gate at −20 LU. Passes all six official compliance vectors within ±1 LU.'
	},
	{
		metric: 'PLR',
		standard: 'Loudness-ratio convention',
		tag: { text: 'AES', kind: 'neutral' },
		definition:
			'`min(max true peak, 0) − LUFSi`, clamped to match reference behaviour on over-full-scale material.'
	},
	{
		metric: 'Min PSR',
		standard: 'AES eBrief 373',
		definition:
			'3 s window sample peak minus its BS.1770-4 short-term loudness, minimum over the track, −50 LUFS floor.'
	},
	{ metric: 'Crest factor', standard: '—', definition: 'Peak over RMS, per channel and joint.' }
];

/** The five DR bands, as the README's interpretation table gives them. */
export const bands = [
	{
		range: '> 20',
		name: 'Exceptional',
		note: 'Classical, jazz, vinyl-era. Full dynamic expression.'
	},
	{
		range: '14–20',
		name: 'Excellent',
		note: 'Well-mastered releases and high-quality remasters.'
	},
	{ range: '8–13', name: 'Normal', note: 'Typical commercial release. Adequate for most genres.' },
	{
		range: '5–7',
		name: 'Compressed',
		note: 'Heavily limited. Loudness-war casualty. Listening fatigue likely.',
		tone: 'warn'
	},
	{
		range: '< 5',
		name: 'Brickwalled',
		note: 'Severely clipped. Near-constant loudness, no dynamics. Distorted.',
		tone: 'bad'
	}
];

/** The build matrix. Binary names and targets are the Makefile's own. */
export const builds = [
	{
		target: 'make',
		binary: 'crete',
		adds: 'Core analysis, text output formats. No dependencies.'
	},
	{ target: 'make cli-json', binary: 'crete', adds: '`-f json`; header auto-fetched once.' },
	{
		target: 'make cli-json-ffmpeg',
		binary: 'crete-ffmpeg',
		adds: 'ALAC, MP3, AAC, Opus, TrueHD, DTS-HD MA, AC-3, DVD title sets, and the codec profile.'
	},
	{ target: 'make gui', binary: 'crete-gui', adds: 'SDL2 + Dear ImGui drag-and-drop app.' },
	{ target: 'make gui-ffmpeg', binary: 'crete-gui-ffmpeg', adds: 'Both of the above.' }
];

/** What crête does not do, stated before you find out. */
export const limits = [
	{
		head: '44.1 kHz is the parity-guaranteed DSD rate.',
		body: '88.2 / 176.4 / 352.8 kHz output is offered for analysis, not parity — retained ultrasonic noise-shaping inflates DR by +1…+3 there. At the default rate the per-track DR comparison flags nothing on any of the 8 DSD albums and album DR matches on 7 of 8; the exception misses a `.5` boundary by 0.020 dB and is an accuracy question, not a rate one.'
	},
	{
		head: 'Min PSR disagrees with the reference by design.',
		body: 'MAAT uses a 0.5 dB/s decaying peak-hold; crête implements the published AES eBrief 373 formula. Average delta 0.598 dB over 411 comparisons — the worst metric in the suite.'
	},
	{
		head: 'MQA is detected, never decoded.',
		body: 'No open decoder exists, so DR is measured on the delivered base-band PCM and content encoded above it is not reconstructed.'
	},
	{
		head: 'Atmos and DTS:X are measured as their channel bed.',
		body: 'There is no renderer in the chain. Object metadata is discarded, and since 0.15.0 the output names the profile and marks the layout as a bed. Auro-3D cannot be identified this way and is not attempted.'
	},
	{
		head: 'Disc audio and SACD have no external oracle.',
		body: 'TrueHD / DTS-HD MA / AC-3 are gated against crête’s own recorded values and against the LPCM carrier of the same master — nothing outside crête, and DST sits in the same position. The SACD comparison that would settle it, crête on the ISO against crête on the `.dsf` extracted from the same disc, is written but is not running in CI.'
	},
	{
		head: 'A DVD-Audio title set measures as its first mix.',
		body: 'One title set can carry a 5.1 mix, a stereo mix and more, with boundaries that ignore the file fragments. crête measures the first group, warns and exits 2 rather than metering through the change. The disc’s track tables are read exactly, but there is no per-track DVD-Audio measurement yet.'
	},
	{
		head: 'DST decoding runs at about 2× realtime.',
		body: 'Six channels through one arithmetic decoder, which cannot be parallelised inside a frame — a 43-minute 5.1 disc takes roughly 20 minutes. Frames are independent, so this is fixable and not yet fixed.'
	},
	{
		head: 'Altered samples in WAV and AIFF cannot be caught.',
		body: 'Neither container carries a checksum, so a changed sample value is undetectable by crête or any other meter — only declared length and the 0 dBFS range check apply. FLAC proves itself through frame CRC-8 and CRC-16. The test suite asserts the blind spot rather than assuming it away.'
	},
	{
		head: 'The 0.16.1 GUI bands have not been looked at.',
		body: 'The SACD, cue and stream-picker bands are verified by construction and headlessly, never visually. Narrow window widths are the case to check.'
	},
	{
		head: 'Memory-aware scheduling has only run on macOS.',
		body: 'Since 0.19.0 the default worker count is fitted to free memory and any container limit. The Linux and Windows detection paths are written from the documented interfaces and have never been run; the next weekly is their first test. No measurement depends on them.'
	},
	{
		head: 'The >4 GB path is exercised; a >4 GB allocation is not.',
		body: 'RF64 / BW64 / Wave64 64-bit sizes are honoured and verified, but crête loads a whole file before decoding and no test host is large enough yet.'
	}
];

/** Reach: what crête reads, on how many channels, and where it runs — the axes
    on which it is not a like-for-like alternative to the tools it is gated
    against. Every figure is a suite result from the harness; `state` is
    the only editorial field, and 'planned' means not built, not "soon".

    The claim about the reference exports is crête's own corpus experience and
    is stated as such: the MAAT rows crête holds carry at most two channels,
    which is why SURROUND and DTSX are gated on stems. It is not a statement
    about what that product can be made to do. */
export const reach = [
	{
		head: 'Nine native formats, and the container cannot change the number',
		state: 'gated',
		body: 'WAV, RF64/BW64, Wave64, AIFF, AIFF-C `sowt`, FLAC, DSF, DFF and SACD `.iso` — DST-compressed areas included — all decoded by crête’s own code in every build, with no libFLAC and no libsndfile. The FORMAT suite transcodes six albums every way and requires **Δ 0.000** across all of them; CUE slicing is held to the same figure against the equivalent per-track album.'
	},
	{
		head: 'Mono through 7.1, measured per channel',
		state: 'gated',
		body: 'Per-channel DR, peak, true peak, RMS and loudness with BS.1770-4 weighting, the LFE measured in full but not scored, and the multichannel rule **stated as a chosen rule** rather than implied. SURROUND runs 1620 comparisons, QUADIO 240 with zero flags, DTSX 350. The MAAT reference rows crête holds carry at most two channels, which is why those suites are gated against stems — there is no external oracle for a 5.1 figure.'
	},
	{
		head: 'Two architectures, compared to each other every week',
		state: 'gated',
		body: 'Both Linux agents build natively and their JSON is compared field by field: **273 fields at 0.000e+00** on the lossless carriers. It needs `-ffp-contract=off` — without it the compiler fuses multiply-add on the architecture that has an FMA instruction and not on the one that does not, and the K-weighting biquads diverge at ULP level. macOS is one ULP away on `log10`, and the site says so rather than claiming three platforms agree.'
	},
	{
		head: 'RISC-V as the third gated architecture',
		state: 'planned',
		body: 'Not built, not scheduled, and no number behind it yet. It is worth doing for the same reason aarch64 was: bit-identity is only a claim until a machine that rounds differently has to agree, and a third instruction set is the cheapest remaining test of it. It joins the weekly cross-architecture gate or it does not count.'
	},
	{
		head: 'One binary, and nothing to install',
		state: 'shipped',
		body: 'The default build is a single C++17 translation unit with no external libraries and no build step beyond `make`; `STATIC=1` links it fully. MIT plus BSD-2-Clause for the DSD engine, so the whole measurement path can be read, audited and rebuilt — which is the one thing a closed reference cannot offer, however good its numbers are.'
	},
	{
		head: 'A damaged file is named, not silently scored',
		state: 'shipped',
		body: 'Since 0.17.0 crête verifies FLAC frame CRC-8 and CRC-16, checks every declared length against what actually decoded, and rejects a sample peak above 0 dBFS on integer PCM as arithmetically impossible. The file is still measured — crête is a meter, not a repair tool — but every affected number is flagged, listed in JSON under a `warnings` array that is always present, and reflected in **exit code 2**. Before this, a FLAC with one bad sector took an album from DR13 to DR9 at a sample peak of +48.16 dBFS and exited 0.'
	},
	{
		head: 'Disc audio measured as authored',
		state: 'shipped',
		body: 'AC-3 and E-AC-3 carry Dolby DRC metadata and most decoders apply it by default — right for a player, wrong for a meter. crête pins `drc_scale=0`. Leaving it on moved peak by **6.2 dB** on one JOC 5.1 bed. Atmos and DTS:X are decoded as their channel bed and the output says so, because there is no renderer in the chain and a bed measurement is not an Atmos measurement.'
	}
];

/** The three things a meter gets wrong that crête is built to catch. */
export const premises = [
	{
		head: 'Lossy audio sold as hi-res',
		body: 'crête detects MQA and reports it **unconditionally** — there is no flag to enable it and none to suppress it. If you are measuring dynamic range, you are entitled to know the source is not lossless.'
	},
	{
		head: 'Playback-time compressors in the signal path',
		body: 'AC-3 and E-AC-3 carry Dolby DRC metadata and most decoders apply it by default. That is right for a player and wrong for a meter. crête pins `drc_scale=0`; leaving it on moved peak by **6.2 dB** on one measured 5.1 bed.'
	},
	{
		head: 'Numbers with no oracle behind them',
		body: 'The reference tool, MAAT DROffline, is closed — you cannot audit it. So crête never trusts one oracle: a second independent implementation, analytic synthetics, and crête-vs-crête control suites all have to agree before a number is believed.'
	}
];

/** The GUI captures, from the 0.14.0 build.
    Cropped to the window, 1600px wide, WebP — the source PNGs are ~6× the size
    for no visible gain on a figure this small. `width`/`height` are the real
    pixel dimensions so the browser reserves the box before the image lands. */
export const shots = [
	{
		id: 'gui-results',
		src: '/screenshots/gui-results.webp',
		width: 1600,
		height: 1118,
		alt: 'The crête GUI in its dark shell, showing a quad album\u2019s results table \u2014 a DR meter bar and the peak, RMS, LUFS, PLR and duration columns for each track.',
		placeholder: '0.14.0 GUI \u2014 results table',
		caption: 'Results table with DR meter bars.'
	},
	{
		id: 'gui-channels',
		src: '/screenshots/gui-channels.webp',
		width: 1600,
		height: 1118,
		alt: 'The per-channel panel on a 5.1 master: a meter bar per channel, the lowest scored channel (C) drawn in the accent, and the LFE greyed as unscored under an \u201cLFE excluded\u201d marker.',
		placeholder: '0.14.0 GUI \u2014 channel matrix',
		caption: 'Per-channel matrix on a 5.1 master.'
	},
	{
		id: 'gui-settings',
		src: '/screenshots/gui-settings.webp',
		width: 1600,
		height: 1118,
		alt: 'The side panel open on Settings: the dark-shell toggle, the \u201cscore the LFE in DR\u201d switch noting that the LFE is measured but not scored by default, the opt-in analysis log, and below them the About text and the measurement-standards list.',
		placeholder: '0.14.0 GUI \u2014 settings & about',
		caption: 'Settings, About and the measurement standards.'
	},
	{
		id: 'gui-dsd',
		// Cropped to the strip rather than the whole window: at figure size the
		// strip is the subject, and the rest of that screen is an empty drop target.
		// Its band shape is why it spans the figure grid instead of sharing a cell.
		wide: true,
		src: '/screenshots/gui-dsd.webp',
		width: 1600,
		height: 598,
		alt: 'The DSD strip, shown only for DSD sources: chain (multistage or direct), filter (default, firls or kaiser) and output rate (44.1 to 352.8 kHz), with the shipping defaults \u2014 multistage, default, 44.1 kHz \u2014 selected. Below it, the empty drop target listing the accepted formats.',
		placeholder: '0.14.0 GUI \u2014 DSD strip',
		caption: 'DSD strip: chain, filter, output rate.'
	}
];

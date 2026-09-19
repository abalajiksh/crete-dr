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
			'4× polyphase FIR, 12 taps per phase, per channel; clamped to ≥ the sample peak, which the standard requires by definition.'
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
		adds: 'ALAC, MP3, AAC, Opus, TrueHD, DTS-HD MA, AC-3.'
	},
	{ target: 'make gui', binary: 'crete-gui', adds: 'SDL2 + Dear ImGui drag-and-drop app.' },
	{ target: 'make gui-ffmpeg', binary: 'crete-gui-ffmpeg', adds: 'Both of the above.' }
];

/** What crête does not do, stated before you find out. */
export const limits = [
	{
		head: '44.1 kHz is the parity-guaranteed DSD rate.',
		body: '88.2 / 176.4 / 352.8 kHz output is offered for analysis, not parity — retained ultrasonic noise-shaping inflates DR by +1…+3 there.'
	},
	{
		head: 'Min PSR disagrees with the reference by design.',
		body: 'MAAT uses a 0.5 dB/s decaying peak-hold; crête implements the published AES eBrief 373 formula. Average delta 0.611 dB — the worst metric in the suite.'
	},
	{
		head: 'MQA is detected, never decoded.',
		body: 'No open decoder exists, so DR is measured on the delivered base-band PCM and content encoded above it is not reconstructed.'
	},
	{
		head: 'Atmos and DTS:X are measured as their channel bed.',
		body: 'There is no renderer in the chain. Object metadata is discarded, and crête says which bed it measured.'
	},
	{
		head: 'Disc-audio formats have no external oracle.',
		body: 'TrueHD / DTS-HD MA / AC-3 are gated against crête’s own recorded values and against the LPCM carrier of the same master — nothing outside crête.'
	},
	{
		head: 'The >4 GB path is exercised; a >4 GB allocation is not.',
		body: 'RF64 / BW64 / Wave64 64-bit sizes are honoured and verified, but crête loads a whole file before decoding and no test host is large enough yet.'
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

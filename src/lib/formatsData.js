// Content for the Formats page. The decoder tables, the DSD axes and the
// platform matrix all mirror the Crete README's own sections — the flag names
// and binary names are the ones main.cpp and the Makefile actually define.

/** Decoders in every build, with no dependencies. */
export const native = [
	{
		name: 'WAV',
		ext: ['.wav'],
		note: 'PCM 8/16/24/32-bit, IEEE float 32/64-bit, `WAVE_FORMAT_EXTENSIBLE`.'
	},
	{
		name: 'RF64 / BW64',
		ext: ['.wav', '.rf64', '.bw64'],
		note: '64-bit sizes via the `ds64` chunk — the escape hatch past 4 GB (EBU Tech 3306 / ITU-R BS.2088). Same payload decoder as WAV.'
	},
	{ name: 'Wave64', ext: ['.w64'], note: 'GUID chunk ids and 64-bit sizes. Same payload decoder again.' },
	{
		name: 'AIFF / AIFF-C',
		ext: ['.aif', '.aiff'],
		note: 'Big-endian standard; AIFF-C uncompressed `NONE` and `sowt` little-endian. There are no float variants because AIFF proper is integer-only.'
	},
	{ name: 'FLAC', ext: ['.flac'], note: 'Built-in decoder, no libFLAC dependency.' },
	{
		name: 'DSD — DSF',
		ext: ['.dsf'],
		note: 'Sony format, LSB-first. Decimated to PCM by the vendored kernel.'
	},
	{
		name: 'DSD — DFF',
		ext: ['.dff'],
		note: 'Philips DSDIFF, MSB-first. Same decode engine; gated against DSF sample-for-sample.'
	},
	{
		name: 'SACD disc image',
		ext: ['.iso'],
		note: 'Scarlet Book. Both areas read from the disc TOC, DSD and DST — and dispatched by content, not by extension.'
	},
	{ name: 'Cue sheet', ext: ['.cue'], note: 'Splits a monolithic file into per-track results.' }
];

/** What each container lets crête verify about itself, and what it does not.
    The three checks are the ones 0.17.0 added; the row order is the README's. */
export const integrityChecks = [
	{
		check: 'Frame CRC-8 + CRC-16',
		formats: 'FLAC',
		catches:
			'An altered sample value — the bit-flip nothing else can see. The only detector a format hands over for free.'
	},
	{
		check: 'Declared vs decoded length',
		formats: 'FLAC `STREAMINFO`, WAV / RF64 / Wave64 `data`, AIFF `COMM`/`SSND`',
		catches:
			'Truncation, an interrupted copy, frames lost to a resync. `STREAMINFO`’s sample count was already read as an allocation hint and never compared with the decode.'
	},
	{
		check: 'Sample peak ≤ 0 dBFS',
		formats: 'Any integer PCM',
		catches:
			'A decode that produced values the format cannot represent. Deliberately not applied to float PCM, decimated DSD or FFmpeg’s float decoders, all of which can legitimately exceed full scale.'
	}
];

/** The SACD area selector. Not a DSD axis — it picks which recording to decode. */
export const sacdArea = {
	flag: '--sacd-area auto | stereo | multichannel',
	text: '`auto` (default) prefers the 2-channel area: it is the layer crête’s DR references are built on, the layer comparable with every other release of an album, and usually the uncompressed one. A disc with no multichannel area refuses `multichannel` by name rather than quietly falling back.'
};

/** The opt-in FFmpeg tier: only what crête does not own. */
export const ffmpeg = [
	{
		name: 'ALAC',
		ext: ['.m4a'],
		note: 'Lossless — metrics agree with the FLAC equivalent to float noise.'
	},
	{
		name: 'MP3 / AAC / Opus',
		ext: ['.mp3', '.m4a', '.opus'],
		note: 'Lossy. Measured values reflect the decoded lossy signal.'
	},
	{
		name: 'TrueHD / MLP',
		ext: ['.mkv', '.thd'],
		note: 'Lossless disc audio up to 7.1. Channel bed only — an Atmos carrier reports `Dolby TrueHD + Dolby Atmos` and marks the layout as a bed.'
	},
	{
		name: 'DTS / DTS-HD MA',
		ext: ['.mkv', '.dts'],
		note: 'Core plus the lossless MA extension. The profile is reported without a bed qualifier — there is nothing unrendered about plain DTS-HD MA.'
	},
	{
		name: 'E-AC-3 / AC-3',
		ext: ['.mkv', '.eac3', '.ac3'],
		note: 'Lossy disc audio. Channel bed only; the E-AC-3 5.1 core is what a JOC Atmos stream decodes to.'
	}
];

/** The three DSD axes. Defaults are the parity-guaranteed path. */
export const dsdAxes = [
	{
		flag: '--dsd-mode multistage | direct',
		text: '`multistage` (default) is the measurement-grade path: LUT decimation to 8fs then a halving cascade, brickwalled at Nyquist at 44.1 kHz out, valid for DSD64 through 512 at every rate. `direct` is a single wide FIR with a gentle ~30 kHz corner that passes an attenuated top octave — DSD64 to 44.1 kHz only.'
	},
	{
		flag: '--dsd-out-rate 44100 | 88200 | 176400 | 352800',
		text: '44100 is the default and the parity-guaranteed rate.'
	},
	{
		flag: '--dsd-filter default | firls | kaiser',
		text: 'The ranked final stage, honoured only at 44.1 kHz output: equiripple at 383 taps and roughly 154 dB stopband (the golden default), least-squares at 767 taps as a cross-method check, or a Kaiser window at 4095 taps as the maximum decode.'
	}
];

/** Build targets, as the Makefile defines them. */
export const buildCmds = [
	{ cmd: 'make setup-deps-check', note: 'report what is missing' },
	{ cmd: 'make setup-deps', note: 'install it' },
	{ cmd: 'make', note: 'zero-dep CLI' },
	{ cmd: 'make cli-json', note: '+ JSON output' },
	{ cmd: 'make cli-json-ffmpeg', note: '+ FFmpeg tier' },
	{ cmd: 'make setup-imgui && make gui', note: null },
	{ cmd: 'make gui-ffmpeg', note: null },
	{ cmd: 'make dsd2wav', note: 'DSD → WAV exporter' },
	{ cmd: 'make debug', note: 'asan + ubsan' },
	{ cmd: 'make STATIC=1', note: 'fully static link' }
];

/** Where crête builds, and how far each target is proven. */
export const platforms = [
	{
		target: 'Linux x86-64',
		state: 'built & gated',
		tone: 'good',
		note: 'CI agent. `STATIC=1` produces a genuinely static binary.'
	},
	{
		target: 'Linux aarch64',
		state: 'built & gated',
		tone: 'good',
		note: 'Second CI agent; bit-identical to x86-64 on the gated fields.'
	},
	{
		target: 'macOS',
		state: 'builds',
		note: 'Development host. One ULP apart from Linux on `log10`, so its JSON is not equality-comparable.'
	},
	{
		target: 'Windows x86-64',
		state: 'cross-builds clean',
		note: 'Zero source changes, zero warnings. `STATIC=1` is not optional — without it the executable needs three runtime DLLs and the single-binary promise breaks.'
	},
	{
		target: 'Windows on ARM',
		state: 'not buildable yet',
		tone: 'bad',
		note: 'Needs a second toolchain; the current one targets x86 only.'
	},
	{
		target: 'Windows GUI',
		state: 'untested',
		tone: 'bad',
		note: 'Needs a Windows SDL2 the current toolchain does not provide. The CLI tiers are what the harness and most users need, and they are proven.'
	}
];

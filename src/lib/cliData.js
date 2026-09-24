// The CLI surface, taken from the Crete repository's own argument parser
// (`main.cpp`) and its `--help`, not from any draft copy. Every default here is
// the value the parser initialises, and every accepted spelling is one the
// parser actually matches — `-f maat` is real and undocumented in `--help`.
//
// The `effect` field is the point of the table. A meter's flags divide into
// three kinds and conflating them is how an unreproducible measurement gets
// recorded:
//
//   'numbers'   — the reported figures change. JSON records these.
//   'selection' — the figures are unchanged for a given input, but the flag
//                 changes which audio is the input in the first place.
//   'none'      — presentation, destination or wall-clock time only.

/** @typedef {'numbers' | 'selection' | 'none'} Effect */

/** @type {Record<Effect, { label: string, hint: string }>} */
export const EFFECT = {
	numbers: { label: 'moves numbers', hint: 'Changes the reported figures. Recorded in JSON.' },
	selection: { label: 'selects input', hint: 'Changes which audio is measured, not how.' },
	none: { label: 'no effect on values', hint: 'Presentation, destination or speed only.' }
};

/**
 * @typedef {{
 *   flag: string,
 *   values: string | null,
 *   fallback: string,
 *   effect: Effect,
 *   note: string
 * }} Flag
 * @typedef {{ id: string, title: string, intro: string, flags: Flag[] }} FlagGroup
 */

/** @type {FlagGroup[]} */
export const flagGroups = [
	{
		id: 'measurement',
		title: 'Measurement axes',
		intro:
			'The only three flags that change a DR figure on a PCM source. All three are written into every JSON result, because a measurement you cannot attribute to an algorithm is not a measurement. Two of them exist for A/B comparison and should not produce a number you then publish.',
		flags: [
			{
				flag: '--dr-blocks',
				values: 'reference | legacy',
				fallback: 'reference',
				effect: 'numbers',
				note: '*Which* 3 s blocks are ranked. `reference` is the PMF reference implementation — the trailing partial block is kept and normalised by its own length, and there is no gate. `legacy` is what crête shipped up to 0.13.1: trailing block discarded, blocks gated at `joint_rms > 1e-3`. It biases DR low. **A/B only.**'
			},
			{
				flag: '--dr-mean',
				values: 'quadratic | arithmetic',
				fallback: 'quadratic',
				effect: 'numbers',
				note: 'How the loudest 20 % of blocks are averaged. `quadratic` averages **power** — the PMF procedure, and what MAAT and foobar2000 both do. `arithmetic` averages **amplitude**, which is what crête shipped up to 0.12.1; it biases DR high. Applies to every format, not just DSD. **A/B only.**'
			},
			{
				flag: '--dr-lfe',
				values: 'exclude | include',
				fallback: 'exclude',
				effect: 'numbers',
				note: 'Whether the LFE is scored. Affects **TT DR only** — the DR mean, the joint sample and true peaks behind it, the block gate and `worst_channel`. Integrated loudness, Max M/S, LRA and Min PSR never move, because BS.1770-4 weights the LFE at zero. A no-op on mono and stereo, so no stereo measurement can change. `include` matches foobar2000’s DR Meter.'
			}
		]
	},
	{
		id: 'dsd',
		title: 'DSD decode',
		intro:
			'DSD has no PCM samples to measure, so a decimation chain has to be chosen before there is anything to meter — and the choice moves the number. The defaults are the parity-guaranteed path; the others are offered for analysis. None of them touch a PCM format.',
		flags: [
			{
				flag: '--dsd-mode',
				values: 'direct | multistage',
				fallback: 'multistage',
				effect: 'numbers',
				note: '`multistage` is the measurement-grade chain, brickwalled at Nyquist, valid for DSD64 through DSD512 at every output rate. `direct` is a single wide FIR with a gentle ~30 kHz corner and is **DSD64 → 44 100 only**, a `libdsddpcm` restriction rather than a crête one.'
			},
			{
				flag: '--dsd-out-rate',
				values: '44100 | 88200 | 176400 | 352800',
				fallback: '44100',
				effect: 'numbers',
				note: '44 100 is the rate every DSD parity claim on this site is made at. The higher rates retain ultrasonic noise-shaping that inflates DR by **+1…+3**, which is a property of the format, not a defect in the decode — they are for analysis, not for comparison against a reference.'
			},
			{
				flag: '--dsd-filter',
				values: 'default | firls | kaiser',
				fallback: 'default',
				effect: 'numbers',
				note: 'The ranked final stage. **Honoured only at** `--dsd-out-rate 44100`, and silently ignored otherwise, since no other rate reaches that stage. `default` is equiripple at 383 taps; `firls` is a least-squares cross-check at 767; `kaiser` is the 4 095-tap maximum decode.'
			}
		]
	},
	{
		id: 'input',
		title: 'Choosing what gets measured',
		intro:
			'Neither of these changes how crête measures. Both change which audio arrives at the meter — and on a disc source that difference is far larger than any algorithmic axis above, because the alternatives are different mixes rather than different renderings of one mix.',
		flags: [
			{
				flag: '--sacd-area',
				values: 'auto | stereo | multichannel',
				fallback: 'auto',
				effect: 'selection',
				note: 'Which area of an SACD `.iso` to read. `auto` prefers the 2-channel area deliberately: it is the layer crête’s DR references are built on, the layer comparable with every other release of an album, and usually the uncompressed one. A bad value fails on the main thread before any decoding starts.'
			},
			{
				flag: '--stream',
				values: 'N',
				fallback: 'FFmpeg’s own pick',
				effect: 'selection',
				note: 'The audio stream to decode in a multi-stream container, indexed as `ffprobe -show_streams` prints it. With no `--stream`, FFmpeg ranks by bitrate and channel count — a reasonable default, but not the container’s `default` flag and **not stable across remuxes of the same content**. Whenever a file holds more than one audio stream crête says which one it measured, and records `stream_index` and `audio_stream_count` in JSON. On a DVD the index is taken over the whole title set, since it is not stable from one `.vob` fragment to the next; the compact FFmpeg also lists one phantom stream per `.vob`, which automatic selection passes over because it ranks by bitrate and the phantom has none.'
			}
		]
	},
	{
		id: 'output',
		title: 'Output',
		intro:
			'Presentation and destination. Nothing here can change a figure — the same analysis is formatted five ways.',
		flags: [
			{
				flag: '-f, --format',
				values: 'std | foobar | ext | detail | json',
				fallback: 'std',
				effect: 'none',
				note: '`maat` is accepted as a synonym for `ext`. `json` needs a build that has it — `make cli-json` or `make cli-json-ffmpeg` — and a zero-dependency binary refuses the flag with that hint rather than falling back to text.'
			},
			{
				flag: '-o, --output',
				values: 'file',
				fallback: 'stdout',
				effect: 'none',
				note: 'Redirects **stdout only**. Progress, per-file decode errors and the multi-stream warning are written to stderr and still reach the terminal, which is what makes `-o` safe to point at a JSON file.'
			},
			{
				flag: '-q, --quiet',
				values: null,
				fallback: 'progress shown',
				effect: 'none',
				note: 'Suppresses the progress line. Errors and warnings are not suppressed — a quiet run still tells you what it could not read.'
			}
		]
	},
	{
		id: 'run',
		title: 'Run control',
		intro: 'Wall-clock time and information. Verified never to change a number.',
		flags: [
			{
				flag: '-j, --jobs',
				values: 'N',
				fallback: 'fitted to memory and cores',
				effect: 'none',
				note: 'Pins the worker count. Results are order-preserving and bit-identical to a sequential run, so `-j` buys time and nothing else; `-j 1` forces strictly sequential. An explicit `N` is **obeyed exactly** — crête warns if it does not expect `N` to fit in memory and proceeds, because silently overriding the flag would make a run unreproducible. Workers are per **unit of work**, and the pool is the lower of `N` and the number of units — see below.'
			},
			{
				flag: '--memory-limit',
				values: 'SIZE | N%',
				fallback: 'detected',
				effect: 'none',
				note: 'The memory crête may plan for when it sizes the worker pool — a size such as `8G` or `512M`, or a share of this machine’s RAM such as `40%`. The detected default is the host’s free memory, honouring a **container / cgroup limit** where one is in force rather than the physical machine underneath. Added in 0.19.0; affects scheduling only, and the JSON tracks array is byte-identical across limits.'
			},
			{
				flag: '-v, --version',
				values: null,
				fallback: '—',
				effect: 'none',
				note: 'Prints the build’s tiers, the DSD engine and licence, the three DR axes as resolved, the full decimation chain — taps and group delay — for DSD64 through 512 at the current settings, and since 0.19.0 a `Host:` line with the CPUs and memory the machine reported. A version string alone would not say which algorithm produced a number.'
			},
			{
				flag: '-h, --help',
				values: null,
				fallback: '—',
				effect: 'none',
				note: 'The flag list, plus the native formats, the SACD rule and the cue rule as that binary implements them.'
			}
		]
	}
];

/** `--dr-lfe` on the one album where both sides are recorded. From the README's
    own table: DSOTM 5.1 96 kHz. */
export const lfeTable = {
	caption: 'DSOTM 5.1 96 kHz — the same file, both scoring rules',
	rows: [
		{ mode: '--dr-lfe exclude', tag: 'default', raw: '11.9772', scored: '5', lowest: 'Ls' },
		{ mode: '--dr-lfe include', tag: 'foobar2000', raw: '11.8606', scored: '6', lowest: 'LFE' }
	]
};

/** The five output formats, as the README documents them. */
export const formats = [
	{
		flag: 'std',
		name: 'Standard',
		note: 'The default. Compatible with the dr.loudness-war.info submission format: DR, peak, RMS and filename per track, then the file count and the official album DR.'
	},
	{
		flag: 'foobar',
		name: 'foobar2000 style',
		note: 'The DR Meter layout, with duration and a per-album technical info block.'
	},
	{
		flag: 'ext',
		name: 'Extended',
		note: 'MAAT DROffline MkII–style pipe-delimited table, **26 columns**: per-channel sample and true peaks, RMS, max momentary and short-term LUFS, LUFSi, DR (PMF), DR LEFT, DR RIGHT, PLR, LRA, Min PSR and more. This is the parity-testing format.'
	},
	{
		flag: 'detail',
		name: 'Detail',
		note: 'Per-track, per-channel vertical table — the readable one for a single-track investigation. Each joint value carries its governing-standard tag, `(ITU)` / `(EBU)` / `(AES)` / `(PMF)`, with a legend in the footer; per-channel momentary and short-term columns are marked informative `(non-ITU)` variants.'
	},
	{
		flag: 'json',
		name: 'JSON',
		note: 'Every metric for every track, the full `channel_metrics` array, the `standards` map, the always-present `warnings` array, and the axes the result was produced under. Needs a `cli-json` build. This is what the pytest harness reads — it never scrapes text.'
	}
];

/** What a measurement records about itself, so a JSON row is reproducible from
    its own contents. Keys as the writer emits them. */
export const provenance = [
	{ key: 'dr_blocks', when: 'every result', what: 'The 3 s block set.' },
	{ key: 'dr_rms_mean', when: 'every result', what: 'The top-20 % averaging mode.' },
	{
		key: 'dr_lfe · scored_channels',
		when: 'every result',
		what: 'The LFE scoring rule, and how many channels it left scored.'
	},
	{ key: 'standards', when: 'top level', what: 'Which specification governs each reported field.' },
	{
		key: 'warnings',
		when: 'every result',
		what: 'Failed decodes, CRC mismatches, truncation and the multi-stream choice. Always present, so an empty array is the positive statement that nothing was wrong.'
	},
	{
		key: 'dsd_mode · dsd_filter · dsd_out_rate',
		when: 'DSD sources',
		what: 'The full decode configuration. An unlabelled DSD result is not interpretable.'
	},
	{
		key: 'stream_index · audio_stream_count',
		when: 'multi-stream containers',
		what: 'Which of the mixes on the disc these numbers describe.'
	}
];

/** Exit status, and the reasoning behind the one case that is easy to get
    wrong. Taken from the parser and the CI incident recorded in the source. */
export const exits = [
	{
		code: '0',
		when: 'Every input decoded cleanly.',
		note: 'Not “something was measured”. Since 0.17.0 a clean exit is a statement about the whole run, which is what makes it worth testing — a partial success no longer hides inside it.'
	},
	{
		code: '1',
		when: 'Nothing could be analysed, or a flag was rejected.',
		note: 'A meter that measured nothing has not succeeded — and with `-f json` it emits no JSON at all, so a caller trusting the exit code would parse an empty string. That is exactly how a stale FFmpeg build with no TrueHD or DTS decoder surfaced in CI: as a `JSONDecodeError` instead of crête’s own error line.'
	},
	{
		code: '2',
		when: 'Completed, but some input failed to decode or was damaged.',
		note: 'The run produced numbers and they are **unreliable** — including any album value computed from them, because a damaged track is averaged into it. Added in 0.17.0, alongside the `warnings` array: crête still measures a damaged file, because it is a meter and not a repair tool, but it will not let the result pass for a clean one. `num_tracks` counts what was *measured*, so a file that failed to decode contributes a warning and no track. Since 0.18.0 a DVD-Audio title set whose audio format changes partway through exits 2 as well: crête measures the first group and says so rather than metering through the change. Since 0.19.1 so does a cue track whose range is empty: it is dropped with a named warning, because an album missing a track is not a complete measurement.'
	}
];

/** Worked invocations. Comments are rendered dim by the terminal block, so the
    text after a `#` is styled, not parsed — keep them on their own trailing
    segment of the line. */
export const recipes = [
	{
		title: 'A normal run',
		lines: [
			['crete /path/to/album/', 'defaults: reference, quadratic, LFE excluded'],
			['crete -f detail track.flac', 'per-channel, with the standard tags'],
			['crete -q -f json -o album.json /path/to/album/', 'CI shape: results to the file, errors to stderr'],
			['crete --memory-limit 40% /path/to/album/', 'on a shared machine: plan for a share of it']
		]
	},
	{
		title: 'Disc sources',
		lines: [
			['crete album.iso', 'SACD: auto prefers the 2-channel area'],
			['crete --sacd-area multichannel album.iso', 'the 5.1 area, DST or not'],
			['crete-ffmpeg --stream 2 album.mkv', 'pin the mix; ffprobe indices']
		]
	},
	{
		title: 'DSD',
		lines: [
			['crete /path/to/dsd/', 'multistage → 44.1 kHz, the parity path'],
			['crete --dsd-out-rate 352800 /path/to/dsd/', 'analysis rate; workers fitted to memory'],
			['crete --version', 'taps and group delay for every chain']
		]
	},
	{
		title: 'Comparing against another meter',
		lines: [
			['crete --dr-lfe include /path/to/5.1/', 'match foobar2000’s multichannel rule'],
			['crete --dr-blocks legacy /path/to/album/', 'reproduce a pre-0.14.0 recorded value'],
			['crete --dr-mean arithmetic /path/to/album/', 'reproduce a pre-0.12.1 recorded value']
		]
	}
];

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
// 0.14.1 has no entry of its own: it was bumped, then folded into 0.15.0 before
// it was tagged, so the release that shipped its two changes is 0.15.0.

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
		version: '0.19.2',
		date: '2026-09-24',
		impact: ['identical', 'additive'],
		title: 'Linux packages, from the openSUSE Build Service',
		body: [
			'crête is now packaged for **openSUSE, Fedora, Debian, Ubuntu and Arch**, published from the OBS project `home:abksh:crete`. Two packages: `crete` is `make cli-ffmpeg` installed as `/usr/bin/crete` — the native decoders plus the compact FFmpeg set, and no `-f json` — and `crete-gui` is `make gui-ffmpeg` as `/usr/bin/crete-gui`, with a desktop entry and its fonts. The first round built green on all 15 targets.',
			'**Built with crête’s flags, not the distribution’s.** Every recipe removes distro `CFLAGS` and `LDFLAGS` from the environment and turns off LTO and debug builds, because injected optimisation flags would give each distribution a different binary and void the cross-architecture bit-identity `-ffp-contract=off` exists for. That holds by construction; the only check inside the package build is that the binary runs and reports the version it was packaged as. OBS builds offline, so the source tarball carries the pinned ImGui subset and the whole FFmpeg n7.1 tree, and `scripts/make_obs_source.sh` produces it deterministically — the same ref gives the same sha256.',
			'Three fixes at the source rather than in the packaging. The GUI looked for its fonts only beside the binary, which for an installed `/usr/bin/crete-gui` is `/usr/bin/fonts/`, and fell back to ImGui’s bitmap font **silently**; `CRETE_DATADIR` adds an install data directory searched after the binary’s own, so dev and portable trees behave as before. The compact-FFmpeg script cloned FFmpeg unless the source had a `.git`, so a tarball tree could not build without network; it now tests for `configure`, and because that edits the script, every cached compact FFmpeg rebuilds once. And the FFmpeg lookup used `PKG_CONFIG_PATH`, which only *prepends* to pkg-config’s search: with no compact prefix built yet it found the **host’s** FFmpeg — Homebrew’s 9.0.1, an `--enable-gpl` build — skipped the compact build and linked against the wrong libraries. `PKG_CONFIG_LIBDIR` replaces the search, so only the prefix can answer.',
			'Measurement unchanged, and the reason is the diff: the only source file that changed is the GUI’s font lookup, and with the compact prefix present the resolved FFmpeg cflags and static libs were checked byte-identical under the new lookup. Archivo now ships with its OFL text, which it had not.'
		]
	},
	{
		version: '0.19.1',
		date: '2026-09-24',
		impact: ['moves'],
		title: 'A cue sheet naming several files is sliced from the right one',
		body: [
			'**A multi-FILE cue sheet was sliced entirely from its last file.** The parser kept one referenced file per sheet and overwrote it on every `FILE` line, so a sheet naming several — one per vinyl side, per disc, or per track — was applied to the last. `INDEX` times restart at `00:00:00` in each file, so every track was cut from the wrong audio, and it failed silently. On Bronski Beat’s *The Age Of Consent*, a vinyl rip with 4 files and 10 tracks: all ten `INDEX` times were sliced from side B02, so tracks 01, 04, 06 and 09 all began at 0:00 of that one file and reported identical peaks; 03, 05 and 08 were dropped as an empty cue range; the other three sides, unclaimed by the cue, were measured whole as standalone files — and the run printed 10 rows, averaged an album DR12 over them, and **exited 0**.',
			'Each track now records the file its `INDEX 01` lies in — re-read at `INDEX 01`, not only at `TRACK`, so a gaps-appended sheet that puts `FILE` between a track’s `INDEX 00` and `INDEX 01` still attributes the start correctly — and each run of consecutive tracks in one file is decoded once and sliced against its own timeline. The slicer itself is unchanged. **A cue track whose range is empty is now dropped with a named warning and the run exits 2**: an album missing a track is not a complete measurement.',
			'**What moves, and why no flag restores it.** Single-FILE cues and every non-cue input measure byte-identically to 0.19.0 — on Enya’s *Watermark*, stdout and stderr both. What changes for a multi-FILE cue is which audio each track is cut from, the track names and order, and the exit status; the 0.19.0 numbers for such a sheet were measured from the wrong audio, so there is nothing to reproduce and they should be discarded rather than compared. On Boney M’s *10.000 Lightyears*, one file per track, every measured value is unchanged, the 13 empty-range warnings are gone and the tracks list in cue order — and the old `14 - B8. Barbarella Fortuneteller` name behind the Weekly #46 pairing rotation turns out to have been this bug, not a renamed file.',
			'Verified on Bronski Beat: 10 tracks, no warnings, exit 0; each side’s track durations sum exactly to that side (13:03, 9:12, 12:02) and each side’s loudest track reproduces that side’s whole-file peak. ASan and UBSan at `-O0` report nothing, with output byte-identical to the `-O2` build. `check_cue_multifile.sh` is a new zero-dependency synthetic that **passes, and fails on 0.19.0**. Also carried: the compact-FFmpeg build stamp was written with an empty script hash, so every FFmpeg-tier build rebuilt FFmpeg, about 10 minutes each time.'
		]
	},
	{
		version: '0.19.0',
		date: '2026-09-24',
		impact: ['identical', 'additive'],
		title: 'The worker pool fits the machine’s memory, not just its cores',
		body: [
			'A minor bump although **no measurement moves**, because what an operator sees does: `--memory-limit` is a new flag, and the *default* worker count now depends on free memory as well as core count, so the same command can schedule differently on the same machine. “Changes no numbers” is not “changes nothing”, and `crete --version` goes into every harness run manifest.',
			'The failure it closes had been seen three times — twice in the weekly harness on dsd512, and once from the field: memory climbs, the OS kills the process, and an OOM kill exits with **empty stderr**, so it reads as a crash rather than as “you asked for too much”. The default had been one worker per logical CPU, each holding a whole decoded track in float64; on a 16 GB box a DSD512 album needs about 3.7 GB per worker, so the default asked for 22 GB. The fix had lived in the harness, which does nothing for anyone who just runs the binary.',
			'**The model is measured, not a rule of thumb.** Peak memory for one worker fits `file_bytes + K × (channels × rate × seconds × 8)`, with K at 2.21, 2.25 and 2.50 on a 6-channel 48 kHz WAV and 4- and 2-channel 192 kHz FLACs; the estimate lands +10%, +11% and −0.1% against measured peaks. A multiple of file size is not usable — file-to-peak ratios on those same three files span 6.91× to 13.42×, and on lossy input it is an order of magnitude out, a 7 MB AC-3 clip decoding to ~600 MB — so crête reads the shape from a 64 KB header peek or the container probe instead. With no `--stream` it plans for the heaviest stream, because FFmpeg’s unaided pick is not stable across remuxes. A container or cgroup limit beats physical RAM: inside a 2 GB container crête used to size itself for the machine underneath and be killed by the cgroup.',
			'**The larger win was a bug the model exposed.** FFmpeg estimates came out 25–35% low because the decoded channel vectors had no reserve and grew geometrically, the old buffer alive beside the new one. Reserving from the declared duration cut peak memory on 120 s clips from 903 to 608 MB on AC-3 5.1, 1456 to 792 MB on TrueHD 7.1 and 2003 to 1208 MB on DTS-HD MA 5.1 96 kHz — a third to a half less on every FFmpeg decode, and a pure allocation change: same values, same order.',
			'**`--jobs N` still wins**, obeyed exactly with a warning if it is not expected to fit, because silently overriding an explicit flag would make a run unreproducible. `--memory-limit` takes `8G`, `512M` or `40%`; `--version` prints what the host reported. The GUI takes the automatic answer. Measurement unchanged: the whole JSON tracks array byte-compared against 0.18.1 on **11 files, 0 differing**, across the zero-dependency and FFmpeg tiers, and identical across job counts and memory limits with album order kept.',
			'Also shipped: `check_lfe_peak.sh`, a zero-dependency synthetic that finally gates the 0.15.0 joint true-peak LFE guard, which had no regression coverage and could get none from the corpus. It **fails on a 0.14.0 build by exactly the recorded 17.01 dB**. **Not verified: the Linux and Windows resource-detection paths** — including the cgroup read — are written from the documented interfaces, compiled only on macOS, and have never been run. The next weekly is their first test.'
		]
	},
	{
		version: '0.18.1',
		date: '2026-09-23',
		impact: ['identical', 'additive'],
		title: 'A DVD-Audio title-set reader, and the meter left alone',
		body: [
			'A patch bump rather than a minor one, deliberately: `dvda.hpp` and the `dvda-info` tool are additive and **the meter itself is unchanged**. `crete --version` is recorded in every harness run, so bumping the minor version when no measured number moves would put a new version string beside identical results.',
			'A DVD-Audio title set is not one recording. Fleetwood Mac’s *Rumours* (2001, Warner) is **one** title set holding **four** titles — a 96 kHz 5.1 mix, a 96 kHz stereo mix, a 48 kHz 5.1 version and a one-second tail — **39 tracks** across five 1 GB `.aob` fragments whose boundaries do not align with the titles. Read as a single stream, which is what 0.18.0 does, crête measures the 5.1 mix up to the first group change and warns: honest, and nearly useless on a real disc. `dvda.hpp` parses the disc’s own tables — the audio formats, the titles and every track’s length. Parsing only, no decode and no FFmpeg, so it builds in the zero-dependency tier.',
			'**Checked three ways before it was trusted**, because a plausible-but-wrong parse of a binary table is the failure this project keeps finding. Arithmetic, and this is the one that settles it: each title states its own length in 90 kHz ticks and each track record states its own, in separate structures, and on the reference disc the track lengths sum to the title total **exactly** on all four titles — 240063900, 237918150, 216438000 and 94800. A wrong offset or endianness cannot produce four exact matches, and `validate()` asserts it. Agreement with the audio: the three format entries decode to 24-bit 96 kHz 6-channel, 24-bit 96 kHz 2-channel and 24-bit 48 kHz 6-channel — the same three groups, in the same order, that decoding the AOBs had already found by bisecting for where the channel count changes. And agreement with the record: the stereo title’s track lengths match the published running order to the second on most tracks.',
			'Only the two channel assignments confirmed against real audio are mapped; the other 19 return 0, meaning “ask the decoder”, because publishing a guess would put an unverified number beside measured ones. **Not done, and recorded with its evidence: per-track byte extents.** Durations do not give offsets — MLP is variable-rate — so slicing a title set by track needs one more table. There is a candidate for it, in the right shape; it is a hypothesis until it meets the standard the track table just met, since a wrong byte offset in a lossless stream yields audio that plays and a DR that looks reasonable.'
		]
	},
	{
		version: '0.18.0',
		date: '2026-09-23',
		impact: ['identical', 'additive'],
		title: 'DVD-Video and DVD-Audio title sets',
		body: [
			'A DVD is the first container crête reads that is not one file holding one stream. The spec caps a file at 1 GB, so a title is split at a pack boundary and numbered — `VTS_02_1.VOB`, `_2`, `_3`; `ATS_01_1.AOB` … `_5.AOB` — and measuring the pieces separately is wrong twice over: each is metered alone, and the split lands wherever 1 GB fell, so the 3 s DR block straddling it belongs to neither piece. **Point crête at any one fragment and it measures the whole title set**, presented to FFmpeg as a single stream. On the corpus: 25.324 s + 24.289 s read separately, **49.632 s** read as a set — 19 ms more, that being the MLP frame the split cut in half. DVD LPCM is exact either way, because its packets are self-contained within a pack.',
			'It also removes a trap. The FFmpeg stream **index is not stable across fragments of one title**: on the DSOTM 50th DVD the same three substreams come back as `2=ac3 3=ac3 4=lpcm` in the first fragment and `2=lpcm 3=ac3 4=ac3` in the second, because the index follows order of first appearance in the program stream. A `--stream` pin correct for one fragment selects a different *codec* in the next. Reading the set as one stream means one probe and one answer.',
			'**Two guards against a silently wrong answer, both found by building this.** A DVD-Audio title set can hold several audio groups, and the group boundary does not align with the fragments — on *Rumours* it falls partway through `ATS_01_3.AOB`. FFmpeg says only “Parity check failed” and “DTS discontinuity” on stderr and decodes on into a resampler configured for the previous format; crête now stops at the change, measures the first group, warns, and **exits 2**. And the channel layout and rate now follow the **first decoded frame** rather than the container probe, which can read deep enough to reach a *later* group and report 2 channels for a stream whose first frame is 6. That is the same decision already taken for the sample format, extended to the two fields the probe can get wrong in the same way — and it is the behavioural change to every FFmpeg decode that makes this a minor bump.',
			'**Nothing else moved, and that is measured rather than argued.** The whole JSON tracks array is byte-identical to a worktree build of `main`, linked against the same rebuilt FFmpeg so the comparison isolates the source change, across all seven disc-audio carriers — TrueHD 7.1 Atmos, AC-3 5.1, DTS-HD MA 5.1 and 2.0 at 96 kHz, LPCM 5.1 96 kHz and 2.0 192 kHz, and the six-stream clip: **7 identical, 0 differing**. The FFmpeg tier gains the program-stream demuxer and the two DVD LPCM decoders, all native LGPL, so its licensing position is unchanged. The new DVD suite is 10/10, and fails 10/10 against the build before it.',
			'**One known wart, measured and left alone.** In a `.vob` the compact FFmpeg lists one more audio stream than the disc carries: it cannot type the MPEG-2 video, content-probes it and matches it as MP3, so three audio streams list as four and the extra decodes to 0.34 s at 16 kHz with a +23 dBFS peak. Enabling the video parser and then the decoder was tried and changed nothing, and it cannot be filtered crête-side because MPEG audio is a legal DVD audio format. Automatic selection still returns the real stream and `--stream` reaches every genuine one; only the listing is wrong.'
		]
	},
	{
		version: '0.17.0',
		date: '2026-09-21',
		impact: ['identical', 'additive'],
		title: 'Damaged input is detected, reported, and never silent',
		body: [
			'A meter’s worst failure is not refusing a file — it is measuring a broken one and printing a number as though nothing happened. crête did exactly that. A FLAC with one bad sector in a four-track album was scored, averaged into the album DR and returned **exit 0** with no error field anywhere in the JSON: **DR13 became DR9**, at a sample peak of **+48.16 dBFS**, while the reference `flac` decoder refused the same file outright. A single flipped byte was worse still, producing numbers *identical* to the clean file, so no reading of the measurement could have revealed it.',
			'Four checks, one reporting channel. **FLAC frame CRC-8 and CRC-16** are verified rather than read and discarded — the only detector that catches an altered sample value, and the only one a format hands over for free. **Declared length against decoded length** on FLAC `STREAMINFO`, the WAV / RF64 / Wave64 `data` chunk and AIFF `COMM`/`SSND`; `STREAMINFO`’s sample count was already being read as an allocation hint and never compared with the decode. **Sample peak above 0 dBFS on integer PCM**, which is arithmetically impossible and so is proof of a bad decode whatever the checksums said — deliberately not applied to float PCM, decimated DSD or FFmpeg’s float decoders, all of which can legitimately exceed full scale. And a JSON **`warnings`** array that is *always* present, so an empty array is the positive statement “nothing was wrong” rather than the absence of evidence a missing key would be, with **exit code 2** for a run that completed on damaged or undecodable input.',
			'**A damaged file is still measured.** crête is a meter, not a repair tool: it reports what the bytes decode to and marks every affected number untrustworthy. That separation is what keeps the intact-file path bit-identical **by construction** — and it was verified rather than assumed, across **62 files** spanning FLAC, WAV (integer and float), AIFF, RF64, Wave64, ALAC, TrueHD, AC-3 and DTS-HD MA in mono, stereo, quad, 5.1 and 7.1, compared whole-JSON against a worktree build of 0.16.1 with **0 differing**, stdout and stderr also identical on the six-stream `.mkv`, and `check_fix12.sh` passing in both block-set modes. No measurement default changed, and nothing reproduces an older behaviour because no older behaviour was replaced.',
			'**The limit is pinned rather than glossed. WAV and AIFF carry no checksum**, so altered sample values in them are undetectable — by crête or by any other meter — because a run of zeros inside a `data` chunk cannot be distinguished from a passage of digital silence the artist put there. Only length and range can be checked in those containers; FLAC is the one that can prove itself. The new `integrity` suite asserts that a WAV with 4 KB of zeros written into its audio comes back **clean**, so the blind spot stays visible in a green run instead of being quietly assumed away.',
			'Generating the corpus immediately found a **reachable segfault**: a truncated AIFF walked off the end of the buffer, because the AIFF chunk walker used file-supplied lengths and an `SSND` offset without bounds-checking either — the same defect the RIFF walker had fixed in 0.14.0, in the decoder that never got the same treatment. Fixed, with **240 fuzz cases** over five native formats now crashing on none, and the suite sweeping 21 truncation offsets per format to keep it that way.',
			'Two corpora ship with it, and both are built by scripts rather than recorded by hand. `make_integrity_corpus.sh` builds from a fixed seed into a deterministic zip — fixed mtimes, sorted entries, so two machines produce the same sha256, which a corpus pinned by checksum has to do. It is the only crête corpus that is **not** commercial music, so it can be redistributed, regenerated anywhere, and needs no oracle: it gates the reporting contract, not a DR value. `make_sacd_test_image.py` cuts a ~4 GB SACD image down to the first tracks of each area — **229 MB** — keeping every audio sector as the disc’s own bytes and rewriting only the TOC fields that describe extent; its `--verify` measures every kept track in both the reduced and the full image and requires identical JSON, so the builder’s own address arithmetic cannot become a test that certifies its own mistake.'
		]
	},
	{
		version: '0.16.1',
		date: '2026-09-21',
		impact: ['identical', 'additive'],
		title: 'The GUI reads everything the CLI reads',
		body: [
			'The GUI knew one input shape out of three. It scanned a folder with a flat extension test and produced one track per file, so a cue sheet was ignored — while the landing screen advertised a CUE chip — and an SACD `.iso` was invisible, since `.iso` is deliberately kept out of that predicate: the extension names every disc image ever made, so acceptance is by content. Rather than teach the GUI the other two shapes separately, which is how two front-ends come to disagree about a corpus, the group collector, the SACD area resolution and the whole per-group analysis moved into `groups.hpp` and **both front-ends call in**. A folder cannot mean different things depending on which one opened it.',
			'So the GUI gains cue sheets, each `TRACK` sliced from one decode; SACD images with an Auto / Stereo / Multichannel area selector; and an audio-stream picker for a multi-stream container, listing every stream with codec, profile, channels and rate, marking the one FFmpeg would pick unaided and flagging Atmos or DTS:X as bed-only — the GUI equivalent of `--stream N`, shown *before* the run rather than reported after it. Its enumerator carries the same raised probesize as the decode, because at FFmpeg’s default 5 MB a TrueHD stream interleaved among five others reports `profile=unknown`, and the picker would then describe a stream differently from the way the decoder later reports it. `--dr-mean` and `--dr-blocks` stay unexposed on purpose: both are documented A/B-only flags, so the GUI pins the defaults and states all three axes in About.',
			'**Measurement is unchanged by construction** — the GUI now calls the CLI’s own function — and verified anyway: zero-dependency CLI JSON and stderr byte-identical against a worktree build of `main` on quad (192 kHz/24, 10 tracks) and Turtles, cue slicing identical on a synthetic 3-track cue album, and the SACD oracle reproduced exactly, DSOTM `.iso` track 5 giving peak **−5.4888** / RMS **−19.7534** against the recorded −5.489 / −19.753, with all ten stereo-area durations matching the running order at **42:57** total. `check_fix12.sh` passes in both block-set modes.',
			'**Album order was wrong in both front-ends, and had two independent causes.** The collector sorted lexicographically, so `10 - Track` preceded `2 - Track`; `natural_compare` now compares digit runs by value and everything else case-insensitively, with a raw-byte tiebreak so the result is a total order — `std::sort` is undefined behaviour on a comparator that is not a strict weak ordering. Brute-forced over all **21,952** triples of a 28-string edge-case set: **0** violations, identical output across 200 shuffles. Zero-padded numbering sorts the same either way, which is why this went unnoticed; and since the harness matches some references positionally, it was checked against the corpus — **26 albums** scanned across the reference stems, quad, DTS:X, disc-audio, mono and surround sets, order changed in **zero** of them, Turtles JSON byte-identical. `14 - B8.` still sorts before `A1.`, so the documented BoneyM rotation remains a file-naming problem.',
			'The GUI table had its own cause: the DR column carried the default-sort flag, so the table re-sorted by DR score the instant it first rendered, discarding the album order the analysis is built to preserve. Worse, the sort mutated the results vector that the selection indexes, so every sort silently moved the detail panel onto a different track. It now sorts an index view — results keep album order, TRACK-ascending restores it exactly, and the selection survives. Ordering is deliberately not tag-driven: crête parses no tags, and a reader would make listing order depend on how a file was tagged rather than on what the folder plainly shows.',
			'Two dialog bugs found on the way — no file filter anywhere accepted `.iso`, so the GUI’s picker could not select an SACD image at all, and the macOS branch was missing the disc-audio extensions Windows and Linux already had, so a `.mkv` Blu-ray rip could only be dragged in, never chosen. The accent bands also overflowed their own background, drawing a fixed 34 px tint before emitting content taller than that; the tint is now drawn after the rows, at their measured height. Separately, the compact FFmpeg builds itself as an order-only prerequisite of the four FFmpeg targets and rebuilds when its script’s stamp no longer matches the checkout — both Jenkinsfiles already compared that stamp, a local tree never did, so the stale-cache failure that broke disc audio on four of six carriers was still reachable. An externally provided prefix is detected and never clobbered.'
		]
	},
	{
		version: '0.16.0',
		date: '2026-09-19',
		impact: ['additive'],
		title: 'A DST decoder, so SACD multichannel areas measure',
		body: [
			'DST is SACD’s lossless compression, and multichannel areas commonly use it — on the DSOTM disc the stereo area is plain DSD at 1.72 GiB while the 5.1 area is DST at 2.16 GiB against the 5.16 GiB it would need uncompressed. 0.15.0 refused such an area by name; it now decodes, through the same `libdsddpcm` chain as every `.dsf` and `.dff`, so nothing downstream can tell which form the disc used. DST is lossless, so this is not an approximation. Result on DSOTM: **10/10 tracks**, durations matching the album, per-channel DR 9–15 with a normal 5.1 profile, DR10–DR12 per track.',
			'**The decoder asserts its own bit consumption, and that is the only check that worked.** Arithmetic coding consumes exactly the encoder’s bits if and only if the decoder applies the encoder’s probabilities, so every frame must consume its own coded length. A first version read Figure 10.10’s `C > A-Q` where the clause prose says `C >= A-Q`, and the failure announced itself in no other way: every frame decoded without throwing, every header parsed to stable values, mispredictions came out at a plausible **0.75 %**, and the output was 1-bit data that decimated to audible sound — while actually being the prediction filter free-running on its own output. It consumed **15 %** of each frame. The corrected decoder consumes **100.0 %**, and the audio band went from +19 dB to −57 dB with peak −13.87 dBFS rather than +2.06.',
			'Written from the ISO/IEC 14496-3 Subpart 10 syntax, zero-dependency like the rest: the one other software DST decoder available is LGPL, the licence class crête removed when it swapped out the old DSD engine. Nothing else moved — the uncompressed SACD path is byte-identical on all ten stereo-area rows, and `--dr-blocks`, `--dr-mean`, `--dr-lfe` and `--sacd-area` defaults are untouched.'
		]
	},
	{
		version: '0.15.0',
		date: '2026-09-19',
		impact: ['moves', 'additive'],
		title: 'The joint true peak honours the LFE policy; SACD images read directly',
		body: [
			'**The joint true peak excluded nothing.** The joint *sample* peak has skipped unscored channels since 0.12.0, but the loop behind `max_true_peak_dbtp` had no such guard — so on a multichannel file the two were measured over different channel sets and `--dr-lfe` reached one and not the other. True peak is ≥ sample peak by definition and the excess is inter-sample overshoot, a few tenths of a dB; on a synthetic 5.1 with every channel at −20 dBFS and the LFE at −3, crête reported a sample peak of −20.000 against a true peak of **−2.986**. A 17.01 dB gap, all of it the LFE, and `plr_db` inherited it — an LFE-inclusive numerator over an LFE-excluded denominator. The same synthetic now reads −19.992: 0.008 dB of genuine overshoot. `--dr-lfe include` reproduces 0.14.0 **exactly**, since the old behaviour was unconditional inclusion.',
			'It never surfaced on the corpus, and the release says why rather than claiming it did not matter: the LFE has to be the loudest channel and there it never is — real DSOTM 5.1 has the LFE at −11.14 against L at −1.67. Measured whole-JSON on all six carriers of that Blu-ray, **nothing moved at the default setting either**, 6/6. The corpus never contained the case; the synthetic does.',
			'**The codec profile lands**, so an immersive carrier says it is being measured as its channel bed. FFmpeg has no Atmos or DTS:X renderer — it decodes the TrueHD 7.1 bed, or the E-AC-3 5.1 core for JOC, and discards the object metadata — so the layout line now carries `[bed — Atmos objects not rendered]` and JSON gains `codec_profile` and `immersive_bed`. Descriptive only: **no measured value depends on it**. The profile was supposed to be free from `AVCodecContext::profile`, and the number is; the *name* is not, because the compact build configures `--enable-small` and every profile-name table expands to NULL, so crête carries its own.',
			'**SACD disc images read directly** — the format gap a DSD collection hits first, since rips circulate as `.iso` and previously needed an external extraction. The disc TOC supplies the track list and each track decodes from its own sector range through the same DSD chain, so `--dsd-mode`, `--dsd-filter` and `--dsd-out-rate` all apply. `--sacd-area auto|stereo|multichannel` picks the area; `auto` prefers stereo, the layer crête’s DR references are built on. Dispatch is by content, not extension: crête looks for `SACDMTOC` at LSN 510 and ignores anything else rather than metering a data DVD. DST-compressed areas were refused by name here, and decode from 0.16.0.'
		]
	},
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

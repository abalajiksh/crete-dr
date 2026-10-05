# CLAUDE.md

Guidance for Claude Code in this repository.

## What this is

The marketing/documentation site for crête (the C++17 dynamic-range meter at
`/Users/ashwinbalaji/Projects/Crete`, published at
`codeberg.org/abksh/Crete`). A static SvelteKit build deployed to Cloudflare.
Five pages: Overview, Testing, Standards, Formats, Changelog.

It is deliberately minimal: no Tailwind, no UI library, no component framework
beyond Svelte itself, and no runtime dependencies in the client bundle.

## Toolchain

**Bun, never npm.** There is no npm lockfile and node is not installed on this
machine. `bun install`, `bun run dev`, `bun run build`.

## The rules that matter

* **Every route is prerendered** (`src/routes/+layout.js`: `prerender = true`,
  `trailingSlash = 'always'`; adapter `strict: true`). Don't add anything that
  needs a server at request time.
* **`adapter-static`, not `adapter-cloudflare`.** `wrangler.jsonc` has
  `assets.directory = ./build` and deliberately **no `main`**. Validate config
  changes with `bunx wrangler deploy --dry-run`.
* **No third-party requests.** Fonts are self-hosted from `static/fonts/` via
  `src/fonts.css`. Don't reintroduce a Google Fonts `<link>` or `@import`.
* **Four stylesheet layers**, in this order in `+layout.svelte`: `fonts.css` →
  `app.css` → `site.css` → `pages.css`. Page-specific styling goes in the
  component's scoped `<style>`.
* **`src/app.css` is vendored** (Modernist design system). Use its `var(--…)`
  tokens; never hard-code a hex, font name or px value they carry. **No rounded
  corners anywhere**, 2px dividers stay 2px, headings and button labels flush
  left, accent used sparingly except in the poster band.
* **Theme is resolved in `app.html` before first paint** (`data-theme` on
  `<html>`). `src/lib/theme.js` must keep the localStorage key `crete-theme`.
* **No `{@html}` anywhere.** Inline marks (`` `code` ``, `**strong**`, `*em*`)
  go through `src/lib/inline.js` → `Inline.svelte` as text nodes.
* **`static/404.html` is hand-written static HTML**, not a route; no `fallback`
  in `svelte.config.js`. It's the one file allowed to repeat token values.

## Content, and the one rule about it

**Every figure on this site is a real measurement from the Crete repo or the
crete-pytest harness.** If you change a number, you must have a source in one
of those two repos for the new one. Don't round, don't approximate, and don't
carry a figure forward because it was already on the page. Figures tied to a
past experiment stay pinned to it.

Sources: the Crete repo's gitignored `temp/archiveNN.zip`
(`archive/test-results/<suite>_detailed.txt`), and Jenkins job
`Crete/Crete-Weekly` (`artifact/*zip*/archive.zip`).

**The honesty is the product.** Don't soften a caveat, upgrade a status, or
drop an open item on the Testing or Formats pages without being asked.

## Where the content lives

Tabular content lives in data modules so templates never change to add a row:

* `src/lib/releases.js` — derived from the Crete repo's tags, not the design
  file. The first entry is the only version bump. Every entry needs an
  `impact` (do recorded measurements still compare?); where numbers moved, name
  the flag that restores the old behaviour. The Crete-Site Jenkins job pushes
  new entries to `main` automatically; hand edits after that are fine.
* `src/lib/homeData.js`, `testingData.js`, `formatsData.js` — metric table, DR
  bands, build matrix, suites, oracles, limitations, decoders, platforms, and
  Linux package tables. Check the OBS repository list at
  `download.opensuse.org/repositories/home:/abksh:/crete/` before adding or
  dropping a distribution.
* Screenshots: `homeData.js` `shots[]`; add a file to `static/screenshots/` and
  set `src`. Don't use the old PNGs in the Crete repo's `screenshots/`.

## Verifying

`bun run build` is the real check (prerender + `strict: true` catches broken
routes and links). Visual checks: `bun run dev` and the Browser pane; use
`document.documentElement.style.zoom` for whole-page captures.

## Long-term knowledge (Cognee)

History and background live in Cognee, dataset `project_crete_dr`: the current
weekly census figures and which runs were unstable, where the design files came
from, why each rule exists, the full package-source details. Cognee is one
shared store (the dataset filter does not isolate projects, and the Crete repo's
own notes sit right beside these), so **put "crête website" in the query** and
check provenance: a result that starts with a `Source:` line names its file (`/Users/ashwinbalaji/Projects/crete-dr/CLAUDE.md` for this project); a chunk from mid-section has none, so judge it by content. Recall before changing
figures or a rule's area.

For one specific fact, `recall` with `search_type="CHUNKS"` and the
distinctive terms (a function name, a flag, an item ID): the default mode
tends to return the surrounding section instead.

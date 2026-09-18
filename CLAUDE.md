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

* **Every route is prerendered.** `src/routes/+layout.js` sets
  `prerender = true` and `trailingSlash = 'always'`, and the adapter runs with
  `strict: true` — so a route that can't be prerendered fails the build rather
  than shipping broken. Don't add anything that needs a server at request time.
* **`adapter-static`, not `adapter-cloudflare`.** The output is plain files.
  `wrangler.jsonc` declares `assets.directory = ./build` and deliberately has
  **no `main`**, so it deploys as static assets with no Worker script. Validate
  config changes with `bunx wrangler deploy --dry-run` (no auth needed).
* **The site makes no third-party request.** The design file loads Archivo and
  IBM Plex Mono from Google Fonts; `src/fonts.css` declares the same faces from
  `static/fonts/` instead, and `src/app.css` has that `@import` stripped. Don't
  reintroduce a Google Fonts `<link>` or `@import`. Archivo is a variable font
  declared `font-weight: 400 800`, so the heading weight is a real master rather
  than a synthesised bold. `app.html` preloads only the two latin faces.
* **Four stylesheet layers**, imported in `+layout.svelte` in this order:
  `fonts.css` → `app.css` (the vendored design system) → `site.css` (the
  light/dark shell) → `pages.css` (layout utilities). Page-specific styling goes
  in the component's own scoped `<style>`.
* **`src/app.css` is vendored** from the Modernist design system in the
  (gitignored) `temp/design/_ds/` folder. Treat it as vendored: take colours,
  fonts, spacing and radii from its `var(--…)` tokens and don't hard-code a hex,
  a font name or a px value the tokens already carry. Its rules are load-bearing
  — **no rounded corners anywhere** (`--radius-md` is 0 on purpose), 2px
  dividers never softened to hairlines, button labels and headings flush left,
  and the accent used sparingly except in the poster band.
* **The theme is resolved in `app.html` before first paint** — an inline script
  stamps `data-theme` on `<html>`. `src/lib/theme.js` holds the toggle and must
  keep the same localStorage key (`crete-theme`). The design shipped this as
  inline custom properties set by JS; here the same values are plain CSS in
  `site.css`, keyed off that attribute.
* **No `{@html}` anywhere.** The copy in the data files carries three inline
  marks — `` `code` ``, `**strong**`, `*em*` — tokenised by `src/lib/inline.js`
  and rendered through `Inline.svelte` as text nodes. Keep it that way; a flag
  name with an angle bracket must not be able to become markup.
* **`static/404.html` is hand-written static HTML**, not a SvelteKit route.
  There is deliberately no `fallback` in `svelte.config.js`: the fallback shell
  renders blank without JavaScript, which is a poor 404. It's the one file
  allowed to repeat design-token values, since it can't link the fingerprinted
  app CSS.

## Content, and the one rule about it

**Every figure on this site is a real measurement from the Crete repo or the
crete-pytest harness.** They were checked against those repos line by line when
the site was built — `2241` DR comparisons, `0.0262` mean |Δ|, weekly `#73` at
`173/159/0/14`, `273` cross-arch fields, `0.611 dB` Min PSR, `10,662`
comparisons at the #55 census, and so on. If you change a number, you must have
a source in one of those two repos for the new one. Don't round, don't
approximate, and don't carry a figure forward because it was already on the
page.

The honesty is the product. The Testing page's "Known limitations" table and the
Formats page's caveats are deliberately unflattering. **Don't soften a caveat,
upgrade a status, or drop an open item without being asked.**

## Where the content lives

Page copy is ported from the design files in `temp/design/` (gitignored), which
came from `temp/Crete website design kickoff.zip`. Tabular and repeated content
is in data modules so a page template never has to change to add a row:

* `src/lib/releases.js` — the release history, **derived from the Crete repo's
  tags and release commits**, not from the design file. `version.js` reads the
  current version from its first entry, so that is the only place to bump.
  Every entry carries an `impact`: whether recorded measurements still compare.
  A meter's changelog must answer that for each release — don't add an entry
  without deciding it, and where numbers moved, name the flag that reproduces
  the old behaviour.
* `src/lib/homeData.js`, `testingData.js`, `formatsData.js` — the metric table,
  DR bands, build matrix, suites, oracles, limitations, decoder tables and
  platform matrix.

## The screenshots

`homeData.js` `shots[]` has three GUI capture slots, all with `src: null`, which
render as labelled hatched placeholders via `Figure.svelte`. Dropping a real
capture in means adding the file to `static/screenshots/` and setting `src` —
no component change. The existing PNGs in the Crete repo's `screenshots/` are
from July and predate 0.14.0, so they were deliberately **not** used.

## Verifying

`bun run build` is the real check — prerendering exercises every route, and
`strict: true` means a broken internal link fails the build rather than shipping
a 404. For visual checks, `bun run dev` and the Browser pane; note that
`document.documentElement.style.zoom` works for whole-page captures where
`document.body.style.zoom` does not.

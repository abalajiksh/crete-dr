# crete-web

The documentation site for [crête](https://codeberg.org/abksh/Crete), a C++17
dynamic-range meter that gates every figure it prints against an external
reference implementation.

A static [SvelteKit](https://svelte.dev/docs/kit) build, deployed to Cloudflare
as plain files with no Worker script.

## Develop

Bun only — there is no npm lockfile.

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Output lands in `build/`. Every route is prerendered with `strict: true`, so a
route that cannot be prerendered — or an internal link that 404s — fails the
build rather than shipping broken.

Validate the Cloudflare config without deploying or authenticating:

```bash
bunx wrangler deploy --dry-run
```

## Layout

```
src/
  app.html            theme resolved before first paint
  fonts.css           self-hosted @font-face — no third-party request
  app.css             the Modernist design system, vendored
  site.css            light/dark shell, base element styling
  pages.css           layout utilities shared by the pages
  lib/                Nav, Footer, ThemeToggle, Figure, Inline + data modules
  routes/             one directory per page
static/
  fonts/              Archivo (variable) and IBM Plex Mono, woff2
  404.html            hand-written; not a SvelteKit route
  _headers            Cloudflare cache and security headers
```

## The pages

| Route         | What it covers                                                        |
| ------------- | --------------------------------------------------------------------- |
| `/`           | What crête is, what it measures, how to build it, what it cannot do    |
| `/testing/`   | The pytest harness, the four tiers of oracle, every open limitation    |
| `/standards/` | Which specification governs each metric, and where each one runs out   |
| `/formats/`   | Native and FFmpeg decoders, disc audio, DSD, MQA, platform matrix      |
| `/changelog/` | Every release, and whether it moved a number                           |

## Content

Every figure on the site is a real measurement taken from the crête repository
or its pytest harness, and was verified against those repositories when the
site was built. The release history in `src/lib/releases.js` is derived from
crête's own tags and release commits; `src/lib/version.js` reads the current
version from its newest entry, so a release is added in one place.

## Licence

MIT. See [LICENSE](LICENSE).

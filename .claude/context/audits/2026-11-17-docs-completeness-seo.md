# Audit: docs completeness and SEO readiness

Date: 2026-11-17
Baseline commit: f2cf63c
Scope: VitePress docs (`docs/`) and `README.md`, checked against `src/readmore.ts`, `src/readmore.css`, `package.json`, `vite.config.ts`, and SEO readiness (`docs/.vitepress/config.ts`)
Status: open

## Findings

| ID | Severity | File | Problem | Status | Notes (commit / reason) |
|----|----------|------|---------|--------|-------------------------|
| C1 | medium | docs/guide/controlling.md:100, docs/guide/how-it-works.md:39-41 | Only `document.fonts.ready` is mentioned; code also re-measures on every later `loadingdone` (src/readmore.ts:599-604) | fixed | |
| C2 | medium | docs/api/index.md:136, docs/guide/controlling.md:134 | Says destroy() removes 2 custom properties; it removes 3, including `--readmore-full-height` (src/readmore.ts:537-539) | fixed | |
| C3 | medium | docs/api/index.md:199-203 | Error table misses the RangeError for whitespace in expandedClass/openingClass/closingClass (src/readmore.ts:310-319) and does not say the TypeError also happens in SSR where there is no DOM (src/readmore.ts:269) | fixed | |
| C4 | low | README.md:178, docs/api/index.md | Empty-string fallback applies to every `*Class` option (src/readmore.ts:281-282); README says only state classes, API page does not mention it | fixed | |
| C5 | low | docs/api/index.md:182, README.md:196 | API page does not say `readmore:beforetoggle` is typed in HTMLElementEventMap/DocumentEventMap; README API summary leaves it out | fixed | |
| C6 | low | docs/guide/controlling.md:28-29 | Arrow-function example does not show the boolean pitfall; should use `rm.toggle.bind(rm)` | fixed | |
| C7 | low | docs/guide/how-it-works.md:71-75 | Same limit stated twice | fixed | |
| C8 | low | docs/guide/how-it-works.md:22-24 | Says `> 1` but code checks `> max(1, threshold)` (src/readmore.ts:625) | fixed | |
| C9 | low | docs/guide/frameworks.md:26-32, :104-105 | React example does not call refresh() when children change; SSR tip covers lines mode only, not height mode | fixed | |
| C10 | medium | README.md:134, docs/guide/frameworks.md | README promises Svelte but the frameworks page shows only React and Vue | fixed | |
| C11 | low | docs/.vitepress/config.ts:33-88 | Changelog is not in the sidebar; reachable only through a footer link | fixed | |
| C12 | low | docs/ | No FAQ/troubleshooting page, no migration guide, no Angular or Svelte examples | deferred | Larger content work, plan separately |
| C13 | low | docs/, package.json | CDN fields (unpkg/jsdelivr), `./package.json` export, and minified IIFE versus readable ESM with sourcemaps are not documented | deferred | Larger content work, plan separately |
| S1 | medium | docs/.vitepress/config.ts | No `sitemap.hostname` | fixed | added without checking the theme output (dist access denied); possible duplicate head tags |
| S2 | low | docs/.vitepress/config.ts | No `lang` | fixed | added without checking the theme output (dist access denied); possible duplicate head tags |
| S3 | medium | docs/.vitepress/config.ts | No head tags (canonical, twitter:card, theme-color, favicon) | fixed | added without checking the theme output (dist access denied); possible duplicate head tags |
| S4 | medium | docs/public/ | No `robots.txt` and no favicon file | open | robots.txt added; favicon missing, needs an asset from the user |
| S5 | low | docs/.vitepress/config.ts | No JSON-LD structured data | fixed | added without checking the theme output (dist access denied); possible duplicate head tags |
| S6 | low | package.json:87 | `homepage` points to GitHub, not https://readmore.frontfactory.dev | fixed | |
| S7 | low | docs/.vitepress/config.ts | `lastUpdated` disabled | wontfix | Disabled on purpose (commit 0b003d0) |

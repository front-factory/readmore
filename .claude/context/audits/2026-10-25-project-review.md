# Audit: project review of @frontfactory/readmore

Date: 2026-10-25
Baseline commit: 0e4b3f4
Scope: whole project review of @frontfactory/readmore (src/, tests, configs, package.json, CI), no code change
Status: open

## Findings

| ID | Severity | File | Problem | Status | Notes (commit / reason) |
|----|----------|------|---------|--------|-------------------------|
| F1 | high | src/readmore.ts ~372-374 | Only ResizeObserver triggers a re-measure; a web-font swap or a content edit without box change leaves the clamp state wrong. Fix: `document.fonts?.ready.then(() => this.refresh())` in #init, optionally on `loadingdone`; document in README. | open | |
| F2 | high | vite.config.ts ~20 | `minify: true` applies to ESM too and there is no `sourcemap`. Fix: minify only the IIFE build, ship unminified ESM + sourcemap, check `.gitignore` (`*.map`) and shipped files. | fixed | Already pending from the 2026-09-13 audit (item 15). |
| F4 | medium | src/readmore.ts ~329, 390 | `button.remove()` on resize unmount or destroy() drops focus to body (keyboard a11y). Fix: if the button is the activeElement, move focus to `this.el` (temporary tabindex=-1) before removal; add a test. | open | |
| F3 | medium | src/readmore.ts ~374 | The constructor calls refresh(), reading scrollHeight synchronously; `ReadMore.init()` over N elements forces layout N times (write/read/insert interleaved). Fix: measure all first then sync, or rely on the observer's initial callback. | fixed | |
| F5 | medium | src/readmore.ts ~283-284 | A throwing onToggle aborts the `readmore:toggle` event after the state already changed. Fix: dispatch the event first or use try/finally; document the order. | open | |
| F6 | medium | src/readmore.ts ~447 | Button is injected as a sibling via insertAdjacentElement; fragile with React/Vue/Svelte reconciliation/hydration. Fix: option like `buttonContainer`/`renderButton`, an `update(options)` method, README framework section (call destroy() on unmount). | open | |
| F7 | medium | src/readmore.ts ~205-211 | Numeric strings ('3', '120' from data-* or props) throw RangeError since Number.isInteger('3') is false. Fix: coerce with Number() before validating, or document strictness + test. | open | Already pending from the 2026-09-13 audit (item 28). |
| F8 | medium | src/readmore.css | No prefers-reduced-motion handling although README/playground suggest a max-height transition. Fix: `@media (prefers-reduced-motion: reduce)` example or `transition: none`; README note. | open | |
| F9 | medium | vitest.config.ts ~49-56 | Browser tests run on Chromium only (line-clamp/scrollHeight rounding differ on Firefox/WebKit); no coverage thresholds and CI never runs test:coverage. Fix: add firefox/webkit instances (CI Node 24 leg), set coverage.thresholds. | open | |
| F10 | low | src/__tests__/readmore.browser.test.ts ~14, 153-164 | Fixed wait(ms) sleeps; no browser tests for destroy(), RTL, font loading, toggle during transition; repeated afterEach in readmore.test.ts. Fix: vi.waitFor, add cases, dedupe afterEach. | open | Partially pending from the 2026-09-13 audit (item 25). |
| F11 | low | package.json ~27 | `engines` constrains library consumers (^22.22.2 \|\| >=24.15) though it is a browser lib. Fix: move to devEngines; consider `module`, `style: ./dist/readmore.css`, expose readmore.iife.js in `exports`. | open | Already pending from the 2026-09-13 audit (item 20). |
| F12 | low | .github/workflows/publish.yml | Actions pinned by tag, not SHA; docs:build never run in CI; the publish job doesn't repeat lint/build/size checks on the release commit. Fix: pin by SHA (Dependabot), add a docs:build step. | open | |

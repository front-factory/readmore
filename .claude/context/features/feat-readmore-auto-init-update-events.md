# Feature: readmore auto-init, update, i18n labels, overflow event, reduced motion (branch feat/readmore-auto-init-update-events)

Date: 2026-11-14
Last commit: 81c27d8
Base branch: develop

## Goal

Add to @frontfactory/readmore: (1) auto-init via data-readmore-* attributes, (2) update(options) method, (3) built-in prefers-reduced-motion CSS, (4) function-valued i18n labels (moreText/lessText/moreLabel/lessLabel receiving the hidden line count), (5) readmore:ready / readmore:overflow events when the button mounts or unmounts.

## Design

Chosen approach: five independent additions to `src/readmore.ts` and `src/readmore.css`, each shipped as its own small step. Everything stays zero-dependency and backward compatible (static strings and existing options keep working).

1. Auto-init: static `ReadMore.autoInit(root?)` selects `[data-readmore]` elements (under `root`, default `document`) and reads their `data-readmore-*` options: lines, height, threshold, more-text, less-text, more-label, less-label, button-class, expanded-class, scroll-on-collapse. It delegates to `ReadMore.init`, so already initialized elements are left untouched. The values are strings; the constructor already accepts numeric strings for `lines`, `height` and `threshold`, and `scroll-on-collapse` is parsed to a boolean in `autoInit`. The ESM build has no import side effect (`sideEffects` in package.json stays `["**/*.css"]`). The IIFE build (`readmore.iife.js`, global `FrontFactory.ReadMore`) calls `autoInit()` at `DOMContentLoaded`, or immediately if `document.readyState` is not `loading`. The IIFE hook is added in `src/readmore.ts` behind a build-time flag so the ESM output stays side-effect free; the exact mechanism is decided in the autoInit step (see open questions).
2. `update(options)`: merges any option except `buttonContainer` into the resolved options, then re-validates, re-measures and re-renders the button. `buttonContainer` is ignored with a `console.warn` (not a throw, so a framework passing its full props object does not crash). `options` stays `Readonly<ResolvedOptions>` publicly; `update` replaces the internal resolved options object (the `options` field becomes a getter over a private field). Class option changes (`expandedClass`, `openingClass`, `closingClass`, `buttonClass`) are moved on the live element and button. Does nothing once destroyed.
3. Built-in `@media (prefers-reduced-motion: reduce)` block in `src/readmore.css` that sets `transition: none` on the library's own classes (`.readmore-clamp`, `.readmore-clamp--height`). Zero specificity added beyond the existing selectors, so it only covers transitions declared on those classes.
4. Labels: `moreText`, `lessText`, `moreLabel`, `lessLabel` accept `string | ((ctx: ReadMoreLabelContext) => string)` with `ReadMoreLabelContext = { hiddenLines: number | undefined; expanded: boolean }`. `hiddenLines` is `undefined` in height mode. Static strings stay valid. Labels are recomputed in `#updateButton`, which already runs on mount and on each toggle, and additionally on `refresh()` and `update()` (while the button exists). `hiddenLines` is computed from the measured full content height, line height and clamped lines when collapsed; when expanded it is the last known collapsed value.
5. One event `readmore:overflow` (bubbling), `detail: { overflowing: boolean; instance: ReadMore }` typed in `HTMLElementEventMap` and `DocumentEventMap` like `readmore:toggle` (with `ReadMoreOverflowDetail`), emitted from `#mountButton` / `#unmountButton` whenever the overflowing state changes. Matching option callback `onOverflow(overflowing, instance)`. Detail shape: the brief fixes `{ overflowing: boolean }`; `instance` is included for consistency with `ReadMoreToggleDetail` (open question below).

Out of scope: `Intl.PluralRules` / locale presets, framework wrappers (Vue, React...), a web component, a `readmore:ready` event (the goal mentions it but the decisions keep one event, `readmore:overflow`).

## Steps

- [ ] Types and options plumbing: add `ReadMoreLabelContext`, widen `moreText`/`lessText`/`moreLabel`/`lessLabel` to `string | function`, add `hiddenLines` computation, resolve labels in `#updateButton`, recompute on `refresh()`; tests first, seen failing — files: `src/readmore.ts`, `src/__tests__/readmore.test.ts` — check: `npm test` (new tests in a `ReadMore - function labels` describe pass) and `npm run typecheck`
- [ ] `update(options)`: private mutable resolved options with `options` getter, shared validation extracted from the constructor, `buttonContainer` ignored with `console.warn`, re-measure and re-render; tests first, seen failing — files: `src/readmore.ts`, `src/__tests__/readmore.test.ts` — check: `npm test` (new `ReadMore - update()` describe passes) and `npm run typecheck`
- [ ] `readmore:overflow` event and `onOverflow` option: `ReadMoreOverflowDetail`, entries in `HTMLElementEventMap` and `DocumentEventMap`, dispatch on mount/unmount only when the state changes; tests first, seen failing — files: `src/readmore.ts`, `src/__tests__/readmore.test.ts` — check: `npm test` (new `ReadMore - readmore:overflow` describe passes) and `npm run typecheck`
- [ ] Reduced motion: add the `@media (prefers-reduced-motion: reduce)` block — files: `src/readmore.css`, `src/__tests__/readmore.browser.test.ts` — check: `npm run test:browser` (a test with `page.emulateMedia({ reducedMotion: 'reduce' })` asserts `transition-duration` is `0s` on `.readmore-clamp`, seen failing before the CSS change)
- [ ] `ReadMore.autoInit(root?)` and the IIFE hook: parse `data-readmore-*` into options, DOMContentLoaded / already-loaded hook in the IIFE build only; tests first, seen failing — files: `src/readmore.ts`, `vite.config.ts`, `src/__tests__/readmore.test.ts` — check: `npm test` (new `ReadMore.autoInit` describe passes), `npm run build`, and `dist/readmore.js` contains no top-level `autoInit(` call while `dist/readmore.iife.js` does
- [ ] Docs: document function labels, `update()`, `readmore:overflow`/`onOverflow`, reduced motion and `autoInit` — files: `docs/api/index.md`, `docs/guide/controlling.md`, `docs/guide/accessibility.md`, `docs/guide/animation.md`, `README.md` — check: `npm run docs:build` succeeds

## Decisions and open questions

- `update()` with `buttonContainer`: ignored with a `console.warn` (decided here; the brief allowed a throw instead).
- Reduced motion only covers transitions declared on the library's own classes; transitions a user declares on their own selectors are not touched (documented in the animation guide).
- Goal item 5 names `readmore:ready`, the user's decision keeps only `readmore:overflow`. Confirm `readmore:ready` is dropped.
- IIFE auto-init mechanism: a Vite `define` constant on the IIFE output only, or a separate entry file for the IIFE (`src/iife.ts`). Pick in the autoInit step; a separate entry would touch `vite.config.ts` only, no more files.
- `ReadMoreOverflowDetail` includes `instance` beyond the specified `{ overflowing }`; drop it if a strict shape is wanted.

## Notes

- Tests live in `src/__tests__/readmore.test.ts` (unit, jsdom, `npm test`) and `src/__tests__/readmore.browser.test.ts` (Playwright, `npm run test:browser`).
- Build: `vite build` produces `dist/readmore.js` (ESM, unminified), `dist/readmore.iife.js` (minified, global `FrontFactory`) and `dist/readmore.css`.
- No bundle-size figure or size rule anywhere in the repo or docs.

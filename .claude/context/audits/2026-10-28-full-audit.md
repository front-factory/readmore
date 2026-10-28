# Audit: full audit of @frontfactory/readmore

Date: 2026-10-28
Baseline commit: aa9d5a6
Scope: read-only full audit: src/ code and tests, build/lint/test config, package.json, CI workflows, README, playground, accessibility, robustness, security. The 2026-09-13 audits were handled; the bundle size limit and `engines` are intentionally kept as is.
Status: closed

Note: `readmore.test.ts` (1434 lines) was not read in detail by the auditor. The rest (exports, public types, CSS, README, playground, aria-controls/aria-expanded, focus handling on button unmount, destroy/cleanup) was found consistent.

## Findings

| ID | Severity | File | Problem | Status | Notes (commit / reason) |
|----|----------|------|---------|--------|-------------------------|
| F1 | medium | src/readmore.ts:309-323 | `expandedClass`, `openingClass` and `closingClass` are not validated: an empty string or one containing a space makes `classList.toggle/add` throw (SyntaxError / InvalidCharacterError) mid-`toggle()`, after `#expanded = true`. State is left inconsistent (button not updated, no event). Fix: validate these classes in the constructor (non-empty, no whitespace) or apply them before mutating state. | fixed | Validated in the constructor (RangeError if not a string or containing whitespace; an empty string falls back to the default); tests and README added. |
| F2 | medium | src/readmore.ts:436-455 | Late fonts are only handled via `document.fonts.ready` captured at init. A font loaded later (triggered by injected content, deferred `font-display`) changes overflow without resizing the element, so the button is neither mounted nor removed. Fix: listen to `document.fonts` `loadingdone` (shared listener) and resync live instances. | fixed | One shared `loadingdone` listener on `document.fonts` (added with the first live instance, removed with the last) resyncs live instances through the existing measure/sync; tests and README added. |
| F3 | low | src/readmore.ts:204 | Without a browser, `HTMLElement` does not exist: calling the constructor or `init()` in SSR throws a ReferenceError instead of the documented TypeError. `init()` also evaluates `document` as a default value. Module import stays safe. Fix: guard `typeof HTMLElement === 'undefined'` (return `[]` in `init`) and mention SSR in the README. | fixed | Constructor throws the documented TypeError when `HTMLElement` is missing; `init()` returns `[]` without a browser and no longer evaluates `document` as a default; SSR note in the README; tests added. |
| F4 | low | .github/workflows/publish.yml:39-40,100-101 | Third-party and official actions pinned by tag (`@v7`, `dorny/test-reporter@v3`), including in the `publish` job which has `id-token: write` and `contents: write`. Supply-chain risk. Fix: pin by commit SHA (Dependabot already maintains updates). | fixed | All actions pinned by full commit SHA with a trailing `# vX` tag comment. |
| F5 | low | .github/workflows/publish.yml:80-86 | `dorny/test-reporter` runs with `if: always()` and needs `checks: write`, which fails on PRs from forks (read-only token). Fix: add `continue-on-error: true` or condition on `github.event.pull_request.head.repo.full_name == github.repository`. | fixed | `always()` kept, combined with a not-a-fork-PR condition. |
| F6 | low | .github/workflows/publish.yml:88-91 | The `publish` job has no `concurrency`. Two close pushes to main or beta can start two semantic-release runs in parallel. Fix: group `release-${{ github.ref }}` with `cancel-in-progress: false`. | fixed | `concurrency` added on the `publish` job only (group `release-${{ github.ref }}`, no cancel). |

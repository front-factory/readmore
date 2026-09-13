# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.4.0](https://github.com/front-factory/readmore/compare/v1.3.1...v1.4.0) (2026-09-13)

### Features

* accept a force argument in toggle ([586913c](https://github.com/front-factory/readmore/commit/586913ca8e5be2acc37b9202fd707b831cb80a9f))
* accept elements, iterables and a root in ReadMore.init ([31cd461](https://github.com/front-factory/readmore/commit/31cd4610d7aa05806661d2da43235ca698be7ba8))
* add a public refresh method ([2e3720b](https://github.com/front-factory/readmore/commit/2e3720ba9973fcbb454fb09a7d7d02c4b9e673e1))
* add an IIFE build for CDN usage ([6d537a5](https://github.com/front-factory/readmore/commit/6d537a5f5e2664a16ca6844100210ed8674d26a6))
* add an opt-in fade for height mode ([d0bc71c](https://github.com/front-factory/readmore/commit/d0bc71cc52413f4354686183e2dfc77b17bd5df2))
* add moreLabel and lessLabel options ([b14f651](https://github.com/front-factory/readmore/commit/b14f651fb4fa8ef9461db15a733db979782efb0b))
* dispatch a readmore:toggle event and pass the instance to onToggle ([5f8cbf9](https://github.com/front-factory/readmore/commit/5f8cbf98a54423a32be5af5c544605734e8a1da6))

### Bug Fixes

* fall back to defaults for undefined options ([fd1c7d0](https://github.com/front-factory/readmore/commit/fd1c7d07823abcccb3aad45ead43e36ddb768871))
* keep the toggle button during collapse transitions ([44eb144](https://github.com/front-factory/readmore/commit/44eb14494df2df531635ca2e5f33d5e825dc644f))
* make toggle and destroy no-ops once destroyed ([d279ffd](https://github.com/front-factory/readmore/commit/d279ffd62ec74b1f60842e5482916cbc06a05369))
* reject non-integer lines and non-finite height ([bfe19b4](https://github.com/front-factory/readmore/commit/bfe19b426116e7588697750dc1d1fba273142e16))
* remove transient classes after the transition time ([3360f3d](https://github.com/front-factory/readmore/commit/3360f3d54ddeded9c06562f39e962cb882fbfc29))
* reuse existing instances in ReadMore.init ([21cce44](https://github.com/front-factory/readmore/commit/21cce44e36a13bf64b89f8238eef34b8a22262ca))
* skip generated ids already used in the page ([75b43b5](https://github.com/front-factory/readmore/commit/75b43b523adff7e2a4c3388b340376dd19c10443))

### Dependencies

* **deps:** update dependencies and drop node 20 ([48b7526](https://github.com/front-factory/readmore/commit/48b75261c48c79d0acc1b057893819b78e72e0d0))

## [1.3.1](https://github.com/front-factory/readmore/compare/v1.3.0...v1.3.1) (2026-07-26)

### Bug Fixes

* keep css side effects so bundlers do not drop the stylesheet ([1a43c08](https://github.com/front-factory/readmore/commit/1a43c08fc0a83fc6a2bcb7021e08a52dd4b6090e))

## [1.3.0](https://github.com/front-factory/readmore/compare/v1.2.0...v1.3.0) (2026-05-24)

### Features

* add onToggle callback option ([ff217aa](https://github.com/front-factory/readmore/commit/ff217aa9622b9f2abd5f04e947bac6088221c645))
* validate lines and height options ([60b2767](https://github.com/front-factory/readmore/commit/60b276781db59ed765a181b17798c8458df19675))

## [1.2.0](https://github.com/front-factory/readmore/compare/v1.1.1...v1.2.0) (2026-05-09)

### Features

* add aria-expanded and aria-controls on the toggle button ([82644cf](https://github.com/front-factory/readmore/commit/82644cfa6c274914623e5ea58c181a3f4bd88221))
* prevent double init and expose getInstance ([018040b](https://github.com/front-factory/readmore/commit/018040b2ac1430f89c1e5ea9c920c588b88ac138))

## [1.1.1](https://github.com/front-factory/readmore/compare/v1.1.0...v1.1.1) (2026-05-09)

### Bug Fixes

* debounce resize handler and fix transitionend listener leak ([0334ba0](https://github.com/front-factory/readmore/commit/0334ba0acf940c1b8bca1cff99eec62643ea8159))

## [1.1.0](https://github.com/front-factory/readmore/compare/v1.0.2...v1.1.0) (2026-05-08)

### Features

* add height option as pixel-based alternative to lines ([389573a](https://github.com/front-factory/readmore/commit/389573a839e3ca6a21eab957faf27e059d3eff04))
* add transient opening/closing state classes with transition support ([91b4ab2](https://github.com/front-factory/readmore/commit/91b4ab2f0cadc612c8587ac212f1d9ac08f79740))

## [1.0.2](https://github.com/front-factory/readmore/compare/v1.0.1...v1.0.2) (2026-05-08)

### Bug Fixes

* default style path ([d468c7e](https://github.com/front-factory/readmore/commit/d468c7e1cdd5496fc7bd2cf8148fe33ac591a137))

## [1.0.1](https://github.com/front-factory/readmore/compare/v1.0.0...v1.0.1) (2026-05-08)

### Bug Fixes

* correct build command ([21eb3dd](https://github.com/front-factory/readmore/commit/21eb3dd0ebaca6b01f9de35e344c2d5d2133cad6))

## 1.0.0 (2026-05-08)

### Features

* add ReadMore plugin ([d20a011](https://github.com/front-factory/readmore/commit/d20a011658a0759ca85694938d5adaa5a465874c))

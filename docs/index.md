---
layout: home
# Without this, titleTemplate turns the home title into "Readmore | Readmore".
titleTemplate: false
description: Zero-dependency plugin to clamp text to N lines or a fixed height, with an ellipsis and an accessible read more / read less toggle.

hero:
  name: by Front Factory
  text: Short by default. Long on demand.
  tagline: Clamp text to N lines or a fixed height. The toggle appears only when there is something left to read.
  command: npm install @frontfactory/readmore
  quote: <strong>“Less is more.”</strong> — Robert Browning, <em>Andrea del Sarto</em>, 1855. Readmore takes it literally — show less, and let readers ask for more.
  image:
    light: /hero-light.svg
    dark: /hero-dark.svg
    alt: A paragraph clamped to three lines with a Read more button, and the same paragraph expanded
  actions:
    - theme: brand
      text: Get started
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/front-factory/readmore
features:
  - title: Zero dependencies
    details: About 1.7 KB gzipped, with TypeScript types included.
  - title: CSS-driven clamping
    details: Uses <code>-webkit-line-clamp</code> or <code>max-height</code>, so the browser does the layout work.
  - title: Only when needed
    details: The toggle button is created only when the text actually overflows, and removed if it stops overflowing.
  - title: Accessible by default
    details: <code>aria-expanded</code> and <code>aria-controls</code> are set on the toggle button and kept in sync.
---

---
description: Install @frontfactory/readmore, clamp your first paragraph and load the plugin from a CDN when you have no bundler.
---

# Getting started

## Install

::: code-group

```sh [npm]
npm install @frontfactory/readmore
```

```sh [pnpm]
pnpm add @frontfactory/readmore
```

```sh [yarn]
yarn add @frontfactory/readmore
```

```sh [bun]
bun add @frontfactory/readmore
```

:::

::: info Browser support
The published package is shipped as untranspiled ES2022 and runs in Chrome/Edge 85+, Firefox 90+ and Safari 15+.
Building it from source requires Node.js `^22.22.2 || >=24.22`.
:::

## Your first clamp

Import the class and the stylesheet, then point `ReadMore.init()` at the elements to clamp:

```ts
import { ReadMore } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';

ReadMore.init('.excerpt', {
    lines: 3
});
```

```html
<p class="excerpt">A long paragraph…</p>
```

The paragraph is clamped to three lines. When it overflows, a `<button>` is inserted right after it:

<ReadmoreDemo :options="{ lines: 3 }" />

::: tip The button has no style
The stylesheet clamps the text and nothing else. The button carries the `readmore-btn` class; see
[Styling](/guide/styling) to make it look like yours.
:::

## What you can pass to `init()`

The first argument is a CSS selector, an element, or any iterable or array-like of elements (`NodeList`,
`HTMLCollection`, array, `Set`…). A third argument restricts a selector to a container:

```ts
// a single element
ReadMore.init(document.querySelector<HTMLElement>('#bio')!, { lines: 4 });

// a list of elements
ReadMore.init(document.querySelectorAll<HTMLElement>('.excerpt'), { lines: 3 });

// only the excerpts inside #news
ReadMore.init('.excerpt', { lines: 3 }, document.querySelector('#news')!);
```

`init()` returns one instance per element, in document order. Calling it again is safe: an element that is already
initialized keeps its instance, and its options, so you can re-run it after injecting new content.

To work with a single element, instantiate the class directly:

```ts
const instance = new ReadMore(document.querySelector<HTMLElement>('#bio')!, {
    lines: 4,
    onToggle: (expanded) => console.log('expanded:', expanded)
});
```

## From a CDN

Without a bundler, load the stylesheet and the IIFE build, which exposes `FrontFactory.ReadMore`. An existing
`FrontFactory` global is extended, not replaced. Pin the major version in production:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@frontfactory/readmore@1/dist/readmore.css">
<script src="https://cdn.jsdelivr.net/npm/@frontfactory/readmore@1/dist/readmore.iife.js"></script>
<script>
    FrontFactory.ReadMore.init('.excerpt', {
        lines: 3
    });
</script>
```

## Next

<CardGrid :columns="2">
  <Card title="Lines or height" link="/guide/modes">
    Choose how the text is clamped, and when to prefer one mode over the other.
  </Card>
  <Card title="Styling" link="/guide/styling">
    Style the button, hook into the state classes and tune the fade.
  </Card>
  <Card title="Controlling instances" link="/guide/controlling">
    Expand all, listen to toggles, refresh after a content change.
  </Card>
  <Card title="Frameworks" link="/guide/frameworks">
    Create and destroy instances with React, Vue or any component lifecycle.
  </Card>
</CardGrid>

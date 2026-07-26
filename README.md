# Readmore JS

[![Version](https://flat.badgen.net/npm/v/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![Downloads](https://flat.badgen.net/npm/dt/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![License](https://flat.badgen.net/npm/license/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)

Lightweight, framework-agnostic plugin to clamp text to N lines (or a fixed pixel height) with an ellipsis and a
`Read more` / `Read less` toggle button.

- Zero dependencies, ~1.3 KB gzipped
- TypeScript types included
- CSS-driven clamping via `-webkit-line-clamp` or `max-height`
- The toggle button is only created when the text actually overflows
- Accessible by default: `aria-expanded` and `aria-controls` on the toggle button

## Installation

```bash
npm install @frontfactory/readmore
```

Requires Node.js `>=20.19` to build from source. The published package runs in any modern browser supporting 
`ResizeObserver`.

## Playground

Try it live on StackBlitz — no installation required:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/front-factory/readmore)

Or run it locally:

```shell
npm run dev
```

## Usage

```ts
import { ReadMore } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';

// clamp to 3 lines
ReadMore.init('.excerpt', {
    lines: 3
});

// clamp to a fixed pixel height
ReadMore.init('.excerpt', {
    height: 80
});
```

`ReadMore.init()` also accepts a `NodeList` or an array of elements:

```ts
ReadMore.init(document.querySelectorAll<HTMLElement>('.excerpt'), {
    lines: 3
});
```

Or instantiate against a single element:

```ts
const el = document.querySelector<HTMLElement>('#bio');

if (el) new ReadMore(el, {
    lines: 4,
    onToggle: (expanded) => console.log('expanded:', expanded)
});
```

## Options

| Option          | Type                          | Default          | Description                                                         |
|-----------------|-------------------------------|------------------|---------------------------------------------------------------------|
| `lines`         | `number`                      | `3`              | Number of lines to clamp to (min `1`). Ignored if `height` is set.  |
| `height`        | `number`                      | —                | Max height in pixels (min `1`). Takes precedence over `lines`.      |
| `moreText`      | `string`                      | `'Read more'`    | Label of the button when the text is collapsed.                     |
| `lessText`      | `string`                      | `'Read less'`    | Label of the button when the text is expanded.                      |
| `buttonClass`   | `string`                      | `'readmore-btn'` | Class applied to the toggle button.                                 |
| `expandedClass` | `string`                      | `'is-expanded'`  | Class applied to the target element while expanded.                 |
| `openingClass`  | `string`                      | `'is-opening'`   | Transient class applied while expanding, removed after transition.  |
| `closingClass`  | `string`                      | `'is-closing'`   | Transient class applied while collapsing, removed after transition. |
| `onToggle`      | `(expanded: boolean) => void` | —                | Callback fired after each toggle with the current `expanded` state. |

## API

```ts
const instance = new ReadMore(element, options);

instance.el;            // the target element
instance.options;       // resolved options
instance.toggle();      // expand / collapse programmatically
instance.expanded;      // boolean getter
instance.destroy();     // remove button, classes, listeners and generated id

ReadMore.init(target, options);   // target: selector | NodeList | HTMLElement[] — returns ReadMore[]
ReadMore.getInstance(element);    // returns the ReadMore bound to an element, or undefined
```

### Errors

The constructor throws instead of failing silently:

| Error        | When                                                                          |
|--------------|-------------------------------------------------------------------------------|
| `TypeError`  | `element` is not an `HTMLElement`.                                            |
| `Error`      | The element is already initialized — call `destroy()` before re-initializing. |
| `RangeError` | `lines` is lower than `1`, or `height` is lower than or equal to `0`.         |

## Accessibility

When the button is mounted, it gets `aria-expanded` (kept in sync on every toggle) and `aria-controls`
pointing to the target element. If the element has no `id`, a unique one (`readmore-1`, `readmore-2`, …)
is generated and removed again on `destroy()`; an existing `id` is always preserved.

## How it works

The plugin sets a CSS custom property on the target element and toggles `.readmore-clamp`. In **lines mode** (default),
it sets `--readmore-lines` and the bundled stylesheet applies `-webkit-line-clamp`, producing an ellipsis at the end of
the last visible line. In **height mode** (`height` option), it sets `--readmore-height` and applies `max-height` via
the `.readmore-clamp--height` modifier class instead. The toggle button is mounted right after the element only when the
content actually overflows; a `ResizeObserver` watches the element and unmounts the button again if the text ends up
fitting (or mounts it later if it starts overflowing).

### Transient classes for animations

In addition to `expandedClass` (which stays applied for the entire expanded state), the plugin applies short-lived
`openingClass` and `closingClass` markers on the target element at the moment of expand and collapse respectively. Each
is added when the toggle starts and removed automatically once the CSS transition on the element ends — or on the next
tick if no transition is declared. Use them as hooks to drive enter/leave animations:

```css
.is-opening { 
    /* expand animation */
}

.is-closing {
    /* collapse animation */ 
}
```

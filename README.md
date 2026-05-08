# Readmore JS

[![Version](https://flat.badgen.net/npm/v/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![Downloads](https://flat.badgen.net/npm/dt/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![License](https://flat.badgen.net/npm/license/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)

Lightweight, framework-agnostic plugin to clamp text to N lines (or a fixed pixel height) with an ellipsis and a
`Read more` / `Read less` toggle button.

- Zero dependencies, ~1 KB
- TypeScript types included
- CSS-driven clamping via `-webkit-line-clamp` or `max-height`
- The toggle button is only created when the text actually overflows

## Installation

```bash
npm install @frontfactory/readmore
```

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

Or instantiate against a single element:

```ts
const el = document.querySelector<HTMLElement>('#bio');

if (el) new ReadMore(el, {
    lines: 4
});
```

## Options

| Option          | Type     | Default          | Description                                                        |
|-----------------|----------|------------------|--------------------------------------------------------------------|
| `lines`         | `number` | `3`              | Number of lines to clamp to. Ignored if `height` is set.           |
| `height`        | `number` | —                | Max height in pixels. Takes precedence over `lines` when provided. |
| `moreText`      | `string` | `'Read more'`    | Label of the button when the text is collapsed.                    |
| `lessText`      | `string` | `'Read less'`    | Label of the button when the text is expanded.                     |
| `buttonClass`   | `string` | `'readmore-btn'` | Class applied to the toggle button.                                |
| `expandedClass` | `string` | `'is-expanded'`  | Class applied to the target element while expanded.                |
| `openingClass`  | `string` | `'is-opening'`   | Transient class applied while expanding, removed after transition. |
| `closingClass`  | `string` | `'is-closing'`   | Transient class applied while collapsing, removed after transition.|

## API

```ts
const instance = new ReadMore(element, options);

instance.toggle();      // expand / collapse programmatically
instance.expanded;      // boolean getter
instance.destroy();     // remove button, classes and listeners

ReadMore.init(selector, options); // returns ReadMore[]
```

## How it works

The plugin sets a CSS custom property on the target element and toggles `.readmore-clamp`. In **lines mode** (default),
it sets `--readmore-lines` and the bundled stylesheet applies `-webkit-line-clamp`, producing an ellipsis at the end of
the last visible line. In **height mode** (`height` option), it sets `--readmore-height` and applies `max-height` via
the `.readmore-clamp--height` modifier class instead. The toggle button is mounted right after the element only when the
content actually overflows, and unmounted again on resize if the text ends up fitting.

### Transient classes for animations

In addition to `expandedClass` (which stays applied for the entire expanded state), the plugin applies short-lived
`openingClass` and `closingClass` markers on the target element at the moment of expand and collapse respectively.
Each is added when the toggle starts and removed automatically once the CSS transition on the element ends — or on the
next tick if no transition is declared. Use them as hooks to drive enter/leave animations:

```css
.is-opening { 
    /* expand animation */
}

.is-closing {
    /* collapse animation */ 
}
```

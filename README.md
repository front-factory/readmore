# @frontfactory/readmore

Lightweight, framework-agnostic plugin to clamp text to N lines with an ellipsis and a `Read more` / `Read less` toggle
button.

- Zero dependencies, ~1 KB
- TypeScript types included
- CSS-driven clamping via `-webkit-line-clamp` and a CSS custom property (`--readmore-lines`)
- The toggle button is only created when the text actually overflows

## Installation

```bash
npm install @frontfactory/readmore
```

## Usage

```ts
import { ReadMore } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';

ReadMore.init('.excerpt', {
    lines: 3
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

| Option          | Type     | Default          | Description                                         |
|-----------------|----------|------------------|-----------------------------------------------------|
| `lines`         | `number` | `3`              | Number of lines to clamp to.                        |
| `moreText`      | `string` | `'Read more'`    | Label of the button when the text is collapsed.     |
| `lessText`      | `string` | `'Read less'`    | Label of the button when the text is expanded.      |
| `buttonClass`   | `string` | `'readmore-btn'` | Class applied to the toggle button.                 |
| `expandedClass` | `string` | `'is-expanded'`  | Class applied to the target element while expanded. |

## API

```ts
const instance = new ReadMore(element, options);

instance.toggle();      // expand / collapse programmatically
instance.expanded;      // boolean getter
instance.destroy();     // remove button, classes and listeners

ReadMore.init(selector, options); // returns ReadMore[]
```

## How it works

The plugin sets the CSS custom property `--readmore-lines` on the target element and toggles the `.readmore-clamp`
class. The bundled stylesheet uses that variable in a `-webkit-line-clamp` rule, so the ellipsis appears at the end of
the requested line. The toggle button is mounted right after the element only when the content actually overflows, and
unmounted again on resize if the text ends up fitting.

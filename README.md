# Readmore JS

[![Version](https://flat.badgen.net/npm/v/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![Downloads](https://flat.badgen.net/npm/dt/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)
[![License](https://flat.badgen.net/npm/license/@frontfactory/readmore)](https://www.npmjs.com/package/@frontfactory/readmore)

Lightweight, framework-agnostic plugin to clamp text to N lines (or a fixed pixel height) with an ellipsis and a
`Read more` / `Read less` toggle button.

- Zero dependencies, ~1.7 KB gzipped
- TypeScript types included
- CSS-driven clamping via `-webkit-line-clamp` or `max-height`
- The toggle button is only created when the text actually overflows
- Accessible by default: `aria-expanded` and `aria-controls` on the toggle button

## Installation

```bash
npm install @frontfactory/readmore
```

Requires Node.js `^22.22.2 || >=24.15` to build from source. The published package is shipped as untranspiled ES2022
(private class members, logical assignment, `ResizeObserver`) and runs in Chrome/Edge 85+, Firefox 90+ and Safari 15+.

### From a CDN

Without a bundler, load the stylesheet and the IIFE build, which exposes `FrontFactory.ReadMore` (an existing
`FrontFactory` global is extended, not replaced). Pin the major version in production:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@frontfactory/readmore@1/dist/readmore.css">
<script src="https://cdn.jsdelivr.net/npm/@frontfactory/readmore@1/dist/readmore.iife.js"></script>
<script>
    FrontFactory.ReadMore.init('.excerpt', {
        lines: 3
    });
</script>
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

`ReadMore.init()` also accepts an element, or any iterable or array-like of elements (`NodeList`, `HTMLCollection`,
array, `Set`…). A third argument restricts a selector to a container:

```ts
ReadMore.init(document.querySelectorAll<HTMLElement>('.excerpt'), {
    lines: 3
});

// only the excerpts inside #news
ReadMore.init('.excerpt', {
    lines: 3
}, document.querySelector('#news')!);
```

Calling `ReadMore.init()` again is safe: elements that are already initialized keep their instance (and its options) and
are returned as is, so you can re-run it after injecting new content.

Or instantiate against a single element:

```ts
const el = document.querySelector<HTMLElement>('#bio');

if (el) new ReadMore(el, {
    lines: 4,
    onToggle: (expanded) => console.log('expanded:', expanded)
});
```

Each toggle also dispatches a bubbling `readmore:toggle` event on the element, handy for event delegation:

```ts
document.addEventListener('readmore:toggle', (event) => {
    const { expanded, instance } = event.detail;
});
```

Pass `true` or `false` to `toggle()` to force a state, e.g. for an "Expand all" button. Instances already in that
state are left untouched and fire neither `onToggle` nor the event:

```ts
const instances = ReadMore.init('.excerpt');

expandAllButton.addEventListener('click', () => instances.forEach((instance) => instance.toggle(true)));
```

If you change the content without changing the element's size (resizes are already tracked), call `refresh()` so the
button is mounted or removed as needed:

```ts
instance.el.textContent = newText;
instance.refresh();
```

### With a framework

The instance holds a button outside the element and is watched by a `ResizeObserver`, so call `destroy()` when the
component unmounts. For example with React:

```tsx
useEffect(() => {
    const instance = new ReadMore(ref.current!, {
        lines: 3
    });

    return () => instance.destroy();
}, []);
```

## Options

| Option          | Type                                              | Default          | Description                                                                 |
|-----------------|---------------------------------------------------|------------------|-----------------------------------------------------------------------------|
| `lines`         | `number`                                          | `3`              | Number of lines to clamp to (min `1`). Ignored if `height` is set.          |
| `height`        | `number`                                          | —                | Max height in pixels (min `1`). Takes precedence over `lines`.              |
| `moreText`      | `string`                                          | `'Read more'`    | Label of the button when the text is collapsed.                             |
| `lessText`      | `string`                                          | `'Read less'`    | Label of the button when the text is expanded.                              |
| `moreLabel`     | `string`                                          | —                | `aria-label` of the button when collapsed. Should contain `moreText`.       |
| `lessLabel`     | `string`                                          | —                | `aria-label` of the button when expanded. Should contain `lessText`.        |
| `buttonClass`   | `string`                                          | `'readmore-btn'` | Class applied to the toggle button.                                         |
| `expandedClass` | `string`                                          | `'is-expanded'`  | Class applied to the target element while expanded.                         |
| `openingClass`  | `string`                                          | `'is-opening'`   | Transient class applied while expanding, removed after transition.          |
| `closingClass`  | `string`                                          | `'is-closing'`   | Transient class applied while collapsing, removed after transition.         |
| `onToggle`      | `(expanded: boolean, instance: ReadMore) => void` | —                | Callback fired after each toggle, before the `readmore:toggle` event.       |

## API

```ts
const instance = new ReadMore(element, options);

instance.el;            // the target element
instance.options;       // resolved options (read-only)
instance.toggle();      // expand / collapse programmatically
instance.toggle(true);  // force expand (false: force collapse); no-op if already in that state
instance.expanded;      // boolean getter
instance.refresh();     // re-check the overflow after a content change
instance.destroy();     // remove button, classes, listeners and generated id; toggle() is a no-op afterwards

ReadMore.init(target, options, root);  // target: selector | element | iterable of elements — returns ReadMore[], reusing existing instances
ReadMore.getInstance(element);         // returns the ReadMore bound to an element, or undefined

// event: 'readmore:toggle' (bubbles) — event.detail: { expanded, instance }
```

### Errors

The constructor throws instead of failing silently:

| Error        | When                                                                          |
|--------------|-------------------------------------------------------------------------------|
| `TypeError`  | `element` is not an `HTMLElement`.                                            |
| `Error`      | The element is already initialized — call `destroy()` before re-initializing. |
| `RangeError` | `lines` is not an integer `>= 1`, or `height` is not a finite number `> 0`.   |

## Accessibility

When the button is mounted, it gets `aria-expanded` (kept in sync on every toggle) and `aria-controls`
pointing to the target element. If the element has no `id`, a unique one (`readmore-1`, `readmore-2`, …, skipping ids
already used in the page) is generated and removed again on `destroy()`; an existing `id` is always preserved.

When several buttons share the same visible text, give each one a distinct accessible name with `moreLabel` and
`lessLabel`. Keep the visible text inside the label so voice control users can still activate the button by its text:

```ts
new ReadMore(el, {
    moreLabel: 'Read more about Product A',
    lessLabel: 'Read less about Product A'
});
```

## How it works

The plugin sets a CSS custom property on the target element and toggles `.readmore-clamp`. In **lines mode** (default),
it sets `--readmore-lines` and the bundled stylesheet applies `-webkit-line-clamp`, producing an ellipsis at the end of
the last visible line. In **height mode** (`height` option), it sets `--readmore-height` and applies `max-height` via
the `.readmore-clamp--height` modifier class instead. The toggle button is mounted right after the element only when the
content actually overflows; a single `ResizeObserver`, shared by every instance, watches the elements and unmounts the
button again if the text ends up fitting (or mounts it later if it starts overflowing). All resized elements are
measured before any button is added or removed, to avoid a layout per element.

### Transient classes for animations

In addition to `expandedClass` (which stays applied for the entire expanded state), the plugin applies short-lived
`openingClass` and `closingClass` markers on the target element at the moment of expand and collapse respectively. Each
is added when the toggle starts and removed automatically once the longest CSS transition declared on the element
(duration + delay) has elapsed — or on the next tick if no transition is declared. The overflow check that mounts or
unmounts the button waits for that moment too, so the button stays in place during a collapse animation. Use them as
hooks to drive enter/leave animations:

```css
.is-opening { 
    /* expand animation */
}

.is-closing {
    /* collapse animation */ 
}
```

### Fade in height mode

Add the `readmore-fade` class to the element to fade out the bottom of the clamped text in height mode (lines mode
already ends with an ellipsis). The fade is removed while expanded; its size defaults to `2em` and can be changed with
the `--readmore-fade-size` custom property:

```html
<p class="excerpt readmore-fade" style="--readmore-fade-size: 3em">…</p>
```

## Limitations

- While collapsed, `.readmore-clamp` sets `display: -webkit-box` (lines mode) or `display: block` (height mode), which
  overrides the element's own `display`. To clamp a flex or grid container, wrap its content in an inner element and
  initialize the plugin on that element instead.
- In lines mode, how `-webkit-line-clamp` handles several block children (e.g. multiple `<p>`) varies between browsers.
  For rich content, prefer height mode.
- Lines mode cannot be animated: neither `display` nor `line-clamp` can transition. For an animated expand/collapse, use
  height mode with a `max-height` transition.
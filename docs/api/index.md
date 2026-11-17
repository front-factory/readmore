---
description: Reference for the ReadMore class, its options, constructor, instance and static methods, the readmore:toggle and readmore:beforetoggle events, exported types and thrown errors.
---

# API

Everything the package exports is one class, `ReadMore`, and the types around it.

```ts
import { ReadMore } from '@frontfactory/readmore';
import type { ReadMoreOptions, ReadMoreToggleDetail, ResolvedOptions } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';
```

## Options

Every option is optional. An option explicitly set to `undefined` falls back to its default, and so does an empty string
for any `*Class` option (`buttonClass`, `expandedClass`, `openingClass`, `closingClass`).

| Option             | Type                                                         | Default          | Description                                                                                                    |
|--------------------|--------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------------------------------|
| `lines`            | `number \| (el) => number`                                   | `3`              | Number of lines to clamp to (min `1`). Ignored if `height` is set. A function is called with the element.      |
| `height`           | `number \| (el) => number`                                   | —                | Max height in pixels (greater than `0`). Takes precedence over `lines`. A function is called with the element. |
| `threshold`        | `number`                                                     | `0`              | Hidden overflow in pixels tolerated before the button is mounted (min `0`; at least 1px is always required).   |
| `moreText`         | `string`                                                     | `'Read more'`    | Label of the button when the text is collapsed.                                                                |
| `lessText`         | `string`                                                     | `'Read less'`    | Label of the button when the text is expanded.                                                                 |
| `moreLabel`        | `string`                                                     | —                | `aria-label` of the button when collapsed. Should contain `moreText`.                                          |
| `lessLabel`        | `string`                                                     | —                | `aria-label` of the button when expanded. Should contain `lessText`.                                           |
| `buttonClass`      | `string`                                                     | `'readmore-btn'` | Class applied to the toggle button.                                                                            |
| `buttonContainer`  | `HTMLElement`                                                | —                | Element the button is appended to, instead of being inserted after the text.                                   |
| `expandedClass`    | `string`                                                     | `'is-expanded'`  | Class applied to the target element while expanded.                                                            |
| `openingClass`     | `string`                                                     | `'is-opening'`   | Transient class applied while expanding, removed after transition.                                             |
| `closingClass`     | `string`                                                     | `'is-closing'`   | Transient class applied while collapsing, removed after transition.                                            |
| `scrollOnCollapse` | `boolean`                                                    | `false`          | On collapse, scroll the element back into view if its top ended up above the viewport.                         |
| `onBeforeToggle`   | `(expanded: boolean, instance: ReadMore) => boolean \| void` | —                | Called before a toggle with the state about to be entered; returning `false` cancels it.                       |
| `onToggle`         | `(expanded: boolean, instance: ReadMore) => void`            | —                | Callback fired after each toggle, before the `readmore:toggle` event.                                          |

See [Lines or height](/guide/modes), [Styling](/guide/styling) and [Accessibility](/guide/accessibility) for how the
options are used.

## Constructor

<Api name="new ReadMore()" kind="constructor" signature="new ReadMore(element: HTMLElement, options?: ReadMoreOptions)">

Clamps `element` and, if the text overflows, mounts the toggle button right after it (or appends it to `buttonContainer`).

```ts
const instance = new ReadMore(document.querySelector<HTMLElement>('#bio')!, {
    lines: 4
});
```

It throws instead of failing silently; see [Errors](#errors).

</Api>

## Static methods

<Api name="ReadMore.init()" kind="static method" signature="ReadMore.init(target, options?, root?): ReadMore[]">

Creates an instance on every matching element and returns them, in document order.

| Parameter | Type                                                               | Default    | Description                                        |
|-----------|--------------------------------------------------------------------|------------|----------------------------------------------------|
| `target`  | `string \| HTMLElement \| Iterable<HTMLElement> \| ArrayLike<HTMLElement>` | —  | A selector, an element, or a collection of them.   |
| `options` | `ReadMoreOptions`                                                  | —          | Options for the new instances.                     |
| `root`    | `ParentNode`                                                       | `document` | Where to look for `target` when it is a selector.  |

An element that already has an instance is left untouched, and its existing instance is returned. The options are not
applied to it. Calling `init()` again is therefore safe after new content is added.

```ts
const instances = ReadMore.init('.excerpt', { lines: 3 });
```

</Api>

<Api name="ReadMore.getInstance()" kind="static method" signature="ReadMore.getInstance(element: HTMLElement): ReadMore | undefined">

Returns the instance bound to `element`, or `undefined` when there is none, or after it was destroyed.

</Api>

## Instance

<Api name="el" kind="property" signature="readonly el: HTMLElement">

The clamped element.

</Api>

<Api name="options" kind="property" signature="readonly options: Readonly<ResolvedOptions>">

The options this instance was built with, merged with the defaults. It is read-only: to change an option, destroy the
instance and create a new one.

</Api>

<Api name="expanded" kind="getter" signature="get expanded(): boolean">

Whether the text is currently expanded.

</Api>

<Api name="toggle()" kind="method" signature="toggle(force?: boolean): void">

Expands or collapses the text: it first calls `onBeforeToggle` and dispatches the cancelable
[`readmore:beforetoggle`](#readmore-beforetoggle) event (either can cancel), then updates the button's label and
`aria-expanded`, swaps the state classes, calls `onToggle`, then dispatches the [`readmore:toggle`](#readmore-toggle)
event. If `onToggle` throws, the event is still dispatched and the error is then re-thrown.

| Parameter | Type      | Description                                                                          |
|-----------|-----------|--------------------------------------------------------------------------------------|
| `force`   | `boolean` | `true` expands, `false` collapses. Omitted, the current state is inverted.           |

Nothing happens, and nothing fires, if the text is already in the requested state, or once the instance is destroyed.

```ts
instance.toggle();      // invert
instance.toggle(true);  // expand
instance.toggle(false); // collapse
```

</Api>

<Api name="refresh()" kind="method" signature="refresh(): void">

Checks again whether the content overflows, and mounts or removes the button accordingly. Resizes are already tracked:
call it after a change that keeps the element's size. It also re-evaluates `lines` and `height` when they are functions.

It does nothing while the text is expanded, during a toggle transition, or once the instance is destroyed.

</Api>

<Api name="destroy()" kind="method" signature="destroy(): void">

Restores the element: it removes the button, the classes, the `--readmore-lines`, `--readmore-height` and
`--readmore-full-height` properties, the listeners and the generated `id`. The element can then be initialized again.

Calling it again does nothing, and `toggle()` is a no-op afterwards.

</Api>

## Events

<Api name="readmore:beforetoggle" kind="event" signature="CustomEvent<ReadMoreToggleDetail>">

Dispatched on the element before a toggle that would really happen, after `onBeforeToggle` (it is not dispatched if that
returned `false`). It **bubbles** and is **cancelable**: `event.preventDefault()` cancels the toggle. A cancelled toggle
changes nothing and fires neither `onToggle` nor `readmore:toggle`. It also gates the automatic expansion on focus.

| `detail` field | Type       | Description                                              |
|----------------|------------|----------------------------------------------------------|
| `expanded`     | `boolean`  | `true` if about to expand, `false` if about to collapse. |
| `instance`     | `ReadMore` | The instance about to be toggled.                        |

```ts
document.addEventListener('readmore:beforetoggle', (event) => {
    if (event.detail.expanded && !userMayExpand) event.preventDefault();
});
```

If `onBeforeToggle` throws, the error propagates and the toggle does not happen.

</Api>

<Api name="readmore:toggle" kind="event" signature="CustomEvent<ReadMoreToggleDetail>">

Dispatched on the element after each toggle, right after `onToggle`. It **bubbles**, so a listener on `document` catches
every clamped element. If `onToggle` throws, the event is still dispatched and the error is then re-thrown to the caller.

| `detail` field | Type       | Description                                    |
|----------------|------------|------------------------------------------------|
| `expanded`     | `boolean`  | `true` once expanded, `false` once collapsed.  |
| `instance`     | `ReadMore` | The instance that was toggled.                 |

```ts
document.addEventListener('readmore:toggle', (event) => {
    const { expanded, instance } = event.detail;
});
```

The event, like `readmore:beforetoggle`, is typed in `HTMLElementEventMap` and `DocumentEventMap` as soon as the package
is imported.

</Api>

## Types

| Type                   | Description                                                                   |
|------------------------|-------------------------------------------------------------------------------|
| `ReadMoreOptions`      | The options accepted by the constructor and `init()`.                         |
| `ResolvedOptions`      | `ReadMoreOptions` merged with the defaults, as exposed on `instance.options`. |
| `ReadMoreToggleDetail` | The `detail` of the `readmore:toggle` and `readmore:beforetoggle` events.     |

## Errors

The constructor throws instead of failing silently. `ReadMore.init()` can throw the `TypeError` and the `RangeError`, on
the first element it cannot initialize. It never throws the `Error`, since it reuses the existing instance instead.

| Error        | When                                                                                                                   |
|--------------|------------------------------------------------------------------------------------------------------------------------|
| `TypeError`  | `element` or `buttonContainer` is not an `HTMLElement`, or there is no DOM at all, e.g. during SSR.                    |
| `Error`      | The element is already initialized. Call `destroy()` before re-initializing.                                           |
| `RangeError` | `lines` is not an integer `>= 1`, `height` is not a finite number `> 0`, or `threshold` is not a finite number `>= 0`. |
| `RangeError` | `expandedClass`, `openingClass` or `closingClass` is not a string or contains whitespace. The message is `ReadMore: <option> must be a string without whitespace.` |

`lines`, `height` and `threshold` also accept numeric strings such as `'3'` (e.g. read from a `data-*` attribute); blank or non-numeric strings throw a `RangeError`.

`lines` and `height` can also be a function, called with the element, whose returned value is validated the same way. It
runs at construction and on each `refresh()`, not on every resize.

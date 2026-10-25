---
description: Reference for the ReadMore class, its options, constructor, instance and static methods, the readmore:toggle event, exported types and thrown errors.
---

# API

Everything the package exports is one class, `ReadMore`, and the types around it.

```ts
import { ReadMore } from '@frontfactory/readmore';
import type { ReadMoreOptions, ReadMoreToggleDetail, ResolvedOptions } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';
```

## Options

Every option is optional. An option explicitly set to `undefined` falls back to its default.

| Option          | Type                                              | Default          | Description                                                           |
|-----------------|---------------------------------------------------|------------------|-----------------------------------------------------------------------|
| `lines`         | `number`                                          | `3`              | Number of lines to clamp to (min `1`). Ignored if `height` is set.    |
| `height`        | `number`                                          | —                | Max height in pixels (min `1`). Takes precedence over `lines`.        |
| `moreText`      | `string`                                          | `'Read more'`    | Label of the button when the text is collapsed.                       |
| `lessText`      | `string`                                          | `'Read less'`    | Label of the button when the text is expanded.                        |
| `moreLabel`     | `string`                                          | —                | `aria-label` of the button when collapsed. Should contain `moreText`. |
| `lessLabel`     | `string`                                          | —                | `aria-label` of the button when expanded. Should contain `lessText`.  |
| `buttonClass`   | `string`                                          | `'readmore-btn'` | Class applied to the toggle button.                                   |
| `expandedClass` | `string`                                          | `'is-expanded'`  | Class applied to the target element while expanded.                   |
| `openingClass`  | `string`                                          | `'is-opening'`   | Transient class applied while expanding, removed after transition.    |
| `closingClass`  | `string`                                          | `'is-closing'`   | Transient class applied while collapsing, removed after transition.   |
| `onToggle`      | `(expanded: boolean, instance: ReadMore) => void` | —                | Callback fired after each toggle, before the `readmore:toggle` event. |

See [Lines or height](/guide/modes), [Styling](/guide/styling) and [Accessibility](/guide/accessibility) for how the
options are used.

## Constructor

<Api name="new ReadMore()" kind="constructor" signature="new ReadMore(element: HTMLElement, options?: ReadMoreOptions)">

Clamps `element` and, if the text overflows, mounts the toggle button right after it.

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

Expands or collapses the text: it updates the button's label and `aria-expanded`, swaps the state classes, calls
`onToggle`, then dispatches the [`readmore:toggle`](#readmore-toggle) event. If `onToggle` throws, the event is still
dispatched and the error is then re-thrown.

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
call it after a change that keeps the element's size.

It does nothing while the text is expanded, during a toggle transition, or once the instance is destroyed.

</Api>

<Api name="destroy()" kind="method" signature="destroy(): void">

Restores the element: it removes the button, the classes, the `--readmore-lines` and `--readmore-height` properties, the
listeners and the generated `id`. The element can then be initialized again.

Calling it again does nothing, and `toggle()` is a no-op afterwards.

</Api>

## Event

<Api name="readmore:toggle" kind="event" signature="CustomEvent<ReadMoreToggleDetail>">

Dispatched on the element after each toggle, right after `onToggle`. It **bubbles**, so a listener on `document` catches
every clamped element.

| `detail` field | Type       | Description                                    |
|----------------|------------|------------------------------------------------|
| `expanded`     | `boolean`  | `true` once expanded, `false` once collapsed.  |
| `instance`     | `ReadMore` | The instance that was toggled.                 |

```ts
document.addEventListener('readmore:toggle', (event) => {
    const { expanded, instance } = event.detail;
});
```

The event is typed on `HTMLElement` and on `document` as soon as the package is imported.

</Api>

## Types

| Type                   | Description                                                                          |
|------------------------|--------------------------------------------------------------------------------------|
| `ReadMoreOptions`      | The options accepted by the constructor and `init()`.                                |
| `ResolvedOptions`      | `ReadMoreOptions` merged with the defaults, as exposed on `instance.options`.        |
| `ReadMoreToggleDetail` | The `detail` of the `readmore:toggle` event.                                         |

## Errors

The constructor throws instead of failing silently. `ReadMore.init()` can throw the `TypeError` and the `RangeError`, on
the first element it cannot initialize. It never throws the `Error`, since it reuses the existing instance instead.

| Error        | When                                                                          |
|--------------|-------------------------------------------------------------------------------|
| `TypeError`  | `element` is not an `HTMLElement`.                                            |
| `Error`      | The element is already initialized. Call `destroy()` before re-initializing.  |
| `RangeError` | `lines` is not an integer `>= 1`, or `height` is not a finite number `> 0`.   |

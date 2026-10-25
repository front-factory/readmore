---
description: Clamp to a number of lines or to a fixed pixel height, what each mode is good at, and how to fade out the cut edge.
---

# Lines or height

Readmore has two ways to clamp. You pick one per element with a single option.

| Mode   | Option           | Clamped with                 | Best for                              |
|--------|------------------|------------------------------|---------------------------------------|
| Lines  | `lines` (default `3`) | `-webkit-line-clamp`    | A single block of plain text          |
| Height | `height`         | `max-height`                 | Rich content, or a height you control |

When both are set, `height` wins and `lines` is ignored.

## Lines

The default. The text is cut after N lines and ends with an ellipsis:

```ts
ReadMore.init('.excerpt', {
    lines: 2
});
```

<ReadmoreDemo :options="{ lines: 2 }" />

`lines` must be an integer of at least `1`; anything else throws a `RangeError`. Numeric strings such as `'3'` are accepted; blank or
non-numeric strings throw a `RangeError`.

## Height

`height` is a maximum height **in pixels**. The element is clamped with `max-height` instead of a line count:

```ts
ReadMore.init('.excerpt', {
    height: 80
});
```

<ReadmoreDemo :options="{ height: 80 }" />

There is no ellipsis in this mode, since the cut can fall anywhere, so the text stops abruptly. Add the `readmore-fade`
class to fade the bottom edge out:

```html
<p class="excerpt readmore-fade">A long paragraph…</p>
```

<ReadmoreDemo fade :options="{ height: 80 }" />

The fade is removed while the text is expanded. Its size defaults to `2em` and follows the `--readmore-fade-size` custom
property; see [Styling](/guide/styling#fade).

`height` must be a finite number greater than `0`; anything else throws a `RangeError`. Numeric strings such as `'80'` are accepted; blank or
non-numeric strings throw a `RangeError`.

## Choosing

Use **lines** when the element holds one paragraph of text and the cut should fall on a line boundary, ellipsis
included.

Use **height** when:

- the element holds several blocks, such as paragraphs, a list or a heading. How `-webkit-line-clamp` treats several
  block children differs between browsers, while `max-height` behaves the same everywhere;
- you want the expand and collapse to be [animated](/guide/animation). Lines mode cannot be.

::: warning Both modes override `display`
While the text is collapsed, lines mode sets `display: -webkit-box` and height mode sets `display: block`, replacing
the element's own value. To clamp a flex or grid container, wrap its content in an inner element and clamp that one
instead.
:::

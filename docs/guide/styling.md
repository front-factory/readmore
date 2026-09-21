---
description: The classes and custom properties Readmore uses, how to style the toggle button, and how to hook into the expanded state.
---

# Styling

The stylesheet does one job: it clamps. Everything else, the button included, is yours.

## What the stylesheet contains

| Selector                                  | Role                                                                    |
|-------------------------------------------|-------------------------------------------------------------------------|
| `.readmore-clamp`                         | Set while collapsed. Clamps to `--readmore-lines` lines.                |
| `.readmore-clamp--height`                 | Added with it in height mode. Clamps with `max-height` instead.         |
| `.readmore-fade.readmore-clamp--height`   | Opt-in fade on the cut edge, height mode only.                          |

The script writes two custom properties on the element, and removes them when you call `destroy()`:

| Property            | Set when    | Value                        |
|---------------------|-------------|------------------------------|
| `--readmore-lines`  | Lines mode  | The `lines` option           |
| `--readmore-height` | Height mode | The `height` option, in `px` |

## The button

The button is a `<button type="button">` inserted right after the clamped element, with the class from the
`buttonClass` option (`readmore-btn` by default). It has no style of its own, so start from something like this:

```css
.readmore-btn {
    margin-top: 0.5rem;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 0.2em;
}

.readmore-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}
```

Keep a visible focus style: the button is keyboard-operable by default, and it should be obvious where it is.

### Reacting to the state

The button keeps `aria-expanded` in sync, which is also a styling hook. This adds a chevron that flips when the text is
expanded:

```css
.readmore-btn::after {
    content: '';
    display: inline-block;
    width: 0.4em;
    height: 0.4em;
    margin-left: 0.4em;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: translateY(-0.15em) rotate(45deg);
}

.readmore-btn[aria-expanded='true']::after {
    transform: translateY(0.1em) rotate(-135deg);
}
```

## The element

While the text is expanded, the element carries the class from `expandedClass` (`is-expanded` by default). Use it to
style the open state, for instance to drop a background hint that only makes sense on a clamped block:

```css
.excerpt.is-expanded {
    background: none;
}
```

The transient `is-opening` and `is-closing` classes are covered in [Animation](/guide/animation).

## Renaming the classes

Every class is an option. Use them to match an existing naming scheme:

```ts
ReadMore.init('.excerpt', {
    buttonClass: 'btn btn-link',
    expandedClass: 'is-open'
});
```

Only the three state classes and the button class are configurable. `readmore-clamp`, `readmore-clamp--height` and
`readmore-fade` are fixed, because the bundled stylesheet targets them.

## Fade

The fade is a mask on the last part of the clamped element, `2em` tall by default. Change its size with
`--readmore-fade-size`:

```html
<p class="excerpt readmore-fade" style="--readmore-fade-size: 3em">…</p>
```

It applies in height mode only. In lines mode the clamp already ends with an ellipsis.

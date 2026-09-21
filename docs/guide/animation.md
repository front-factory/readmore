---
description: Animate the expand and collapse with a max-height transition in height mode, and use the transient is-opening and is-closing classes.
---

# Animation

Lines mode cannot be animated: neither `display` nor `line-clamp` can transition. To animate, use
[height mode](/guide/modes#height) and transition `max-height`.

<ReadmoreDemo animate :options="{ height: 80 }" />

## The recipe

```ts
ReadMore.init('.excerpt', {
    height: 80
});
```

```css
.excerpt {
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
}

.excerpt.is-expanded {
    max-height: 16rem;
}

@media (prefers-reduced-motion: reduce) {
    .excerpt {
        transition: none;
    }
}
```

Three details make it work:

- **`overflow: hidden` is yours.** The plugin removes `readmore-clamp`, and the `overflow: hidden` that comes with it,
  the moment the text expands. Without your own rule, the text would appear at once and only the box would animate.
- **`max-height` on `.is-expanded` is the target.** A transition needs a value to reach, and `none` is not one.
  Choose a height a little above the tallest text you expect. The browser animates over the whole distance up to that
  value, so an oversized one makes the expansion finish early and the collapse start late, since the box has nothing to
  move through between the text's height and the target. A value too small would cut the text off.
- **Collapsing plays the same transition backwards**, from that target down to the `height` option.

## The transient classes

Two short-lived classes mark the movement itself, next to `is-expanded` which stays for the whole open state:

| Class        | Option         | Present                                    |
|--------------|----------------|--------------------------------------------|
| `is-opening` | `openingClass` | From the start of an expand, until it ends |
| `is-closing` | `closingClass` | From the start of a collapse, until it ends |

They are removed once the longest transition declared on the element has elapsed, `transition-duration` plus
`transition-delay`, or on the next tick when there is none. Use them for anything that should only run while the text is
moving:

```css
.excerpt.is-opening,
.excerpt.is-closing {
    /* Hint the browser only while the box is resizing. */
    will-change: max-height;
}
```

The overflow check that mounts or unmounts the button waits for that moment too, so the button stays where it is during
a collapse instead of vanishing halfway.

::: tip Respect reduced motion
The recipe turns the transition off under `prefers-reduced-motion: reduce`. With no transition, the transient classes
last a single tick, and the text still expands and collapses.
:::

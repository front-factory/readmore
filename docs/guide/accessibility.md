---
description: What Readmore sets on its toggle button for assistive technology, how to name several buttons distinctly, and how to translate the labels.
---

# Accessibility

The toggle is a real `<button type="button">`, so it is focusable and operable with the keyboard, `Enter` and `Space`,
without any script for it. Readmore adds what a button alone does not tell.

## What the plugin sets

| Attribute       | Value                                        | Kept in sync                     |
|-----------------|----------------------------------------------|----------------------------------|
| `aria-expanded` | `"true"` or `"false"`                        | On every toggle                  |
| `aria-controls` | The `id` of the clamped element              | Set once, when the button mounts |
| `aria-label`    | `moreLabel` or `lessLabel`, when you set one | On every toggle                  |

`aria-controls` needs an `id` to point to. If the element has none, a unique one is generated: `readmore-1`,
`readmore-2`… skipping any id already used in the page. It is removed again on `destroy()`. An `id` you set yourself is
always preserved.

The full text stays in the DOM, clamped by CSS only. Nothing is removed or rewritten.

## Naming several buttons

A page with five excerpts has five buttons that all read `Read more`. A screen reader user listing the buttons cannot
tell them apart. Give each one a distinct accessible name with `moreLabel` and `lessLabel`:

```ts
document.querySelectorAll<HTMLElement>('.product').forEach((product) => {
    const name = product.dataset.name;

    new ReadMore(product, {
        moreLabel: `Read more about ${name}`,
        lessLabel: `Read less about ${name}`
    });
});
```

Keep the visible text **inside** the label. A voice control user says the words they see on screen, and the button has
to answer to them: `Read more about Product A` does, `Details` would not.

## Translating

The visible labels are options too, so a translated site sets all four:

```ts
ReadMore.init('.excerpt', {
    moreText: 'Lire la suite',
    lessText: 'Réduire',
    moreLabel: 'Lire la suite de l’article',
    lessLabel: 'Réduire l’article'
});
```

Also set the `lang` attribute on the page or on the element, so the labels are read with the right voice.

## What it leaves to you

- **Focus.** A toggle leaves focus on the button. If the focused button is removed (the text stops overflowing, or
  `destroy()` is called), focus moves to the clamped element instead of dropping to `<body>`. The element gets a
  temporary `tabindex="-1"`, removed on blur, unless it already has a `tabindex`.
- **Announcements.** There is no live region: `aria-expanded` is what tells a screen reader the state changed.
- **Motion.** If you [animate](/guide/animation) the expansion, turn the transition off under
  `prefers-reduced-motion: reduce`.
- **Contrast and focus ring.** The button has no style, so a visible focus indicator and enough contrast are yours to
  provide. See [Styling](/guide/styling#the-button).

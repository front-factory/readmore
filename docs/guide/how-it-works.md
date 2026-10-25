---
description: How Readmore clamps with CSS, detects overflow, shares one ResizeObserver, sequences a toggle and cleans up, plus its known limits.
---

# How it works

Readmore leaves the layout to the browser. The script decides **when** to clamp and **which state** the button is in;
the stylesheet does the clamping.

## 1. Clamp

On creation, the element gets a class and a custom property:

- **Lines mode** sets `--readmore-lines` and adds `readmore-clamp`. The stylesheet turns that into
  `-webkit-line-clamp`, which ends the last visible line with an ellipsis.
- **Height mode** sets `--readmore-height` and adds `readmore-clamp` and `readmore-clamp--height`. The second class
  switches to `max-height` and `display: block`.

## 2. Detect overflow

The text overflows when its content is taller than its box: `scrollHeight - clientHeight > 1`. A difference of
one pixel or less is ignored, so a text that fits, give or take a rounding error, gets no button.

## 3. Mount the button

If the text overflows, a `<button>` is inserted right after the element (or appended to `buttonContainer` when set), with `aria-controls` pointing to it, and an
`id` is generated for the element when it has none.

If the text does not overflow, nothing is added. If it stops overflowing later, the button is removed again.

## 4. Keep watching

A single `ResizeObserver`, created with the first instance and shared by all of them, watches every clamped element.
When a batch of elements is resized, they are all **measured first**, and only then are buttons added or removed. Mixing
reads and writes would force a new layout for each element; this way the whole batch costs one.

`init()` follows the same rule: it measures all its elements in one pass before touching the DOM. A re-measure also runs
once `document.fonts.ready` resolves, since web fonts change the text's size; instances created in the same tick share
that wait.

The check does not run while the text is expanded, since there is nothing to clamp, nor during a toggle transition,
since the size is not final yet.

## 5. Toggle

`toggle()` runs, in this order:

1. Flips the classes: `readmore-clamp` (and `readmore-clamp--height`) go away when expanded, `expandedClass` comes in.
2. Updates the button's text, `aria-expanded` and `aria-label`.
3. Starts the transient class, `openingClass` or `closingClass`, for the length of the element's longest transition.
4. Calls `onToggle`, then dispatches the bubbling `readmore:toggle` event.

The transient class is cleared by a timer, not by `transitionend`: that event never fires when no declared property
actually changes, as with `transition: all` in lines mode. When the timer ends, the overflow is checked again.

## 6. Destroy

`destroy()` reverses everything: it stops observing, clears the timer, removes the button, the classes and the two custom
properties, and drops the generated `id`. The element is then ready to be initialized again.

## Limits

- **Both modes override `display`** while collapsed: `-webkit-box` in lines mode, `block` in height mode. To clamp a flex
  or grid container, clamp an inner element instead.
- **Several block children in lines mode.** How `-webkit-line-clamp` handles a `<div>` holding multiple `<p>` varies
  between browsers. For rich content, prefer [height mode](/guide/modes#height).
- **Content changes are not detected.** Only size changes are observed; after a change that keeps the element's size,
  call [`refresh()`](/guide/controlling#when-the-content-changes).
- **Lines mode cannot be animated.** Neither `display` nor `line-clamp` can transition. See
  [Animation](/guide/animation).
- **Same-size content changes are not detected.** Call [`refresh()`](/guide/controlling#when-the-content-changes).

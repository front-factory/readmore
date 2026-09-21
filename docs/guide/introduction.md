---
description: What Readmore does, what it deliberately leaves to you, and when a plain CSS line-clamp or a details element is the better tool.
---

# Introduction

Readmore clamps a block of text to a number of lines, or to a fixed height, and adds a `Read more` / `Read less`
button after it — only when the text actually overflows.

<ReadmoreDemo />

Resize your window: the button disappears when the text fits, and comes back when it does not.

## What it does

- **Clamps with CSS.** The script sets a custom property and a class; the stylesheet does the rest with
  `-webkit-line-clamp` or `max-height`. The browser stays in charge of the layout.
- **Adds the button only when needed.** A text that fits gets no button, and a button whose text stops overflowing is
  removed again.
- **Keeps the text intact.** Nothing is cut, copied or rewritten: the full text stays in the DOM, hidden by CSS only.
- **Wires the button for you.** It is a real `<button type="button">`, with `aria-expanded` and `aria-controls` kept in
  sync. See [Accessibility](/guide/accessibility).

## What it is not

- **Not a component.** There is no wrapper element, no template and no framework binding. You give it an element you
  already have.
- **Not a styled widget.** The stylesheet contains the clamping rules only. The button carries a class, and how it looks
  is up to you. See [Styling](/guide/styling).
- **Not a character truncation.** It clamps by lines or by pixels, never by counting characters or words.

## When to reach for something else

| You need…                                                | Use instead                                                             |
|----------------------------------------------------------|-------------------------------------------------------------------------|
| A fixed excerpt that never expands                       | CSS `line-clamp` alone, no JavaScript involved                          |
| A long, structured section with headings, lists and more | A native `<details>` / `<summary>`, which needs no script at all        |
| The button to exist even when the text is short          | Your own markup: Readmore only creates it when the text overflows       |

## Requirements

The published package is shipped as untranspiled ES2022 (private class members, logical assignment,
`ResizeObserver`) and runs in Chrome/Edge 85+, Firefox 90+ and Safari 15+. It has no dependency.

Importing the module is safe on a server, since it touches no DOM at load time. Creating an instance is not: call
`new ReadMore()` or `ReadMore.init()` in the browser. See [Frameworks](/guide/frameworks).

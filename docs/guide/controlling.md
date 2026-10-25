---
description: Expand or collapse programmatically, react to toggles with a callback or an event, and keep instances in sync with changing content.
---

# Controlling instances

`ReadMore.init()` and the constructor give you instances. Everything below works on them.

## Expand and collapse all

`toggle()` inverts the state. Pass a boolean to force it: `true` expands, `false` collapses. An instance already in the
requested state is left untouched, and fires neither `onToggle` nor the event.

<ReadmoreExpandAll />

```ts
const instances = ReadMore.init('.excerpt');

expandAll.addEventListener('click', () => {
    instances.forEach((instance) => instance.toggle(true));
});

collapseAll.addEventListener('click', () => {
    instances.forEach((instance) => instance.toggle(false));
});
```

Only a real boolean forces the state, so `toggle` still works as a plain event listener:
`button.addEventListener('click', () => instance.toggle())`.

## Reacting to a toggle

There are two ways to know that the text opened or closed. Both run after the DOM has been updated, `onToggle` first.

**A callback**, per instance, with the new state:

```ts
ReadMore.init('.excerpt', {
    onToggle: (expanded, instance) => {
        console.log(expanded ? 'opened' : 'closed', instance.el);
    }
});
```

**An event**, `readmore:toggle`, dispatched on the element. It bubbles, so one listener can serve every clamped element
on the page:

```ts
document.addEventListener('readmore:toggle', (event) => {
    const { expanded, instance } = event.detail;
});
```

`event.detail` is typed, on elements and on `document`, as soon as the package is imported.

If `onToggle` throws, the `readmore:toggle` event is still dispatched and the error is then re-thrown to the caller.

## Finding an instance

`ReadMore.getInstance()` returns the instance bound to an element, or `undefined`:

```ts
const instance = ReadMore.getInstance(document.querySelector<HTMLElement>('#bio')!);

instance?.toggle(true);
```

`instance.expanded` tells you the current state.

## When the content changes

Size changes are tracked for you: a single `ResizeObserver` watches every clamped element and mounts or removes the
button as the text starts or stops overflowing.

The clamp is also measured again once `document.fonts.ready` resolves, so web fonts that finish loading are handled.

A change that keeps the element's size is invisible to it. Swap the text for another one of the same height and nothing
tells the plugin. Call `refresh()` to check again:

```ts
instance.el.textContent = newText;
instance.refresh();
```

`refresh()` does nothing while the text is expanded, during a toggle transition, or once the instance is destroyed.

## Adding elements later

Run `ReadMore.init()` again after injecting new content. Elements that already have an instance keep it, and the options
you pass are **not** applied to them. Only the new elements are initialized:

```ts
list.insertAdjacentHTML('beforeend', html);
ReadMore.init('.excerpt', { lines: 3 }, list);
```

## Changing options, or stopping

Options are fixed when an instance is created. To change them, destroy the instance and create a new one:

```ts
instance.destroy();
ReadMore.init(instance.el, { lines: 5 });
```

`destroy()` restores the element: it removes the button, the classes, the two custom properties, the listeners, and the
`id` if the plugin generated it. An `id` you set yourself is never touched. Calling it again does nothing, and
`toggle()` is a no-op afterwards.

Creating an instance on an element that already has one throws an `Error`. Destroy the first one, or use `init()`, which
reuses it.

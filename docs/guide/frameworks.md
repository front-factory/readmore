---
description: Create a Readmore instance after mount and destroy it on unmount in React, Vue or any component lifecycle, and what to know about server rendering.
---

# Frameworks

Readmore has no framework binding, and needs none. The rule is the same everywhere:

1. **Create the instance once the element is in the DOM.**
2. **Destroy it when the component goes away.**

The second half matters. The instance owns a button that sits **outside** the element, next to it, and it is watched by
a `ResizeObserver`. `destroy()` removes the button and stops the observation.

## React

```tsx
import { useEffect, useRef } from 'react';
import { ReadMore } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';

export function Excerpt({ children }: { children: string }) {
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const instance = new ReadMore(ref.current!, {
            lines: 3
        });

        return () => instance.destroy();
    }, []);

    return <p ref={ref}>{children}</p>;
}
```

## Vue

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import { ReadMore } from '@frontfactory/readmore';
import '@frontfactory/readmore/style.css';

const props = defineProps<{ text: string }>();

const el = ref<HTMLElement | null>(null);
let instance: ReadMore | undefined;

onMounted(() => {
    instance = new ReadMore(el.value!, { lines: 3 });
});

// A new text of the same height goes unnoticed by the resize observer.
watch(() => props.text, () => nextTick(() => instance?.refresh()));

onBeforeUnmount(() => instance?.destroy());
</script>

<template>
  <p ref="el">{{ text }}</p>
</template>
```

## Any other framework

Use the equivalent of "after mount" and "before unmount" in yours. When the content of the element changes without its
size changing, call [`refresh()`](/guide/controlling#when-the-content-changes) once the DOM has been updated.

## Keep the button's parent stable

The button is inserted right after the clamped element, into whatever contains it. A framework that re-orders or
re-creates the siblings of that element can drop the button, or leave a second one behind.

Give the clamped element a parent that renders nothing else dynamic, and the problem does not arise.

## Server rendering

Importing `@frontfactory/readmore` on the server is safe: the module touches no DOM when it loads. Creating an instance
is not, since it needs an element and a browser. Do it in a client-only hook, `useEffect` or `onMounted` above, and never
during the render.

The server-rendered text is not clamped until then, unless you add the `readmore-clamp` class yourself, together with
`--readmore-lines`, to avoid a jump on load.

/** Text used by the live demos when a page does not provide its own. */
export const sample =
    'Readmore clamps a block of text to a number of lines, or to a fixed height, and mounts a toggle button right after it — ' +
    'but only when the text really overflows. Resize the window and the button appears or disappears on its own, because ' +
    'a single ResizeObserver keeps watching every clamped element. The stylesheet does the clamping, so the browser stays ' +
    'in charge of the layout; the script only decides when to clamp, and which state the button is in.';

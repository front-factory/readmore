/// <reference types="vite/client" />

import {
    afterEach, describe, expect, it
} from 'vitest';
import { ReadMore } from '../readmore';
import '../readmore.css';

const LINE_HEIGHT = 20;
const LONG_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(8);

const instances: ReadMore[] = [];

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeEl(text = LONG_TEXT, className = ''): HTMLElement {
    const el = document.createElement('p');

    el.className = className;
    el.textContent = text;
    el.style.width = '200px';
    el.style.margin = '0';
    el.style.font = `16px/${ LINE_HEIGHT }px monospace`;
    document.body.appendChild(el);

    return el;
}

function readMore(...args: ConstructorParameters<typeof ReadMore>): ReadMore {
    const instance = new ReadMore(...args);

    instances.push(instance);

    return instance;
}

afterEach(() => {
    instances.splice(0).forEach((instance) => instance.destroy());
    document.body.innerHTML = '';
    document.head.querySelectorAll('style[data-test]').forEach((style) => style.remove());
});

function addStyle(css: string): void {
    const style = document.createElement('style');

    style.dataset.test = '';
    style.textContent = css;
    document.head.appendChild(style);
}

describe('ReadMore in a real browser', () => {
    it('clamps to the given number of lines and mounts the button', () => {
        const el = makeEl();

        readMore(el, {
            lines: 2
        });

        expect(el.clientHeight).toBe(2 * LINE_HEIGHT);
        expect(el.scrollHeight).toBeGreaterThan(2 * LINE_HEIGHT);
        expect(el.nextElementSibling).toBeInstanceOf(HTMLButtonElement);
    });

    it('does not mount the button when the text fits', () => {
        const el = makeEl('Short text.');

        readMore(el, {
            lines: 2
        });

        expect(el.clientHeight).toBe(LINE_HEIGHT);
        expect(el.nextElementSibling).toBeNull();
    });

    it('clamps to a fixed height in height mode', () => {
        const el = makeEl();

        readMore(el, {
            height: 50
        });

        expect(el.clientHeight).toBe(50);
        expect(el.nextElementSibling).toBeInstanceOf(HTMLButtonElement);
    });

    it('fades the bottom in height mode with readmore-fade, only while collapsed', () => {
        const el = makeEl(LONG_TEXT, 'readmore-fade');
        const rm = readMore(el, {
            height: 60
        });

        expect(getComputedStyle(el).maskImage).toContain('linear-gradient');

        rm.toggle();
        expect(getComputedStyle(el).maskImage).toBe('none');
    });

    it('does not fade in lines mode', () => {
        const el = makeEl(LONG_TEXT, 'readmore-fade');

        readMore(el, {
            lines: 2
        });

        expect(getComputedStyle(el).maskImage).toBe('none');
    });

    it('expands to the full height and collapses back', () => {
        const el = makeEl();
        const rm = readMore(el, {
            lines: 2
        });

        rm.toggle();
        expect(el.clientHeight).toBe(el.scrollHeight);
        expect(el.clientHeight).toBeGreaterThan(2 * LINE_HEIGHT);

        rm.toggle();
        expect(el.clientHeight).toBe(2 * LINE_HEIGHT);
    });

    it('mounts or removes the button when the element is resized', async () => {
        const el = makeEl();

        readMore(el, {
            lines: 2
        });

        expect(el.nextElementSibling).toBeInstanceOf(HTMLButtonElement);

        el.style.width = '10000px';
        await expect.poll(() => el.nextElementSibling).toBeNull();

        el.style.width = '200px';
        await expect.poll(() => el.nextElementSibling).toBeInstanceOf(HTMLButtonElement);
    });

    it('keeps the focused button in place during a max-height collapse transition', async () => {
        addStyle(`
            .animated { transition: max-height 200ms linear; }
            .animated.is-expanded { max-height: 1000px; }
        `);

        const el = makeEl(LONG_TEXT, 'animated');
        const rm = readMore(el, {
            height: 60
        });
        const btn = el.nextElementSibling as HTMLButtonElement;

        rm.toggle();
        await wait(300);
        btn.focus();

        rm.toggle();
        // Early in the collapse, max-height is still above the content height:
        // the text does not overflow yet, but the button must stay.
        await wait(50);
        expect(el.scrollHeight - el.clientHeight).toBeLessThanOrEqual(1);
        expect(el.nextElementSibling).toBe(btn);
        expect(document.activeElement).toBe(btn);

        await wait(300);
        expect(el.clientHeight).toBe(60);
        expect(el.nextElementSibling).toBe(btn);
        expect(document.activeElement).toBe(btn);
    });

    it('removes the transient class when the declared transition animates nothing', async () => {
        const el = makeEl();

        // In lines mode, toggling only changes non-animatable properties, so no
        // `transitionend` ever fires.
        el.style.transition = 'all 100ms';

        const rm = readMore(el, {
            lines: 2
        });

        rm.toggle();
        expect(el.classList.contains('is-opening')).toBe(true);
        await expect.poll(() => el.classList.contains('is-opening'), {
            timeout: 1000
        }).toBe(false);
    });
});

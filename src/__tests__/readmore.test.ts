import {
    afterEach, beforeEach, describe, expect, it, vi 
} from 'vitest';
import { ReadMore } from '../readmore';

let triggerResize: () => void;
let resizeObserverDisconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
    resizeObserverDisconnect = vi.fn();
    const disconnect = resizeObserverDisconnect;

    vi.stubGlobal('ResizeObserver', class {
        constructor(cb: ResizeObserverCallback) {
            triggerResize = () => cb([], this as unknown as ResizeObserver);
        }
        observe = vi.fn();
        disconnect = disconnect;
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

/**
 * jsdom always reports scrollHeight/clientHeight as 0. We override the
 * getters per element so we can simulate overflow on demand.
 */
function setOverflow(el: HTMLElement, overflowing: boolean): void {
    Object.defineProperty(el, 'scrollHeight', {
        configurable: true,
        get: () => (overflowing ? 200 : 50)
    });

    Object.defineProperty(el, 'clientHeight', {
        configurable: true,
        get: () => 50
    });
}

function makeEl(overflowing = false): HTMLElement {
    const el = document.createElement('div');

    el.textContent = 'Some long content that may overflow';
    document.body.appendChild(el);
    setOverflow(el, overflowing);

    return el;
}

describe('ReadMore - constructor', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('throws TypeError when not given an HTMLElement', () => {
        expect(() => new ReadMore(null as unknown as HTMLElement)).toThrow(TypeError);
        expect(() => new ReadMore({} as HTMLElement)).toThrow(TypeError);
        expect(() => new ReadMore('div' as unknown as HTMLElement)).toThrow(TypeError);
    });

    it('throws when initialized twice on the same element', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        expect(() => new ReadMore(el)).toThrow('already initialized');
        rm.destroy();
    });

    it('allows re-initialization after destroy', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        rm.destroy();
        expect(() => new ReadMore(el)).not.toThrow();
    });

    it('getInstance returns the instance for a given element', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        expect(ReadMore.getInstance(el)).toBe(rm);
        rm.destroy();
        expect(ReadMore.getInstance(el)).toBeUndefined();
    });

    it('applies default options when none are provided', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        expect(rm.options.lines).toBe(3);
        expect(rm.options.moreText).toBe('Read more');
        expect(rm.options.lessText).toBe('Read less');
        expect(rm.options.buttonClass).toBe('readmore-btn');
        expect(rm.options.expandedClass).toBe('is-expanded');
        expect(rm.options.height).toBeUndefined();
    });

    it('merges custom options over defaults', () => {
        const el = makeEl();
        const rm = new ReadMore(el, {
            lines: 5,
            moreText: 'Plus',
            lessText: 'Moins',
            buttonClass: 'my-btn',
            expandedClass: 'open'
        });

        expect(rm.options.lines).toBe(5);
        expect(rm.options.moreText).toBe('Plus');
        expect(rm.options.lessText).toBe('Moins');
        expect(rm.options.buttonClass).toBe('my-btn');
        expect(rm.options.expandedClass).toBe('open');
    });

    it('exposes the element on the instance', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        expect(rm.el).toBe(el);
        expect(rm.expanded).toBe(false);
    });
});

describe('ReadMore - lines mode', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('sets --readmore-lines and adds the clamp class', () => {
        const el = makeEl();

        new ReadMore(el, {
            lines: 4 
        });

        expect(el.style.getPropertyValue('--readmore-lines')).toBe('4');
        expect(el.classList.contains('readmore-clamp')).toBe(true);
        expect(el.classList.contains('readmore-clamp--height')).toBe(false);
        expect(el.style.getPropertyValue('--readmore-height')).toBe('');
    });

    it('uses default lines value when not specified', () => {
        const el = makeEl();

        new ReadMore(el);
        expect(el.style.getPropertyValue('--readmore-lines')).toBe('3');
    });
});

describe('ReadMore - height mode', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('sets --readmore-height and adds both clamp classes', () => {
        const el = makeEl();

        new ReadMore(el, {
            height: 120 
        });

        expect(el.style.getPropertyValue('--readmore-height')).toBe('120px');
        expect(el.classList.contains('readmore-clamp')).toBe(true);
        expect(el.classList.contains('readmore-clamp--height')).toBe(true);
    });

    it('does not set --readmore-lines in height mode', () => {
        const el = makeEl();

        new ReadMore(el, {
            height: 80 
        });

        expect(el.style.getPropertyValue('--readmore-lines')).toBe('');
    });
});

describe('ReadMore - toggle()', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('expands and collapses, flipping classes', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);

        expect(rm.expanded).toBe(false);
        expect(el.classList.contains('readmore-clamp')).toBe(true);
        expect(el.classList.contains('is-expanded')).toBe(false);

        rm.toggle();
        expect(rm.expanded).toBe(true);
        expect(el.classList.contains('readmore-clamp')).toBe(false);
        expect(el.classList.contains('is-expanded')).toBe(true);

        rm.toggle();
        expect(rm.expanded).toBe(false);
        expect(el.classList.contains('readmore-clamp')).toBe(true);
        expect(el.classList.contains('is-expanded')).toBe(false);
    });

    it('toggles the height clamp class only in height mode', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el, {
            height: 100 
        });

        expect(el.classList.contains('readmore-clamp--height')).toBe(true);
        rm.toggle();
        expect(el.classList.contains('readmore-clamp--height')).toBe(false);
        rm.toggle();
        expect(el.classList.contains('readmore-clamp--height')).toBe(true);
    });

    it('updates the button text on toggle', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el, {
            moreText: 'More',
            lessText: 'Less' 
        });
        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn).toBeInstanceOf(HTMLButtonElement);
        expect(btn.textContent).toBe('More');

        rm.toggle();
        expect(btn.textContent).toBe('Less');

        rm.toggle();
        expect(btn.textContent).toBe('More');
    });

    it('toggles when clicking the button', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);
        const btn = el.nextElementSibling as HTMLButtonElement;

        btn.click();
        expect(rm.expanded).toBe(true);
        btn.click();
        expect(rm.expanded).toBe(false);
    });
});

describe('ReadMore - destroy()', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('removes classes and CSS variables', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el, {
            height: 100 
        });

        rm.toggle();
        rm.destroy();
        expect(el.classList.contains('readmore-clamp')).toBe(false);
        expect(el.classList.contains('readmore-clamp--height')).toBe(false);
        expect(el.classList.contains('is-expanded')).toBe(false);
        expect(el.style.getPropertyValue('--readmore-lines')).toBe('');
        expect(el.style.getPropertyValue('--readmore-height')).toBe('');
    });

    it('removes the button from the DOM', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);

        expect(el.nextElementSibling).not.toBeNull();
        rm.destroy();
        expect(el.nextElementSibling).toBeNull();
    });

    it('disconnects the ResizeObserver on destroy', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        rm.destroy();
        expect(resizeObserverDisconnect).toHaveBeenCalledOnce();
    });
});

describe('ReadMore - transient state classes', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        vi.useRealTimers();
    });

    it('applies default opening/closing class names', () => {
        const el = makeEl();
        const rm = new ReadMore(el);

        expect(rm.options.openingClass).toBe('is-opening');
        expect(rm.options.closingClass).toBe('is-closing');
    });

    it('merges custom opening/closing class names', () => {
        const el = makeEl();
        const rm = new ReadMore(el, {
            openingClass: 'opening',
            closingClass: 'closing'
        });

        expect(rm.options.openingClass).toBe('opening');
        expect(rm.options.closingClass).toBe('closing');
    });

    it('adds is-opening on expand and removes it after the fallback timeout', async () => {
        vi.useFakeTimers();
        const el = makeEl(true);
        const rm = new ReadMore(el);

        rm.toggle();
        expect(el.classList.contains('is-opening')).toBe(true);
        expect(el.classList.contains('is-closing')).toBe(false);
        vi.runAllTimers();
        expect(el.classList.contains('is-opening')).toBe(false);
    });

    it('adds is-closing on collapse and removes it after the fallback timeout', async () => {
        vi.useFakeTimers();
        const el = makeEl(true);
        const rm = new ReadMore(el);

        rm.toggle(); // expand
        vi.runAllTimers();
        rm.toggle(); // collapse
        expect(el.classList.contains('is-closing')).toBe(true);
        expect(el.classList.contains('is-opening')).toBe(false);
        vi.runAllTimers();
        expect(el.classList.contains('is-closing')).toBe(false);
    });

    it('removes the opposite transient class when toggling rapidly', () => {
        vi.useFakeTimers();
        const el = makeEl(true);
        const rm = new ReadMore(el);

        rm.toggle(); // expand -> is-opening
        expect(el.classList.contains('is-opening')).toBe(true);
        rm.toggle(); // collapse -> should remove is-opening, add is-closing
        expect(el.classList.contains('is-opening')).toBe(false);
        expect(el.classList.contains('is-closing')).toBe(true);
    });

    it('removes the transient class via transitionend when a transition is set', () => {
        const el = makeEl(true);
        // Simulate a non-zero transition duration via the prototype getter.
        const original = Object.getOwnPropertyDescriptor(
            window,
            'getComputedStyle'
        );
        const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
            ((elt: Element) => {
                const proxy = {
                    transitionDuration: '0.3s' 
                } as unknown as CSSStyleDeclaration;

                return new Proxy(proxy, {
                    get(target, prop) {
                        if (prop in target) {
                            return (target as unknown as Record<string | symbol, unknown>)[prop as string];
                        }

                        return '';
                    }
                });
            }) as typeof window.getComputedStyle
        );
        const rm = new ReadMore(el);

        rm.toggle();
        expect(el.classList.contains('is-opening')).toBe(true);
        el.dispatchEvent(new Event('transitionend'));
        expect(el.classList.contains('is-opening')).toBe(false);
        spy.mockRestore();

        if (original) {
            Object.defineProperty(window, 'getComputedStyle', original);
        }
    });

    it('uses custom class names when provided', () => {
        vi.useFakeTimers();
        const el = makeEl(true);
        const rm = new ReadMore(el, {
            openingClass: 'opening',
            closingClass: 'closing' 
        });

        rm.toggle();
        expect(el.classList.contains('opening')).toBe(true);
        vi.runAllTimers();
        expect(el.classList.contains('opening')).toBe(false);
        rm.toggle();
        expect(el.classList.contains('closing')).toBe(true);
        vi.runAllTimers();
        expect(el.classList.contains('closing')).toBe(false);
    });

    it('destroy() removes lingering transient classes', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);

        rm.toggle();
        expect(el.classList.contains('is-opening')).toBe(true);
        rm.destroy();
        expect(el.classList.contains('is-opening')).toBe(false);
        expect(el.classList.contains('is-closing')).toBe(false);
    });
});

describe('ReadMore.init - static', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns a ReadMore array from a CSS selector', () => {
        const a = makeEl();
        const b = makeEl();

        a.classList.add('rm');
        b.classList.add('rm');
        const result = ReadMore.init('.rm');

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(ReadMore);
        expect(result[1]).toBeInstanceOf(ReadMore);
    });

    it('accepts an array of HTMLElements', () => {
        const a = makeEl();
        const b = makeEl();
        const result = ReadMore.init([
            a,
            b
        ], {
            lines: 2 
        });

        expect(result).toHaveLength(2);
        expect(result[0].options.lines).toBe(2);
    });

    it('accepts a NodeList', () => {
        const a = makeEl();

        a.classList.add('rm-nl');
        const nodes = document.querySelectorAll<HTMLElement>('.rm-nl');
        const result = ReadMore.init(nodes);

        expect(result).toHaveLength(1);
    });

    it('returns an empty array when nothing matches', () => {
        const result = ReadMore.init('.does-not-exist');

        expect(result).toEqual([]);
    });
});

describe('ReadMore - button mounting based on overflow', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('does not mount the button when content does not overflow', () => {
        const el = makeEl(false);

        new ReadMore(el);
        expect(el.nextElementSibling).toBeNull();
    });

    it('mounts the button when content overflows', () => {
        const el = makeEl(true);

        new ReadMore(el);
        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn).toBeInstanceOf(HTMLButtonElement);
        expect(btn.type).toBe('button');
        expect(btn.className).toBe('readmore-btn');
        expect(btn.textContent).toBe('Read more');
    });

    it('uses the configured buttonClass', () => {
        const el = makeEl(true);

        new ReadMore(el, {
            buttonClass: 'custom-btn' 
        });

        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn.className).toBe('custom-btn');
    });

    it('sets aria-expanded="false" and aria-controls on mount', () => {
        const el = makeEl(true);

        new ReadMore(el);
        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn.getAttribute('aria-expanded')).toBe('false');
        expect(btn.getAttribute('aria-controls')).toBe(el.id);
        expect(el.id).toMatch(/^readmore-\d+$/);
    });

    it('preserves an existing id on the element', () => {
        const el = makeEl(true);

        el.id = 'my-content';
        new ReadMore(el);
        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn.getAttribute('aria-controls')).toBe('my-content');
        expect(el.id).toBe('my-content');
    });

    it('updates aria-expanded on toggle', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);
        const btn = el.nextElementSibling as HTMLButtonElement;

        expect(btn.getAttribute('aria-expanded')).toBe('false');
        rm.toggle();
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        rm.toggle();
        expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('removes the generated id on destroy', () => {
        const el = makeEl(true);
        const rm = new ReadMore(el);

        expect(el.id).toMatch(/^readmore-\d+$/);
        rm.destroy();
        expect(el.id).toBe('');
    });

    it('does not remove a pre-existing id on destroy', () => {
        const el = makeEl(true);

        el.id = 'my-content';
        const rm = new ReadMore(el);

        rm.destroy();
        expect(el.id).toBe('my-content');
    });

    it('unmounts the button when overflow disappears on resize', () => {
        const el = makeEl(true);

        new ReadMore(el);
        expect(el.nextElementSibling).not.toBeNull();

        setOverflow(el, false);
        triggerResize();
        expect(el.nextElementSibling).toBeNull();
    });

    it('mounts the button later if overflow appears on resize', () => {
        const el = makeEl(false);

        new ReadMore(el);
        expect(el.nextElementSibling).toBeNull();

        setOverflow(el, true);
        triggerResize();
        expect(el.nextElementSibling).not.toBeNull();
    });
});

/**
 * Options accepted by {@link ReadMore}. Every field is optional.
 */
export interface ReadMoreOptions {
    /**
     * Number of lines to clamp to. Ignored when {@link ReadMoreOptions.height} is set.
     *
     * @defaultValue 3
     * @throws RangeError - if not an integer greater than or equal to 1.
     */
    lines?: number;

    /**
     * Max height in pixels. Takes precedence over {@link ReadMoreOptions.lines}
     * and clamps with `max-height` instead of `-webkit-line-clamp`.
     *
     * @throws RangeError - if not a finite number greater than 0.
     */
    height?: number;

    /**
     * Label of the toggle button while the text is collapsed.
     *
     * @defaultValue 'Read more'
     */
    moreText?: string;

    /**
     * Label of the toggle button while the text is expanded.
     *
     * @defaultValue 'Read less'
     */
    lessText?: string;

    /**
     * Class applied to the toggle button.
     *
     * @defaultValue 'readmore-btn'
     */
    buttonClass?: string;

    /**
     * Class applied to the target element for the whole expanded state.
     *
     * @defaultValue 'is-expanded'
     */
    expandedClass?: string;

    /**
     * Transient class applied when expanding, removed once the longest CSS
     * transition on the element (duration + delay) has elapsed — or on the next
     * tick if no transition is declared.
     *
     * @defaultValue 'is-opening'
     */
    openingClass?: string;

    /**
     * Transient class applied when collapsing, removed once the longest CSS
     * transition on the element (duration + delay) has elapsed — or on the next
     * tick if no transition is declared.
     *
     * @defaultValue 'is-closing'
     */
    closingClass?: string;

    /**
     * Called after each toggle with the resulting state.
     *
     * @param expanded - `true` once expanded, `false` once collapsed.
     */
    onToggle?: (expanded: boolean) => void;
}

/**
 * {@link ReadMoreOptions} merged with the defaults, as exposed on
 * {@link ReadMore.options}.
 */
export type ResolvedOptions = Required<Omit<ReadMoreOptions, 'height' | 'onToggle'>> & {
    height?: number;
    onToggle?: (expanded: boolean) => void;
};

const CLAMP_CLASS = 'readmore-clamp';
const CLAMP_HEIGHT_CLASS = 'readmore-clamp--height';

const instances = new WeakMap<HTMLElement, ReadMore>();
let idCounter = 0;

const DEFAULTS: ResolvedOptions = {
    lines: 3,
    moreText: 'Read more',
    lessText: 'Read less',
    buttonClass: 'readmore-btn',
    expandedClass: 'is-expanded',
    openingClass: 'is-opening',
    closingClass: 'is-closing'
};

/**
 * Parses a computed `transition-duration` / `transition-delay` list into
 * milliseconds. Computed times are always serialized in seconds.
 */
function toMs(list: string): number[] {
    return list.split(',').map((v) => parseFloat(v) * 1000 || 0);
}

/**
 * Clamps an element to a number of lines (or a fixed height) and mounts a
 * `Read more` / `Read less` button right after it, but only while the content
 * actually overflows.
 *
 * @example
 * ```ts
 * import { ReadMore } from '@frontfactory/readmore';
 * import '@frontfactory/readmore/style.css';
 *
 * ReadMore.init('.excerpt', { lines: 3 });
 * ```
 */
export class ReadMore {
    /** The clamped element. */
    readonly el: HTMLElement;

    /** The options this instance was built with, merged with the defaults. */
    readonly options: ResolvedOptions;

    #button: HTMLButtonElement | null = null;
    #expanded = false;
    #generatedId = false;
    #resizeObserver: ResizeObserver;
    #transientTimer: ReturnType<typeof setTimeout> | null = null;
    #onClick = (): void => this.toggle();

    /**
     * @param element - The element to clamp.
     * @param options - See {@link ReadMoreOptions}.
     * @throws TypeError - if `element` is not an `HTMLElement`.
     * @throws Error - if `element` is already initialized; call
     * {@link ReadMore.destroy} first.
     * @throws RangeError - if `lines` is not an integer greater than or equal
     * to 1, or `height` is not a finite number greater than 0.
     */
    constructor(element: HTMLElement, options: ReadMoreOptions = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError('ReadMore: an HTMLElement is required.');
        }

        if (instances.has(element)) {
            throw new Error('ReadMore: element is already initialized. Call destroy() first.');
        }

        this.el = element;
        // Options explicitly set to `undefined` must not override the defaults.
        this.options = {
            ...DEFAULTS,
            ...Object.fromEntries(Object.entries(options).filter((entry) => entry[1] !== undefined))
        };

        const { height, lines } = this.options;

        if (height != null && !(Number.isFinite(height) && height > 0)) {
            throw new RangeError('ReadMore: height must be a finite number greater than 0.');
        }

        if (!(Number.isInteger(lines) && lines >= 1)) {
            throw new RangeError('ReadMore: lines must be an integer of at least 1.');
        }

        this.#resizeObserver = new ResizeObserver(() => this.#refresh());
        instances.set(element, this);
        this.#init();
    }

    /**
     * Instantiates {@link ReadMore} on every matching element.
     *
     * @param target - A CSS selector, a `NodeList` or an array of elements.
     * @param options - See {@link ReadMoreOptions}.
     * @returns One instance per element, in document order.
     */
    static init(
        target: string | NodeListOf<HTMLElement> | HTMLElement[],
        options?: ReadMoreOptions
    ): ReadMore[] {
        const nodes =
            typeof target === 'string'
                ? document.querySelectorAll<HTMLElement>(target)
                : target;

        return Array.from(nodes).map((n) => new ReadMore(n, options));
    }

    /** Whether the text is currently expanded. */
    get expanded(): boolean {
        return this.#expanded;
    }

    /**
     * Expands or collapses the text, updating the button label, the
     * `aria-expanded` attribute and the state classes, then calls
     * {@link ReadMoreOptions.onToggle}.
     */
    toggle(): void {
        this.#expanded = !this.#expanded;
        this.el.classList.toggle(CLAMP_CLASS, !this.#expanded);

        if (this.options.height != null) {
            this.el.classList.toggle(CLAMP_HEIGHT_CLASS, !this.#expanded);
        }

        this.el.classList.toggle(this.options.expandedClass, this.#expanded);

        if (this.#button) {
            this.#button.textContent = this.#expanded
                ? this.options.lessText
                : this.options.moreText;

            this.#button.setAttribute('aria-expanded', String(this.#expanded));
        }

        const stateClass = this.#expanded ? this.options.openingClass : this.options.closingClass;
        const otherClass = this.#expanded ? this.options.closingClass : this.options.openingClass;

        this.el.classList.remove(otherClass);
        this.#applyTransientClass(stateClass);
        this.options.onToggle?.(this.#expanded);
    }

    /**
     * @param element - An element possibly initialized by this plugin.
     * @returns The instance bound to it, or `undefined`.
     */
    static getInstance(element: HTMLElement): ReadMore | undefined {
        return instances.get(element);
    }

    /**
     * Restores the element: removes the button, the classes, the CSS custom
     * properties, the listeners and the generated `id`. The element can then be
     * initialized again.
     */
    destroy(): void {
        instances.delete(this.el);
        this.#resizeObserver.disconnect();

        if (this.#transientTimer !== null) {
            clearTimeout(this.#transientTimer);
            this.#transientTimer = null;
        }

        this.#unmountButton();
        this.el.classList.remove(
            CLAMP_CLASS,
            CLAMP_HEIGHT_CLASS,
            this.options.expandedClass,
            this.options.openingClass,
            this.options.closingClass
        );

        this.el.style.removeProperty('--readmore-lines');
        this.el.style.removeProperty('--readmore-height');

        if (this.#generatedId) {
            this.el.removeAttribute('id');
            this.#generatedId = false;
        }
    }

    #init(): void {
        if (this.options.height != null) {
            this.el.style.setProperty('--readmore-height', `${ this.options.height }px`);
            this.el.classList.add(CLAMP_CLASS, CLAMP_HEIGHT_CLASS);
        } else {
            this.el.style.setProperty('--readmore-lines', String(this.options.lines));
            this.el.classList.add(CLAMP_CLASS);
        }

        this.#resizeObserver.observe(this.el);
        this.#refresh();
    }

    #isOverflowing(): boolean {
        return this.el.scrollHeight - this.el.clientHeight > 1;
    }

    #refresh(): void {
        // While a toggle transition runs, the element's size is not final: measuring
        // it mid-collapse would remove the button. The timer refreshes once it ends.
        if (this.#expanded || this.#transientTimer !== null) {
            return;
        }

        const overflowing = this.#isOverflowing();

        if (overflowing && !this.#button) {
            this.#mountButton();
        } else if (!overflowing && this.#button) {
            this.#unmountButton();
        }
    }

    #applyTransientClass(stateClass: string): void {
        if (this.#transientTimer !== null) {
            clearTimeout(this.#transientTimer);
        }

        this.el.classList.add(stateClass);

        // A timer rather than `transitionend`, which never fires when no declared
        // property actually changes (e.g. `transition: all` in lines mode).
        this.#transientTimer = setTimeout(() => {
            this.#transientTimer = null;
            this.el.classList.remove(stateClass);
            this.#refresh();
        }, this.#transitionTime());
    }

    /** Longest `duration + delay` among the transitions declared on the element, in ms. */
    #transitionTime(): number {
        const style = getComputedStyle(this.el);
        const durations = toMs(style.transitionDuration);
        const delays = toMs(style.transitionDelay);
        let max = 0;

        // Shorter lists repeat to match the longer one, as CSS does.
        for (let i = 0; i < Math.max(durations.length, delays.length); i++) {
            max = Math.max(max, durations[i % durations.length] + delays[i % delays.length]);
        }

        return max;
    }

    #mountButton(): void {
        if (!this.el.id) {
            this.el.id = `readmore-${++idCounter}`;
            this.#generatedId = true;
        }

        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = this.options.buttonClass;
        btn.textContent = this.options.moreText;
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', this.el.id);
        btn.addEventListener('click', this.#onClick);
        this.el.insertAdjacentElement('afterend', btn);
        this.#button = btn;
    }

    #unmountButton(): void {
        if (!this.#button) {
            return;
        }

        this.#button.removeEventListener('click', this.#onClick);
        this.#button.remove();
        this.#button = null;
    }
}

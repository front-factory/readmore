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
     * Accessible name (`aria-label`) of the toggle button while the text is
     * collapsed, e.g. `'Read more about Product A'` when several buttons share
     * the same visible text. It should contain {@link ReadMoreOptions.moreText}.
     */
    moreLabel?: string;

    /**
     * Accessible name (`aria-label`) of the toggle button while the text is
     * expanded. It should contain {@link ReadMoreOptions.lessText}.
     */
    lessLabel?: string;

    /**
     * Class applied to the toggle button.
     *
     * @defaultValue 'readmore-btn'
     */
    buttonClass?: string;

    /**
     * Element the toggle button is appended to, instead of being inserted right
     * after the clamped element. Use an element owned by your framework (a ref)
     * so reconciliation cannot drop the button.
     *
     * @throws TypeError - if not an `HTMLElement`.
     */
    buttonContainer?: HTMLElement;

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
     * Called after each toggle with the resulting state, right before the
     * `readmore:toggle` event is dispatched.
     *
     * @param expanded - `true` once expanded, `false` once collapsed.
     * @param instance - The instance that was toggled.
     */
    onToggle?: (expanded: boolean, instance: ReadMore) => void;
}

type OptionalKeys = 'height' | 'buttonContainer' | 'moreLabel' | 'lessLabel' | 'onToggle';

/**
 * {@link ReadMoreOptions} merged with the defaults, as exposed on
 * {@link ReadMore.options}.
 */
export type ResolvedOptions = Required<Omit<ReadMoreOptions, OptionalKeys>> & Pick<ReadMoreOptions, OptionalKeys>;

/** `detail` of the `readmore:toggle` event. */
export interface ReadMoreToggleDetail {
    /** `true` once expanded, `false` once collapsed. */
    expanded: boolean;

    /** The instance that was toggled. */
    instance: ReadMore;
}

// Types `event.detail` in `addEventListener('readmore:toggle', …)`, on elements
// and on `document` (the event bubbles).
declare global {
    interface HTMLElementEventMap {
        'readmore:toggle': CustomEvent<ReadMoreToggleDetail>;
    }

    interface DocumentEventMap {
        'readmore:toggle': CustomEvent<ReadMoreToggleDetail>;
    }
}

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
    /** Shared by every instance, created with the first one. */
    static #resizeObserver: ResizeObserver | undefined;

    /** Instances created by the running {@link ReadMore.init}, synced together once all exist. */
    static #batch: ReadMore[] | null = null;

    /** Instances waiting for `document.fonts.ready`, measured together. */
    static #fontQueue: ReadMore[] | null = null;

    /** Live instances resynced by the shared `document.fonts` `loadingdone` listener. */
    static #live = new Set<ReadMore>();

    /** The `document.fonts` the shared listener is attached to. */
    static #fonts: FontFaceSet | undefined;

    /** The clamped element. */
    readonly el: HTMLElement;

    /** The options this instance was built with, merged with the defaults. */
    readonly options: Readonly<ResolvedOptions>;

    #button: HTMLButtonElement | null = null;
    #expanded = false;
    #generatedId = false;
    #transientTimer: ReturnType<typeof setTimeout> | null = null;
    #onClick = (): void => this.toggle();

    // Destroyed once the element is no longer bound to this instance: after
    // destroy(), or if the element was re-initialized by another instance.
    get #destroyed(): boolean {
        return instances.get(this.el) !== this;
    }

    /**
     * @param element - The element to clamp.
     * @param options - See {@link ReadMoreOptions}.
     * @throws TypeError - if `element` is not an `HTMLElement`, or there is no
     * `HTMLElement` at all (no browser, e.g. SSR).
     * @throws Error - if `element` is already initialized; call
     * {@link ReadMore.destroy} first.
     * @throws RangeError - if `lines` is not an integer greater than or equal
     * to 1, or `height` is not a finite number greater than 0.
     * @throws RangeError - if `expandedClass`, `openingClass` or `closingClass`
     * is not a string or contains whitespace (an empty string means the default).
     * @throws TypeError - if `buttonContainer` is set but is not an `HTMLElement`.
     */
    constructor(element: HTMLElement, options: ReadMoreOptions = {}) {
        if (typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement)) {
            throw new TypeError('ReadMore: an HTMLElement is required.');
        }

        if (instances.has(element)) {
            throw new Error('ReadMore: element is already initialized. Call destroy() first.');
        }

        this.el = element;
        // Options explicitly set to `undefined` (or an empty state class) must not override the defaults.
        this.options = {
            ...DEFAULTS,
            ...Object.fromEntries(Object.entries(options).filter((entry) => entry[1] !== undefined
                && !(entry[1] === '' && entry[0].endsWith('Class'))))
        };

        // Numeric strings (data-* attributes, framework props) are accepted; blank or non-numeric ones still fail below.
        for (const key of [
            'height',
            'lines'
        ] as const) {
            const value: unknown = this.options[key];

            if (typeof value === 'string' && value.trim() !== '') {
                (this.options as Record<string, unknown>)[key] = Number(value);
            }
        }

        const { height, lines, buttonContainer } = this.options;

        if (buttonContainer != null && !(buttonContainer instanceof HTMLElement)) {
            throw new TypeError('ReadMore: buttonContainer must be an HTMLElement.');
        }

        if (height != null && !(Number.isFinite(height) && height > 0)) {
            throw new RangeError('ReadMore: height must be a finite number greater than 0.');
        }

        if (!(Number.isInteger(lines) && lines >= 1)) {
            throw new RangeError('ReadMore: lines must be an integer of at least 1.');
        }

        for (const key of [
            'expandedClass',
            'openingClass',
            'closingClass'
        ] as const) {
            const value: unknown = this.options[key];

            if (typeof value !== 'string' || !/^\S+$/.test(value)) {
                throw new RangeError(`ReadMore: ${key} must be a string without whitespace.`);
            }
        }

        instances.set(element, this);
        this.#init();
    }

    /**
     * Instantiates {@link ReadMore} on every matching element. Elements that are
     * already initialized are left untouched and their existing instance is
     * returned, so it is safe to call again after new content is added.
     *
     * @param target - A CSS selector, an element, or any iterable or array-like
     * of elements (`NodeList`, `HTMLCollection`, array, `Set`…).
     * @param options - See {@link ReadMoreOptions}. Not applied to elements
     * that are already initialized.
     * @param root - Where to look for `target` when it is a selector. Defaults to `document`.
     * @returns One instance per element, in document order; `[]` without a
     * browser (e.g. SSR).
     */
    static init(
        target: string | HTMLElement | Iterable<HTMLElement> | ArrayLike<HTMLElement>,
        options?: ReadMoreOptions,
        root?: ParentNode
    ): ReadMore[] {
        if (typeof HTMLElement === 'undefined' || typeof document === 'undefined') {
            return [];
        }

        const nodes =
            typeof target === 'string'
                ? (root ?? document).querySelectorAll<HTMLElement>(target)
                : target instanceof HTMLElement ? [
                    target
                ] : target;

        const batch: ReadMore[] = [];

        ReadMore.#batch = batch;

        try {
            return Array.from(nodes).map((n) => instances.get(n) ?? new ReadMore(n, options));
        } finally {
            ReadMore.#batch = null;
            ReadMore.#syncAll(batch);
        }
    }

    /** Whether the text is currently expanded. */
    get expanded(): boolean {
        return this.#expanded;
    }

    /**
     * Expands or collapses the text, updating the button label, the
     * `aria-expanded` attribute and the state classes, then calls
     * {@link ReadMoreOptions.onToggle} and dispatches a bubbling
     * `readmore:toggle` event on the element. Does nothing once destroyed.
     *
     * @param force - `true` to expand, `false` to collapse; the state is
     * inverted when omitted. Does nothing if the text is already in the
     * requested state.
     */
    toggle(force?: boolean): void {
        // Only a real boolean forces the state, so `toggle` still works as an
        // event listener (`addEventListener('click', rm.toggle.bind(rm))`).
        const expanded = typeof force === 'boolean' ? force : !this.#expanded;

        if (this.#destroyed || expanded === this.#expanded) {
            return;
        }

        this.#expanded = expanded;
        this.el.classList.toggle(CLAMP_CLASS, !this.#expanded);

        if (this.options.height != null) {
            this.el.classList.toggle(CLAMP_HEIGHT_CLASS, !this.#expanded);
        }

        this.el.classList.toggle(this.options.expandedClass, this.#expanded);
        this.#updateButton();

        const stateClass = this.#expanded ? this.options.openingClass : this.options.closingClass;
        const otherClass = this.#expanded ? this.options.closingClass : this.options.openingClass;

        this.el.classList.remove(otherClass);
        this.#applyTransientClass(stateClass);

        try {
            this.options.onToggle?.(this.#expanded, this);
        } finally {
            // The event is dispatched even if `onToggle` throws (the error still propagates).
            this.el.dispatchEvent(new CustomEvent<ReadMoreToggleDetail>('readmore:toggle', {
                bubbles: true,
                detail: {
                    expanded: this.#expanded,
                    instance: this
                }
            }));
        }
    }

    /**
     * Checks again whether the content overflows, mounting or unmounting the
     * button. Resizes of the element are already tracked; call it after
     * changing the content in a way that keeps the element's size. Does nothing
     * while expanded, during a toggle transition, or once destroyed.
     */
    refresh(): void {
        this.#sync(this.#isOverflowing());
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
     * initialized again. Calling it again does nothing.
     */
    destroy(): void {
        if (this.#destroyed) {
            return;
        }

        instances.delete(this.el);
        ReadMore.#resizeObserver?.unobserve(this.el);

        if (ReadMore.#live.delete(this) && ReadMore.#live.size === 0) {
            ReadMore.#fonts?.removeEventListener?.('loadingdone', ReadMore.#onFontsLoaded);
            ReadMore.#fonts = undefined;
        }

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

    // Measures every resized element before touching the DOM, so mounting a
    // button does not force a new layout for each following element.
    static #onResize(entries: ResizeObserverEntry[]): void {
        ReadMore.#syncAll(entries.map((entry) => instances.get(entry.target as HTMLElement)));
    }

    static #onFontsLoaded = (): void => {
        ReadMore.#syncAll(Array.from(ReadMore.#live));
    };

    static #syncAll(list: (ReadMore | undefined)[]): void {
        const measured = new Map<ReadMore, boolean>();

        for (const instance of list) {
            if (instance) {
                measured.set(instance, instance.#isOverflowing());
            }
        }

        measured.forEach((overflowing, instance) => instance.#sync(overflowing));
    }

    #init(): void {
        if (this.options.height != null) {
            this.el.style.setProperty('--readmore-height', `${ this.options.height }px`);
            this.el.classList.add(CLAMP_CLASS, CLAMP_HEIGHT_CLASS);
        } else {
            this.el.style.setProperty('--readmore-lines', String(this.options.lines));
            this.el.classList.add(CLAMP_CLASS);
        }

        ReadMore.#resizeObserver ??= new ResizeObserver(ReadMore.#onResize);
        ReadMore.#resizeObserver.observe(this.el);

        // Inside init(), the batch measures all elements at once afterwards.
        if (ReadMore.#batch) {
            ReadMore.#batch.push(this);
        } else {
            this.refresh();
        }

        this.#refreshOnFonts();
    }

    // A font swap can change the overflow without resizing the element, which the
    // ResizeObserver would miss. Instances created in the same tick share one
    // measurement; destroyed ones are skipped by #sync.
    #refreshOnFonts(): void {
        if (typeof document === 'undefined' || !document.fonts) {
            return;
        }

        // Fonts loaded later (after `ready`) are caught by one shared listener.
        if (ReadMore.#fonts !== document.fonts) {
            ReadMore.#fonts?.removeEventListener?.('loadingdone', ReadMore.#onFontsLoaded);
            ReadMore.#fonts = document.fonts;
            ReadMore.#fonts.addEventListener?.('loadingdone', ReadMore.#onFontsLoaded);
        }

        ReadMore.#live.add(this);

        if (ReadMore.#fontQueue) {
            ReadMore.#fontQueue.push(this);

            return;
        }

        const queue: ReadMore[] = ReadMore.#fontQueue = [
            this
        ];

        void document.fonts.ready.then(() => {
            ReadMore.#fontQueue = null;
            ReadMore.#syncAll(queue.filter((instance) => !instance.#destroyed));
        });
    }

    #isOverflowing(): boolean {
        return this.el.scrollHeight - this.el.clientHeight > 1;
    }

    #sync(overflowing: boolean): void {
        // While a toggle transition runs, the element's size is not final: measuring
        // it mid-collapse would remove the button. The timer refreshes once it ends.
        if (this.#expanded || this.#transientTimer !== null || this.#destroyed) {
            return;
        }

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
        const timer = setTimeout(() => {
            // Some engines (WebKit) start the transition later than the timer assumes:
            // wait for it to end, or the size is measured mid-way and the button remounted.
            const running = this.el.getAnimations?.().filter(a => a instanceof CSSTransition) ?? [];
            const done = () => {
                // Superseded by another toggle, or destroyed meanwhile.
                if (this.#transientTimer !== timer) {
                    return;
                }

                this.#transientTimer = null;
                this.el.classList.remove(stateClass);
                this.refresh();
            };

            if (running.length) {
                Promise.allSettled(running.map(a => a.finished)).then(done);
            } else {
                done();
            }
        }, this.#transitionTime());

        this.#transientTimer = timer;
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
            let id: string;

            // Skip ids already used in the page (server-rendered markup, another copy of the plugin…).
            do {
                id = `readmore-${++idCounter}`;
            } while (document.getElementById(id));

            this.el.id = id;
            this.#generatedId = true;
        }

        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = this.options.buttonClass;
        btn.setAttribute('aria-controls', this.el.id);
        btn.addEventListener('click', this.#onClick);
        this.#button = btn;
        this.#updateButton();

        if (this.options.buttonContainer) {
            this.options.buttonContainer.appendChild(btn);
        } else {
            this.el.insertAdjacentElement('afterend', btn);
        }
    }

    /** Syncs the button's text, `aria-expanded` and `aria-label` with the state. */
    #updateButton(): void {
        if (!this.#button) {
            return;
        }

        const { moreText, lessText, moreLabel, lessLabel } = this.options;
        const label = this.#expanded ? lessLabel : moreLabel;

        this.#button.textContent = this.#expanded ? lessText : moreText;
        this.#button.setAttribute('aria-expanded', String(this.#expanded));

        if (label) {
            this.#button.setAttribute('aria-label', label);
        } else {
            this.#button.removeAttribute('aria-label');
        }
    }

    #unmountButton(): void {
        if (!this.#button) {
            return;
        }

        this.#button.removeEventListener('click', this.#onClick);

        // Removing the focused button would drop focus to <body>: keep it on the element.
        if (document.activeElement === this.#button) {
            const { el } = this;

            if (!el.hasAttribute('tabindex')) {
                el.tabIndex = -1;
                el.addEventListener('blur', () => el.removeAttribute('tabindex'), {
                    once: true
                });
            }

            el.focus();
        }

        this.#button.remove();
        this.#button = null;
    }
}

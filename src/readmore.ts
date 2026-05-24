export interface ReadMoreOptions {
    lines?: number;
    height?: number;
    moreText?: string;
    lessText?: string;
    buttonClass?: string;
    expandedClass?: string;
    openingClass?: string;
    closingClass?: string;
}

type ResolvedOptions = Required<Omit<ReadMoreOptions, 'height'>> & { height?: number };

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

export class ReadMore {
    readonly el: HTMLElement;
    readonly options: ResolvedOptions;

    #button: HTMLButtonElement | null = null;
    #expanded = false;
    #generatedId = false;
    #resizeObserver: ResizeObserver;
    #transitionEndListener: ((e: TransitionEvent) => void) | null = null;
    #onClick = (): void => this.toggle();

    constructor(element: HTMLElement, options: ReadMoreOptions = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError('ReadMore: an HTMLElement is required.');
        }

        if (instances.has(element)) {
            throw new Error('ReadMore: element is already initialized. Call destroy() first.');
        }

        this.el = element;
        this.options = {
            ...DEFAULTS,
            ...options 
        };

        this.#resizeObserver = new ResizeObserver(() => this.#refresh());
        instances.set(element, this);
        this.#init();
    }

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

    get expanded(): boolean {
        return this.#expanded;
    }

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

        if (!this.#expanded) {
            this.#refresh();
        }
    }

    static getInstance(element: HTMLElement): ReadMore | undefined {
        return instances.get(element);
    }

    destroy(): void {
        instances.delete(this.el);
        this.#resizeObserver.disconnect();

        if (this.#transitionEndListener) {
            this.el.removeEventListener('transitionend', this.#transitionEndListener);
            this.#transitionEndListener = null;
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
        if (this.#expanded) {
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
        if (this.#transitionEndListener) {
            this.el.removeEventListener('transitionend', this.#transitionEndListener);
            this.#transitionEndListener = null;
        }

        this.el.classList.add(stateClass);
        const remove = (): void => this.el.classList.remove(stateClass);
        const duration = getComputedStyle(this.el).transitionDuration;
        const hasTransition = duration
            .split(',')
            .some((d) => parseFloat(d) > 0);

        if (!hasTransition) {
            setTimeout(remove, 0);

            return;
        }

        const onEnd = (e: TransitionEvent): void => {
            if (e.target !== this.el) {
                return;
            }

            this.el.removeEventListener('transitionend', onEnd);
            this.#transitionEndListener = null;
            remove();
        };

        this.#transitionEndListener = onEnd;
        this.el.addEventListener('transitionend', onEnd);
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

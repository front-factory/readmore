export interface ReadMoreOptions {
    lines?: number;
    height?: number;
    moreText?: string;
    lessText?: string;
    buttonClass?: string;
    expandedClass?: string;
}

type ResolvedOptions = Required<Omit<ReadMoreOptions, 'height'>> & { height?: number };

const CLAMP_CLASS = 'readmore-clamp';
const CLAMP_HEIGHT_CLASS = 'readmore-clamp--height';

const DEFAULTS: ResolvedOptions = {
    lines: 3,
    moreText: 'Read more',
    lessText: 'Read less',
    buttonClass: 'readmore-btn',
    expandedClass: 'is-expanded'
};

export class ReadMore {
    readonly el: HTMLElement;
    readonly options: ResolvedOptions;

    #button: HTMLButtonElement | null = null;
    #expanded = false;
    #onResize = (): void => this.#refresh();
    #onClick = (): void => this.toggle();

    constructor(element: HTMLElement, options: ReadMoreOptions = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError('ReadMore: an HTMLElement is required.');
        }
        this.el = element;
        this.options = { ...DEFAULTS, ...options };
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
        }
        if (!this.#expanded) this.#refresh();
    }

    destroy(): void {
        window.removeEventListener('resize', this.#onResize);
        this.#unmountButton();
        this.el.classList.remove(CLAMP_CLASS, CLAMP_HEIGHT_CLASS, this.options.expandedClass);
        this.el.style.removeProperty('--readmore-lines');
        this.el.style.removeProperty('--readmore-height');
    }

    #init(): void {
        if (this.options.height != null) {
            this.el.style.setProperty('--readmore-height', `${this.options.height}px`);
            this.el.classList.add(CLAMP_CLASS, CLAMP_HEIGHT_CLASS);
        } else {
            this.el.style.setProperty('--readmore-lines', String(this.options.lines));
            this.el.classList.add(CLAMP_CLASS);
        }
        window.addEventListener('resize', this.#onResize);
        this.#refresh();
    }

    #isOverflowing(): boolean {
        return this.el.scrollHeight - this.el.clientHeight > 1;
    }

    #refresh(): void {
        if (this.#expanded) return;
        const overflowing = this.#isOverflowing();
        if (overflowing && !this.#button) {
            this.#mountButton();
        } else if (!overflowing && this.#button) {
            this.#unmountButton();
        }
    }

    #mountButton(): void {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = this.options.buttonClass;
        btn.textContent = this.options.moreText;
        btn.addEventListener('click', this.#onClick);
        this.el.insertAdjacentElement('afterend', btn);
        this.#button = btn;
    }

    #unmountButton(): void {
        if (!this.#button) return;
        this.#button.removeEventListener('click', this.#onClick);
        this.#button.remove();
        this.#button = null;
    }
}

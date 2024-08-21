import { delayedLastCancellable } from './debounce';

export class TouchHint extends HTMLElement {
    static observedAttributes = ['hint'];

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                .touch-hint {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(0, 0, 0, 0.7);
                    color: white;
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    text-align: center;
                    opacity: 0;
                    transition: opacity 0.3s linear;
                    user-select: none;
                }
            </style>
            <div class="touch-hint">${this.hint}</div>
        `;

        const showHint = delayedLastCancellable(function (this: HTMLDivElement, e: TouchEvent) {
            if (e.targetTouches.length == 1) {
                this.style.opacity = '1';
            } else {
                this.style.opacity = '0';
            }
        }, 200);
        const touchHint = shadow.querySelector<HTMLDivElement>('.touch-hint')!;
        touchHint.addEventListener('touchstart', showHint.action);
        touchHint.addEventListener('touchend', function () {
            this.style.opacity = '0';
            showHint.cancel();
        });
    }

    public get hint(): string {
        return this.getAttribute("hint") ?? '';
    }

    public set hint(value: string) {
        this.setAttribute('hint', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.shadowRoot)
            return;

        if (name == 'hint') {
            this.shadowRoot.querySelector('.touch-hint')!.innerHTML = this.hint;
        }
    }
}

customElements.define('touch-hint', TouchHint);
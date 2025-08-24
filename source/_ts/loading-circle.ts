class LoadingCircle extends HTMLElement {
    static observedAttributes = ['total', 'progress'];

    constructor() {
        super();
    }

    connectedCallback() {
        // attaches shadow tree and returns shadow root reference
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
        const shadow = this.attachShadow({ mode: 'open' });

        // creating a container for the editable-list component
        const container = document.createElement('div');

        // adding a class to our container for the sake of clarity
        container.classList.add('container');

        // creating the inner HTML of the editable list element
        container.innerHTML = `
            <style>
            :host {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }

            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
            }
            .progress {
                width: 200px;
                height: 240px;
            }
            .progress .track, .progress .fill {
                fill: rgba(0, 0, 0, 0);
                stroke-width: 30;
                transform: translate(290px, 800px)rotate(-120deg);
            }
            .progress .track {
                stroke: rgb(56, 71, 83);
            }
            .progress .fill {
                stroke: rgb(255, 255, 255);
                stroke-linecap: round;
                stroke-dasharray: ${this.fullStrokeLength};
                stroke-dashoffset: ${this.fullStrokeLength};
                transition: stroke-dashoffset 1s;
            }
            .progress .fill.undetermined {
                animation-duration: 2s;
                animation-name: undetermined;
                animation-iteration-count: infinite;
                animation-direction: normal;
                animation-timing-function: linear;
                stroke-dasharray: ${this.fullStrokeLength / 2} ${this.fullStrokeLength / 2}
            }
            .progress.blue .fill {
                stroke: rgb(104, 214, 198);
            }
            .progress .value, .progress .text {
                font-family: 'Open Sans';
                fill: rgb(255, 255, 255);
                text-anchor: middle;
            }
            .progress .value {
                font-size: 180px;
            }
            .progress .text {
                font-size: 120px;
            }
            .noselect {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                cursor: default;
            }

            @keyframes undetermined {
                from {
                    stroke-dashoffset: 0
                }
                to {
                    stroke-dashoffset: ${this.fullStrokeLength}
                }
            }
            </style>
            <svg class="progress noselect" x="0px" y="0px" viewBox="0 0 776 628">
                <path class="track" d="M723 314L543 625.77 183 625.77 3 314 183 2.23 543 2.23 723 314z"></path>
                <path class="fill" style="${this.fillStyle}" d="M723 314L543 625.77 183 625.77 3 314 183 2.23 543 2.23 723 314z"></path>
                <text class="value" x="50%" y="61%">${this.text}</text>
            </svg>
        `;

        // appending the container to the shadow DOM
        shadow.appendChild(container);
    }

    private get fullStrokeLength(): number {
        return 2160;
    }

    private get percentage(): number {
        const percentage = Math.round(this.progress / this.total * 100);
        if (isNaN(percentage))
            return 0;
        return percentage;
    }

    private get isUndetermined(): boolean {
        return this.progress >= 0 && this.total <= 0;
    }

    private get fillStyle(): string {
        return 'stroke-dashoffset: ' + ((100 - this.percentage) / 100) * this.fullStrokeLength;
    }

    private get text(): string {
        if (this.isUndetermined) {
            return "...";
        }
        return this.percentage + '%';
    }

    private update() {
        //debounce?
        const fill = this.shadowRoot!.querySelector('.fill')!;
        if (this.isUndetermined) {
            if (!fill.classList.contains('undetermined')) {
                fill.classList.add('undetermined');
            }
            fill.setAttribute('style', '');
        } else {
            fill.setAttribute('style', this.fillStyle);
            fill.classList.remove('undetermined');
        }
        this.shadowRoot!.querySelector('.value')!.innerHTML = this.text;
    }

    get total(): number {
        const total = parseFloat(this.getAttribute('total') ?? '');
        if (isNaN(total))
            return 0;
        return total;
    }

    set total(value: number) {
        this.setAttribute('total', '' + value);
    }

    get progress(): number {
        const progress = parseFloat(this.getAttribute('progress') ?? '');
        if (isNaN(progress))
            return 0;
        return progress;
    }

    set progress(value: number) {
        this.setAttribute('progress', '' + value);
    }

    attributeChangedCallback() {
        this.update();
    }
}

customElements.define('loading-circle', LoadingCircle);

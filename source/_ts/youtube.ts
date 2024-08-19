class Youtube extends HTMLElement {
    static observedAttributes = ['aspect-ratio', 'video-id', 'banner-text'];

    connectedCallback() {
        this.innerHTML = `
            <style>
                .youtube > iframe {
                    height: auto;
                    width: 100%;
                }

                youtube-logo {
                    cursor: pointer;
                }

                .youtube_banner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--body-bg-color);
                    border-radius: 2em;
                }

                .btn.youtube_banner_text {
                    margin-top: 2em;
                    margin-bottom: 0;
                }

            </style>
            <div class="youtube">
                ${ this.showBanner ? `
                    <div class="youtube_banner" style="aspect-ratio: ${this.aspectRatio}">
                        <youtube-logo role="button" aria-label="${this.bannerText}"></youtube-logo>
                        <button type="button" class="btn youtube_banner_text">${this.bannerText}</button>
                    </div>` : this.youtubeIframe}
            <div>
        `;

        if (this.showBanner) {
            this.querySelector<YoutubeLogo>('youtube-logo')!.addEventListener('click', this.bannerClicked);
            this.querySelector('button')!.addEventListener('click', this.bannerClicked);
        }
    }

    private bannerClicked() {
        localStorage.setItem('hideYoutubeBanner', 'true');
        document.querySelectorAll('my-youtube').forEach(e => {
            if (e instanceof Youtube) {
                e.removeBanner();
            }
        });
    }

    private removeBanner() {
        const youtube = this.querySelector('.youtube');
        if (youtube)
            youtube.innerHTML = this.youtubeIframe;
    }

    private get youtubeIframe(): string {
        return `<iframe src="${this.videoLink}" style="aspect-ratio: ${this.aspectRatio}" title="Youtube video player" frameborder="0" allow="autoplay; fullscreen;" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen"></iframe>`;
    }

    private get showBanner(): boolean {
        return localStorage.getItem('hideYoutubeBanner') !== 'true';
    }

    private get videoLink(): string {
        return `https://www.youtube.com/embed/${this.videoId}`;
    }

    public get aspectRatio(): string {
        return this.getAttribute("aspect-ratio") ?? '16 / 9';
    }

    public set aspectRatio(value: string) {
        this.setAttribute('aspect-ratio', value);
    }

    public get videoId(): string {
        return this.getAttribute('video-id') ?? '';
    }

    public set videoId(value: string) {
        this.setAttribute('video-id', value);
    }

    public get bannerText(): string {
        return this.getAttribute('banner-text') ?? CONFIG?.translations?.['show-youtube'];
    }

    public set bannerText(value: string) {
        this.setAttribute('banner-text', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const iframe = this.querySelector('iframe');
        const banner = this.querySelector<HTMLElement>('.banner');
        if (iframe) {
            if (name == 'video-id') {
                iframe.src = this.videoLink;
            } else if (name == 'aspect-ratio') {
                iframe.style.aspectRatio = this.aspectRatio;
            }
        }
        if (banner) {
            if (name == 'aspect-ratio') {
                banner.style.aspectRatio = this.aspectRatio;
            } else if (name == 'banner-text') {
                banner.querySelector('button')!.title = this.bannerText;
                banner.querySelector('.text')!.innerHTML = this.bannerText;
            }
        }
    }
}

customElements.define('my-youtube', Youtube);

class YoutubeLogo extends HTMLElement {
    static observedAttributes = ['banner-text'];

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                :host {
                    --height: 85px;
                    --width: 80px;
                }

                .youtube_banner_play {
                    width: var(--width);
                    height: var(--height);
                    background-color: #e21;
                    padding: 0 15px;
                    border-radius: 50% / 11%;
                    position: relative;
                }

                .youtube_banner_play::before{
                    content: "";
                    position: absolute;
                    background: inherit;
                    top: 10%;
                    bottom: 10%;
                    right: -5%;
                    left: -4.5%;
                    border-radius: 5% / 50%;
                }
                .youtube_banner_play_arrow {
                    width: 100%;
                    height: var(--height);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 3px;
                }
                .youtube_banner_play_arrow::before {
                    content: "";
                    z-index: 1;
                    width: 0;
                    height: 0;
                    border-left: 25px solid #fff;
                    border-top: 15px solid transparent;
                    border-bottom: 15px solid transparent;
                }
            </style>
            <div class="youtube_banner_play">
                <div class="youtube_banner_play_arrow"> </div>
            </div>`;
    }
}

customElements.define('youtube-logo', YoutubeLogo);
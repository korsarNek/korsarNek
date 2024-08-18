Fluid.utils.listenDOMLoaded(() => {
    Fluid.plugins.fancyBox = function (selector) {
        if (!CONFIG.image_zoom.enable) { return; }
    
        jQuery(selector || '.markdown-body :not(a) > img, .markdown-body > img').each(function () {
            var $image = jQuery(this);
            var imageUrl = $image.attr('data-src') || $image.attr('src') || '';
            if (CONFIG.image_zoom.img_url_replace) {
                var rep = CONFIG.image_zoom.img_url_replace;
                var r1 = rep[0] || '';
                var r2 = rep[1] || '';
                if (r1) {
                    if (/^re:/.test(r1)) {
                        r1 = r1.replace(/^re:/, '');
                        var reg = new RegExp(r1, 'gi');
                        imageUrl = imageUrl.replace(reg, r2);
                    } else {
                        imageUrl = imageUrl.replace(r1, r2);
                    }
                }
            }
            var $imageWrap = $image.wrap(`
            <a class="fancybox fancybox.image" href="${imageUrl}"
              itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>`
            ).parent('a');
            if ($imageWrap.length !== 0) {
                if ($image.is('.group-image-container img')) {
                    $imageWrap.attr('data-fancybox', 'group').attr('rel', 'group');
                } else {
                    $imageWrap.attr('data-fancybox', 'default').attr('rel', 'default');
                }
    
                var imageTitle = $image.attr('title') || $image.attr('alt');
                if (imageTitle) {
                    $imageWrap.attr('title', imageTitle).attr('data-caption', imageTitle);
                }
            }
        });
    
        Fancybox.defaults.hash = true;
        Fancybox.bind("[data-fancybox]", {
            loop: true,
            backdropClick: "close",
            helpers: {
                overlay: {
                    locked: false
                }
            },
            Thumbs: {
                showOnStart: false,
            },
            on: {
                init: (fancybox) => {
                    const getHash = () => {
                        const slide = fancybox.getSlide();
                        let hash = "";
                        if (fancybox.carousel && slide) {
                            const slug = slide.slug;
                            const triggerElement = slide.triggerEl;
                            let optionSlug = slug || (fancybox.option("slug") || "");
                            if (!optionSlug && triggerElement && triggerElement.dataset) {
                                optionSlug = triggerElement.dataset.fancybox || "";
                            }
                            if (optionSlug && optionSlug !== "true") {
                                if (slug) {
                                    hash = "#" + slug;
                                } else {
                                    hash = "#" + optionSlug + (fancybox.carousel.slides.length > 1 ? "-" + (slide.index + 1) : "");
                                }
                            }
                        }
                        return hash;
                    }
    
                    let timeout = 0;
                    const oldChange = fancybox.plugins.Hash.onChange;
                    // Hash plugin is buggy, it does a pushState only on first open, afterwards it only does replaceState, which means we can press back only a single time,
                    // if we try again later, we return to the previous page, even if the carousel is currently open.
                    fancybox.plugins.Hash.onChange = (instance) => {
                        if (timeout) {
                            clearTimeout(timeout);
                        }
    
                        const hash = getHash();
                        timeout = setTimeout(() => {
                            window.history.pushState({}, document.title, window.location.pathname + window.location.search + hash);
                        }, 300);
                    };
                    const readyEventList = fancybox.events.get('Carousel.ready');
                    const oldChangeIndex = readyEventList.indexOf(oldChange);
                    if (oldChangeIndex !== -1) {
                        readyEventList[oldChangeIndex] = fancybox.plugins.Hash.onChange;
                        fancybox.events.set('Carousel.ready', readyEventList);
                    }
                },
                "Carousel.beforeInitSlide": (_, __, carouselElement) => {
                    // Remove lazyload if it should be shown in the carousel.
                    const imgElement = carouselElement.thumbEl;
                    carouselElement.thumbSrc = carouselElement.src;
                    carouselElement.thumbElSrc = carouselElement.src;
                    if (imgElement && imgElement.hasAttribute('lazyload')) {
                        imgElement.removeAttribute('srcset');
                        imgElement.removeAttribute('lazyload');
                    }
                },
            }
          });
    };
});
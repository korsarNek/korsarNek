
interface Config {
    lazyload: {
        enable: boolean,
        loading_image: string,
        onlypost: boolean,
        offset_factor: number,
    },
    translations: Record<string, string>,
}

interface Fluid {
    utils: {
        listenDOMLoaded: (callback: () => void) => void,
    }
}

declare var CONFIG: Config;

declare var Fluid: Fluid;
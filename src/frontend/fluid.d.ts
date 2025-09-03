
interface Config {
    lazyload: {
        enable: boolean
        loading_image: string
        onlypost: boolean
        offset_factor: number
    },
    translations: Record<string, string>
    search_path?: string
    include_content_in_search: boolean
}

interface Fluid {
    utils: {
        listenDOMLoaded: (callback: () => void) => void
    }
}

declare var CONFIG: Config;

declare var Fluid: Fluid;
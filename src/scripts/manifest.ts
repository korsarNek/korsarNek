import Hexo from "hexo";

const fs = require('node:fs');

declare const hexo: Hexo

interface ManifestEntry {
    file: string
    name: string
    src?: string
    isEntry?: boolean
    imports?: string[]
}

let manifestContent: Record<string, ManifestEntry> | null = null;
function loadManifest(): Record<string, ManifestEntry> {
    if (manifestContent === null) {
        manifestContent = JSON.parse(fs.readFileSync(__dirname + '/../public/js/build/.vite/manifest.json'));
    }
    return manifestContent!;
}

function manifest(this: Hexo, name: string) {
    const json = loadManifest();
    for (const entry of Object.values(json)) {
        if (entry.name === name) {
            return `<script type="module" src="${this.url_for('js/build/' + entry.file)}" ></script>`;
        }
    }

    throw Error(`No manifest entry found with name "${name}"`);
}

hexo.extend.helper.register('manifest', manifest);

function myjs(this: Hexo, url: string, attribute: string) {
    if (url.startsWith('manifest:')) {
        return manifest.call(this, url.substring('manifest:'.length).trim());
    }

    return `<script ${attribute} src="${this.url_for(url)}" ></script>`;
}

hexo.extend.helper.register('myjs', myjs);

const fs = require('node:fs');

let manifestContent = null;
function loadManifest() {
    if (manifestContent === null) {
        manifestContent = JSON.parse(fs.readFileSync(__dirname + '/../public/js/build/.vite/manifest.json'));
    }
    return manifestContent;
}

/**
 * 
 * @param {string} name 
 * @returns 
 */
function manifest(name) {
    const json = loadManifest();
    for (const [key, entry] of Object.entries(json)) {
        if (entry.name === name) {
            return `<script type="module" src="${this.url_for('js/build/' + entry.file)}" ></script>`;
        }
    }

    console.error("No manifest entry found with name.", name);
}

hexo.extend.helper.register('manifest', manifest);

/**
 * 
 * @param {string} url 
 * @param {string} attribute 
 */
function myjs(url, attribute) {
    if (url.startsWith('manifest:')) {
        return manifest.call(this, url.substring('manifest:'.length).trim());
    }

    return `<script ${attribute} src="${this.url_for(url)}" ></script>`;
}

hexo.extend.helper.register('myjs', myjs);
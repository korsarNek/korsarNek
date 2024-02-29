const path = require('path');
const fs = require('fs');

hexo.extend.filter.register('theme_inject', function (injects) {
    recursiveFiles(path.join(hexo.base_dir, 'layout'), file => {
        const parsed = path.parse(file);
        if (parsed.ext !== '.ejs') return;
        if (parsed.name in injects) {
            // hexo-theme-fluid/scripts/events/lib/injects.js
            injects[parsed.name].file('default', file);
        } else {
            setFileView(path.relative(path.join(hexo.base_dir, 'layout'), file), file);
        }
    });
});

/**
 * @param {string} name 
 * @param {string} file 
 */
function setFileView(name, file) {
    // Set default extname from file's extname
    if (path.extname(name) === '') {
        name += path.extname(file);
    }
    // Set default extname
    if (path.extname(name) === '') {
        name += '.ejs';
      }
    // Get absolute path base on hexo dir
    hexo.theme.setView(name, fs.readFileSync(file, 'utf8'));
}

/**
 * @param {string} dir
 * @param {function(string): void} callback
 */
function recursiveFiles(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const absolutePath = path.join(dir, file);
        if (fs.statSync(absolutePath).isDirectory()) {
            recursiveFiles(absolutePath, callback);
        } else {
            callback(absolutePath);
        }
    }
}
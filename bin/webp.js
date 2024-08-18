#!/usr/bin/env node

const sharp = require('sharp');
const { parse, join } = require('path');
const { statSync } = require("fs")

if (process.argv.length <= 2) {
    console.log("Specify paths of the input files as arguments.");
    return;
}

(async () => {
    for (const input of process.argv.slice(2)) {
        const path = parse(input);
        const output = join(path.dir, path.name) + '.webp';
        await sharp(input)
            .webp({ quality: 80 })
            .toFile(output);
    
        const originalSize = statSync(input).size;
        const newSize = statSync(output).size;
    
        console.log(`Wrote file "${output}". ${originalSize} bytes -> ${newSize} bytes`);
    }
})();

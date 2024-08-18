const { defineConfig } = require('vite')
import copy from 'rollup-plugin-copy'

module.exports = defineConfig({
    appType: 'custom',
    root: '.',
    build: {
        chunkSizeWarningLimit: 1000,
        sourcemap: true,
        manifest: true,
        copyPublicDir: false,
        rollupOptions: {
            input: {
                threejs: './source/_ts/three.ts',
                youtube: './source/_ts/youtube.ts',
            },
            plugins: [
                copy({
                  targets: [
                    { src: 'node_modules/three/examples/jsm/libs/draco', dest: 'public/js/libs' },
                  ]
                })
              ]
        },
        assetsDir: ".",
        outDir: 'public/js/build',
    },
})
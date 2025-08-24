import { defineConfig } from 'vite'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  appType: 'custom',
  root: '.',
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    manifest: true,
    copyPublicDir: false,
    rollupOptions: {
      input: {
        threejs: './src/source/three.ts',
        youtube: './src/source/youtube.ts',
      },
      plugins: [
        copy({
          targets: [
            { src: 'node_modules/three/examples/jsm/libs/draco', dest: 'public/js/libs' },
          ]
        }),
      ]
    },
    assetsDir: ".",
    outDir: 'public/js/build',
  },
})
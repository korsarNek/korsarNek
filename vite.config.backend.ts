import { defineConfig } from 'vite'
import * as glob from "glob"

export default defineConfig({
  appType: 'custom',
  root: '.',
  build: {
    ssr: true,
    minify: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    sourcemap: 'inline',
    manifest: false,
    copyPublicDir: false,
    rollupOptions: {
      output: {
        preserveModules: true,
        format: 'commonjs',
      },
      preserveEntrySignatures: 'allow-extension',
      input: glob.sync('./src/scripts/**/*.{ts,js}'),
    },
    assetsDir: ".",
    outDir: 'scripts',
  },
})
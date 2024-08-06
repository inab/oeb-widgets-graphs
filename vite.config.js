import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    css: [
        "bootstrap/dist/css/bootstrap.min.css",
    ],
    build: {
        manifest: true,
        minify: true,
        reportCompressedSize: true,
        lib: {
            entry: path.resolve(__dirname, "./src/widget-element.js"),
            name: "oeb-widgets-graphs",
            fileName: (format) => `oeb-widgets-graphs.${format}.js`,
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: []
        },
    },
    server: {
        open: './src/demo/index.html',
    },
})
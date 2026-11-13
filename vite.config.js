import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

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
        lib: {
            entry: fileURLToPath(new URL('./src/widget-element.js', import.meta.url)),
            name: 'OebWidgetsGraphs',
            fileName: (format) => `oeb-widgets-graphs.${format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {
                    lit: 'lit',
                },
            },
        },
    },
    server: {
        open: './src/demo/index.html',
    },
})
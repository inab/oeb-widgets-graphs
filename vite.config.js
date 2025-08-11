import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { resolve } from 'path';

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
            entry: resolve(__dirname, 'src/widget-element.js'),
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
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
            entry: resolve(__dirname, 'src/widget-element.js'), // Corrige el uso de resolve
            name: 'OebWidgetGraph',
            fileName: 'oe-widget-graph',
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            // Asegúrate de externalizar dependencias que no quieres incluir en tu bundle
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
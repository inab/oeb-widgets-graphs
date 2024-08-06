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
        rollupOptions: {
        input: {
            app: './src/demo/index.html',
        },
        },
    },
    server: {
        open: './src/demo/index.html',
    },
})
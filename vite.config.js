import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import path, { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/widget-element.js'), // Corrige el uso de resolve
      name: 'MyComponent',
      fileName: 'my-component',
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
});
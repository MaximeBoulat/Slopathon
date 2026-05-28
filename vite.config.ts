import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { resolve } from 'path';

export default defineConfig({
    base: '/slopathon/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    plugins: [
        checker({ typescript: true }),
    ],
    server: {
        port: 3000,
        open: true,
    },
});

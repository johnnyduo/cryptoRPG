import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    optimizeDeps: {
        esbuildOptions: {
            target: 'esnext',
        },
    },
    build: {
        target: 'esnext',
    },
    plugins: [
        react(),
        // Removed VitePWA plugin as PWA is no longer needed
    ],
});

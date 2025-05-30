import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['moustik.dev', 'www.moustik.dev', 'localhost'],
        cors: true
    },
    define: {
        global: {}},
});
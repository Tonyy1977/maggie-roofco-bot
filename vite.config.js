import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // no base: line here – defaults to '/'
  plugins: [react()],
  server: {
    host: true,    // allows access via LAN if you need to test from another device
    port: 3000,    // your frontend dev server port
    proxy: {
      // Proxy all requests starting with /api to your Express backend on port 4000
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});

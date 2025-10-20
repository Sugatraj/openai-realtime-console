// vite.config.js - Fixed version
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  plugins: [
    react({
      jsxRuntime: 'automatic'
    })
  ],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000')
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
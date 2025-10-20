// vite.config.js - Production-ready version
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
    // Dynamic API URL based on environment
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? '/api'  // Production: Netlify redirects to Linode
        : 'http://localhost:3000'  // Development: Direct to local server
    )
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
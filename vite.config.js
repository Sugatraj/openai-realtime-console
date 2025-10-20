import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  plugins: [
    react({
      jsxRuntime: 'automatic'  // This enables the new JSX transform
    })
  ],
  build: {
    outDir: "../dist/client",
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('/api')
  }
};
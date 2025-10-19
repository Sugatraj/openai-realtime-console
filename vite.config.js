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
    __API_URL__: JSON.stringify(process.env.NODE_ENV === 'production' 
      ? 'http://172.105.43.82:3000' 
      : 'http://localhost:3000')
  }
};
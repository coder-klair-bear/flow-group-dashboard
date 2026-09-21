import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": here("./src"),
      // Types only. Every import of this is `import type`, so nothing from the
      // server ever reaches the browser bundle.
      "@shared": here("../server/src/shared"),
    },
  },
  server: {
    port: 5173,
    // The API and the web app share an origin in production; the proxy makes
    // development behave the same way, so no CORS handling leaks into the code.
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    fs: {
      allow: [here("."), here("../server")],
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

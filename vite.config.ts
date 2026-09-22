import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      // The contact endpoint is a Cloudflare Pages Function, which Vite knows
      // nothing about. Run `npm run dev:functions` alongside `npm run dev` and
      // form posts reach the real handler; without it they fail loudly at
      // 8788, which is the honest outcome — the alternative is a form that
      // looks fine in dev and only breaks in production.
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5200,
    strictPort: true,
  },
});

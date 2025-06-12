import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEV_API_SERVER_ADDR = "http://localhost:5000";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // These only apply in dev environments.
    proxy: {
      "/api": {
        target: DEV_API_SERVER_ADDR,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Localhost port
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // Django backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

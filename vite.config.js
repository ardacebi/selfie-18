import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    minify: process.env.NODE_ENV === "production",
  },
  server: {
    hmr: false,
  },
  plugins: [react()],
});

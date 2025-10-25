import { defineConfig } from "vite";

export default defineConfig({
  root: "public",
  server: {
    open: true,
  },
  optimizeDeps: {
    include: ["aframe"],
  },
});

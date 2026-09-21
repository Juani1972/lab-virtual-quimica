/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages sirve un repo de proyecto desde /<repo>/, así que el build
// necesita conocer ese subpath para resolver assets correctamente.
export default defineConfig({
  base: "/lab-virtual-quimica/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});

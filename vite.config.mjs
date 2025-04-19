import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
  server: {
    port: 8008,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
});

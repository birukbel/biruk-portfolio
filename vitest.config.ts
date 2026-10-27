import { defineConfig } from "vitest/config";
import path from "node:path";

// Node 22+: import.meta.dirname
export default defineConfig({
  resolve: {
    alias: { "@messages": path.resolve(import.meta.dirname, "messages"), "@": path.resolve(import.meta.dirname, "src") },
  },
  test: { include: ["tests/**/*.test.ts"] },
});

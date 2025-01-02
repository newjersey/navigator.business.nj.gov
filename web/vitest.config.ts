import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic", // Use automatic runtime
  },
  test: {
    globals: true,
    testTimeout: 10000, // Set global timeout to 10 seconds
    environment: "jsdom",
    setupFiles: "./setupTests.js",
    include: ["**/*.test.tsx", "**/*.test.ts"],
    alias: {
      "@/components": "/src/components",
      "@/contexts": "/src/contexts",
      "@/lib": "/src/lib",
      "@/test": "/test",
      "@/pages": "/src/pages",
      "@/styles": "/src/styles",
      "@businessnjgovnavigator/shared": "/../shared/lib/shared/src",
      "@businessnjgovnavigator/content": "/../content/src",
    },
  },
});

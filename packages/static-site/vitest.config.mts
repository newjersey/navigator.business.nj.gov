import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "next/navigation": "next/navigation.js",
    },
    tsconfigPaths: true,
  },
  test: {
    include: [
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
    exclude: ["node_modules/**", "tests/accessibility/**"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

export default vitestConfig;

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
      "domain/**/*.test.ts",
      "domain/**/*.test.tsx",
    ],
    exclude: ["node_modules/**", "tests/accessibility/**"],
    environment: "jsdom",
    // Default to multilingual enabled so tests that exercise the full locale set
    // keep passing. Flag-OFF tests override this with vi.stubEnv per case.
    env: { NEXT_PUBLIC_MULTILINGUAL_ENABLED: "true" },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

export default vitestConfig;

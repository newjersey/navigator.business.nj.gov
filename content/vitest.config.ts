import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@businessnjgovnavigator/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["build.ts"],
      exclude: ["build.test.ts", "node_modules/**"],
      all: true,
    },
  },
});

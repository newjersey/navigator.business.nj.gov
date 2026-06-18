import { defineConfig } from "@playwright/test";

const SERVER_URL = "http://127.0.0.1:3000";

/**
 * Defines Playwright configuration for automated accessibility checks.
 */
const playwrightAccessibilityConfig = defineConfig({
  testDir: "./tests/accessibility",
  timeout: 120_000,
  use: {
    baseURL: SERVER_URL,
    headless: true,
  },
  webServer: {
    command: "pnpm dev --port 3000",
    // biome-ignore lint/style/noProcessEnv: playwright webServer inherits the host env and reads CI flag.
    env: { ...process.env, NEXT_PUBLIC_MULTILINGUAL_ENABLED: "true" },
    // biome-ignore lint/style/noProcessEnv: reuse existing server locally; always restart in CI.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: SERVER_URL,
  },
});

export default playwrightAccessibilityConfig;

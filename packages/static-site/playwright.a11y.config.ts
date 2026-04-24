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
    command: "yarn dev --port 3000",
    reuseExistingServer: true,
    timeout: 120_000,
    url: SERVER_URL,
  },
});

export default playwrightAccessibilityConfig;

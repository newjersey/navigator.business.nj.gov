import { defineConfig } from "@playwright/test";

const SERVER_URL = "http://127.0.0.1:3101";

/**
 * Defines Playwright configuration for English-only end-to-end tests.
 *
 * Boots the dev server with NEXT_PUBLIC_MULTILINGUAL_ENABLED=false so the
 * language-switching UI is hidden and non-English URLs return 404. Runs on a
 * dedicated port to avoid clashing with the multilingual e2e suite.
 */
const playwrightEnglishOnlyConfig = defineConfig({
  testDir: "./tests/e2e-english-only",
  timeout: 120_000,
  use: {
    baseURL: SERVER_URL,
    headless: true,
  },
  webServer: {
    command: "pnpm dev --port 3101",
    // biome-ignore lint/style/noProcessEnv: playwright webServer inherits the host env and reads CI flag.
    env: { ...process.env, NEXT_PUBLIC_MULTILINGUAL_ENABLED: "false" },
    // biome-ignore lint/style/noProcessEnv: reuse existing server locally; always restart in CI.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: SERVER_URL,
  },
});

export default playwrightEnglishOnlyConfig;

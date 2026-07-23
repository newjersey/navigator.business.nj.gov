import { defineConfig } from "@playwright/test";

const SERVER_URL = "http://127.0.0.1:3000";

/**
 * Some specs (e.g. `homepage.a11y.spec.ts`) import `domain/i18n` modules
 * directly, which read this flag at import time in this config/test-runner
 * process — a separate process from the dev server spawned by `webServer`
 * below. Playwright does not load `.env` itself, so set the flag here to keep
 * both processes in agreement about which locales are enabled.
 */
// biome-ignore lint/style/noProcessEnv: must be set before test files import domain code that reads it at module load time.
process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED = "true";

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

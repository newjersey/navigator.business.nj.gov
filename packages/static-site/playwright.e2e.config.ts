import { defineConfig } from "@playwright/test";

const SERVER_URL = "http://127.0.0.1:3100";

/**
 * Some specs (e.g. `languageSwitcherAccessibility.e2e.spec.ts`) import
 * `domain/i18n` modules directly, which read this flag at import time in this
 * config/test-runner process — a separate process from the dev server spawned
 * by `webServer` below. Playwright does not load `.env` itself, so set the
 * flag here to keep both processes in agreement about which locales are
 * enabled.
 */
// biome-ignore lint/style/noProcessEnv: must be set before test files import domain code that reads it at module load time.
process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED = "true";

/**
 * Defines Playwright configuration for functional end-to-end tests.
 *
 * Kept separate from the accessibility config so behavior specs and a11y audits
 * stay clearly named and can run independently. Uses a dedicated port to avoid
 * clashing with the a11y suite's dev server.
 */
const playwrightE2eConfig = defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  use: {
    baseURL: SERVER_URL,
    headless: true,
  },
  webServer: {
    command: "pnpm dev --port 3100",
    // biome-ignore lint/style/noProcessEnv: playwright webServer inherits the host env and reads CI flag.
    env: { ...process.env, NEXT_PUBLIC_MULTILINGUAL_ENABLED: "true" },
    // biome-ignore lint/style/noProcessEnv: reuse existing server locally; always restart in CI.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: SERVER_URL,
  },
});

export default playwrightE2eConfig;

import { defineConfig } from "@playwright/test";

const SERVER_URL = "http://127.0.0.1:3102";

/**
 * Some specs import `domain/i18n`/`domain/search` modules directly, which
 * read these flags at import time in this config/test-runner process — a
 * separate process from the server spawned by `webServer` below. Playwright
 * does not load `.env` itself, so set both flags here to keep both
 * processes in agreement.
 */
// biome-ignore lint/style/noProcessEnv: must be set before test files import domain code that reads it at module load time.
process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED = "true";
// biome-ignore lint/style/noProcessEnv: must be set before test files import domain code that reads it at module load time.
process.env.NEXT_PUBLIC_SEARCH_ENABLED = "true";

/**
 * Environment shared by the build and the server it produces.
 *
 * Pagefind indexing only happens in `pnpm build`'s `postbuild` step (see
 * `scripts/buildPagefindIndex.ts`) — `pnpm dev` never generates
 * `public/pagefind` (map's standing decision) — so this suite's `webServer`
 * runs a real `pnpm build` before starting the production server, unlike
 * every other Playwright config here, which boots `pnpm dev` directly.
 * `NEXT_PUBLIC_*` flags are inlined at build time, so they must be present
 * for the `build` half of the command, not just `start`.
 */
const SEARCH_E2E_ENV = {
  // biome-ignore lint/style/noProcessEnv: playwright webServer inherits the host env and reads CI flag.
  ...process.env,
  NEXT_PUBLIC_MULTILINGUAL_ENABLED: "true",
  NEXT_PUBLIC_SEARCH_ENABLED: "true",
};

/**
 * Defines Playwright configuration for search end-to-end tests.
 *
 * Verifies the search feature against a genuine, freshly-generated Pagefind
 * index — not a mocked runtime — so this is the one Playwright config in
 * this package that builds the app for real before serving it. Kept
 * separate from `playwright.e2e.config.ts` (dev-mode, no index) and given a
 * dedicated port to avoid clashing with the other suites.
 */
const playwrightSearchE2eConfig = defineConfig({
  testDir: "./tests/e2e-search",
  timeout: 120_000,
  use: {
    baseURL: SERVER_URL,
    headless: true,
  },
  webServer: {
    command: "pnpm build && pnpm exec next start --port 3102",
    env: SEARCH_E2E_ENV,
    // biome-ignore lint/style/noProcessEnv: reuse existing server locally; always restart in CI.
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: SERVER_URL,
  },
});

export default playwrightSearchE2eConfig;

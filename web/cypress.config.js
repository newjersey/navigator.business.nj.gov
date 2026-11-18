/* global process */
import { lighthouse, prepareAudit } from "@cypress-audit/lighthouse";
import { pa11y } from "@cypress-audit/pa11y";
import { defineConfig } from "cypress";
import dotenvPlugin from "cypress-dotenv";

const PUBLIC_ENV_KEYS = [
  "API_BASE_URL",
  "COGNITO_IDENTITY_POOL_ID",
  "COGNITO_USER_POOL_ID",
  "COGNITO_WEB_CLIENT_ID",
  "RANDOM_SEED",
  "TEST_USER_EMAIL",
];

export default defineConfig({
  projectId: "o9nvo8",
  defaultCommandTimeout: 20000,
  viewportWidth: 1025,
  // Cypress 16 dropped the default from 10ms to 0; the tax clearance flow fails in CI without it.
  keystrokeDelay: 10,
  numTestsKeptInMemory: 5,
  lighthouse: {
    thresholds: {
      performance: 0,
      accessibility: 89,
      "best-practices": 90,
      seo: 90,
      pwa: 0,
    },
  },
  expose: {
    API_BASE_URL: "http://localhost:5002",
  },
  reporter: "junit",
  reporterOptions: {
    mochaFile: "cypress/results/web-tests-[hash].xml",
    toConsole: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on("before:browser:launch", (_browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
      });

      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on("task", {
        lighthouse: lighthouse(),
        pa11y: pa11y(),
        log(message) {
          // biome-ignore lint/suspicious/noConsole: Cypress log task prints to the terminal running Cypress
          console.log(message);
          return null;
        },
      });

      const configWithEnv = dotenvPlugin(config);
      configWithEnv.env.ADMIN_PASSWORD =
        process.env.ADMIN_PASSWORD || configWithEnv.env.ADMIN_PASSWORD || "Test1!";
      // CI, the feature-test scripts, and .env supply these as CYPRESS_* variables, which only
      // populate `env`. Specs read them with Cypress.expose(), so copy them across.
      for (const key of PUBLIC_ENV_KEYS) {
        if (configWithEnv.env[key] !== undefined) {
          configWithEnv.expose[key] = configWithEnv.env[key];
        }
      }
      return configWithEnv;
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    retries: {
      runMode: 2,
      openMode: 0,
    },
    video: false,
  },
});

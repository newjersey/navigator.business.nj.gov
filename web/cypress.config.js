import { lighthouse, prepareAudit } from "@cypress-audit/lighthouse";
import { pa11y } from "@cypress-audit/pa11y";
import { defineConfig } from "cypress";
import dotenvPlugin from "cypress-dotenv";

export default defineConfig({
  projectId: "o9nvo8",
  defaultCommandTimeout: 20000,
  viewportWidth: 1025,
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
  reporter: "cypress-mochawesome-reporter", //"junit", ,
  // reporterOptions: {
  //   reportsDir: "cypress/results/accessibility-reports",
  //   reportsFilename: "accessibility-report",
  //   overwrite: false,
  //   mochaFile: "cypress/results/web-tests-[hash].xml",
  //   toConsole: true,
  // },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
      require("cypress-mochawesome-reporter/plugin")(on);
      on("before:browser:launch", (browser = {}, launchOptions) => {
        prepareAudit(launchOptions);
      });

      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on("task", {
        lighthouse: lighthouse(),
        pa11y: pa11y(),
        log(message) {
          console.log(message);
          return null;
        },
      });

      config = dotenvPlugin(config);
      return config;
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

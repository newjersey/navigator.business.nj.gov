// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="cypress" />

import seedrandom from "seedrandom";
import "./commands";
import { LighthouseConfig, LighthouseThresholds, Pa11yThresholds } from "./types";

export const testUserEmail = Cypress.env("TEST_USER_EMAIL");
export const testUserPassword = Cypress.env("TEST_USER_PASSWORD");

const testRandomSeeds = new Map();

const isRelevantSuite = () => {
  let testSuite = Cypress.env("SUITE");
  if (!testSuite) {
    testSuite = "all";
  }

  const testName = Cypress.mocha.getRunner().test.fullTitle();
  testSuite = `[${testSuite}]`;
  return testName.includes(testSuite);
};

beforeEach(function () {
  if (!isRelevantSuite()) {
    this.skip();
  }

  const testName = Cypress.mocha.getRunner().test.fullTitle();
  // Cypress test will rerun on the CI if they fail, resulting in multiple runs for the same test with the same name.
  // Reusing the same seed for reruns thus allows us to better discover breaking edge cases. Unlike in unit tests,
  // where we error on duplicate test name.
  const randomSeed =
    Cypress.env("RANDOM_SEED") || testRandomSeeds.get(testName) || Math.random().toString(36).slice(2);
  testRandomSeeds.set(testName, randomSeed);
  seedrandom(randomSeed, { global: true });
});

afterEach(function () {
  if (!isRelevantSuite()) {
    this.skip();
  }

  if (this.currentTest?.state === "failed") {
    const testName = Cypress.mocha.getRunner().test.fullTitle();
    cy.task(
      "log",
      `Failed ${testName}. Replicate Math.random() values by running with CYPRESS_RANDOM_SEED=${testRandomSeeds.get(
        testName
      )}`
    );
  }
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Cypress {
      mocha: {
        getRunner: () => {
          test: {
            fullTitle: () => string;
          };
        };
      };
    }
    interface Chainable {
      loginByCognitoApi(): Chainable;
      chooseDatePicker(selector: string, value: string): void;
      lighthouse(lighthouseThresholds?: LighthouseThresholds, lighthouseConfig?: LighthouseConfig): void;
      pa11y(thresholds?: Pa11yThresholds): void;
      forceClick: () => void;
    }
  }
}

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
  const randomSeed = Cypress.env("RANDOM_SEED") || Math.random().toString(36).slice(2);
  if (testRandomSeeds.has(testName)) {
    cy.task("log", `Found duplicate ${testName}}`);
    throw new Error(`Unexpected duplicate test name "${testName}". Please make test names unique.`);
  }
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
      `Failed ${testName}. Replicate Math.random() numbers by running with CYPRESS_RANDOM_SEED=${testRandomSeeds.get(
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

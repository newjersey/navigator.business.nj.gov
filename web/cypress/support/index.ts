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

import "./commands";
import { LighthouseConfig, LighthouseThresholds, Pa11yThresholds } from "./helpers";
export const testUserEmail = Cypress.env("TEST_USER_EMAIL");
export const testUserPassword = Cypress.env("TEST_USER_PASSWORD");

beforeEach(function () {
  let testSuite = Cypress.env("SUITE");
  if (!testSuite) {
    testSuite = "all";
  }

  const testName = Cypress.mocha.getRunner().test.fullTitle();
  testSuite = `[${testSuite}]`;
  if (!testName.includes(testSuite)) {
    this.skip();
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
      loginByCognitoApi(): void;
      chooseDatePicker(selector: string, value: string): void;
      resetUserData(): void;
      lighthouse(lighthouseThresholds?: LighthouseThresholds, lighthouseConfig?: LighthouseConfig): void;
      pa11y(thresholds?: Pa11yThresholds): void;
      forceClick: () => void;
    }
  }
}

/* eslint-disable cypress/no-unnecessary-waiting */

import {
  clickNext,
  completeOnboarding,
  defaultPa11yThresholds,
  lighthouseDesktopConfig,
} from "../support/helpers";

describe("Performance and Accessability", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  describe("Onboarding", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[aria-label="Business name"]').type("Beesapple's");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.get('[data-value="e-commerce"]').click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.get('[data-value="e-commerce"]').click();
        clickNext();

        cy.get('[data-value="general-partnership"]').click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.get('[data-value="e-commerce"]').click();
        clickNext();

        cy.get('[data-value="general-partnership"]').click();
        clickNext();

        cy.get('input[type="radio"][value="false"]').check();
        cy.get('[aria-label="Location"]').click();
        cy.contains("Absecon").click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });

  describe("Roadmap", () => {
    it("should pass the audits", () => {
      completeOnboarding("Smith Works", "e-commerce", "general-partnership");

      // check roadmap
      cy.get('[data-business-name="Smith Works"]').should("exist");
      cy.get('[data-industry="e-commerce"]').should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");

      cy.lighthouse(undefined, lighthouseDesktopConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
  });
});

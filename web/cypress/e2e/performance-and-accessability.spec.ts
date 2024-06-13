/* eslint-disable testing-library/await-async-utils */
/* eslint-disable cypress/no-unnecessary-waiting */

import {
  completeBusinessStructureTask,
  defaultPa11yThresholds,
  lighthouseDesktopConfig,
  lighthouseMobileConfig,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { onOnboardingPage } from "cypress/support/page_objects/onboardingPage";

describe("Performance and Accessability - Landing Page [all] [group2]", () => {
  describe("Desktop", () => {
    it("should pass the audits", () => {
      cy.visit("/");
      cy.wait(1000); // wait for onboarding animation

      cy.lighthouse(undefined, lighthouseDesktopConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
  });

  describe("Mobile", () => {
    it("should pass the audits", () => {
      cy.viewport(375, 667);
      cy.visit("/");
      cy.wait(1000); // wait for onboarding animation

      cy.lighthouse(undefined, lighthouseMobileConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
  });
});

describe("Performance and Accessability - Onboarding [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("Onboarding - starting flow", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");
        onOnboardingPage.selectBusinessPersona("STARTING");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectBusinessPersona("STARTING");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.selectIndustry("e-commerce");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });

  describe("Onboarding - owning flow", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectBusinessPersona("OWNING");
        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });
});

// The dashboard page renders the desktop and mobile components, this is resulting in some weird
// behavior that will need to look into further when we are creating accessibility cypress test

// describe("Performance and Accessibility - Dashboard [all] [group3]", () => {
//   beforeEach(() => {
//     cy.loginByCognitoApi();
//   });
//
//   it("should pass the audits", () => {
//     const industry = LookupIndustryById("e-commerce");
//
//     completeNewBusinessOnboarding({
//       industry,
//     });
//
//     onDashboardPage.getEditProfileLink().should("exist");
//
//     cy.lighthouse(undefined, lighthouseDesktopConfig);
//     cy.pa11y(defaultPa11yThresholds);
//   });
// });

describe("Performance and Accessibility - Roadmap Tasks [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  const urlSlugs = ["identify-potential-lease", "check-site-requirements", "reseller", "business-plan"];

  for (const slug of urlSlugs) {
    it(`should pass the audits on ${slug}`, () => {
      const industry = LookupIndustryById("cosmetology");
      const legalStructureId = "general-partnership";

      completeNewBusinessOnboarding({
        industry,
      });
      completeBusinessStructureTask({ legalStructureId });

      onDashboardPage.clickRoadmapTask(slug);

      cy.lighthouse(undefined, lighthouseDesktopConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
  }
});

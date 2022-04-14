/* eslint-disable cypress/no-unnecessary-waiting */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onOnboardingPage } from "cypress/support/page_objects/onboardingPage";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import {
  completeNewBusinessOnboarding,
  defaultPa11yThresholds,
  lighthouseDesktopConfig,
  lighthouseMobileConfig,
} from "../support/helpers";

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
      cy.viewport("iphone-5");
      cy.visit("/");
      cy.wait(1000); // wait for onboarding animation

      cy.lighthouse(undefined, lighthouseMobileConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
  });
});

describe("Performance and Accessability - Onboarding [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("Onboarding - starting flow", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");
        onOnboardingPage.selectNewBusiness(false);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessName("Beesapple's");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.selectIndustry("e-commerce");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 4", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.selectIndustry("e-commerce");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=4");
        onOnboardingPage.selectLegalStructure("general-partnership");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 5", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.selectIndustry("e-commerce");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=4");
        onOnboardingPage.selectLegalStructure("general-partnership");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=5");
        onOnboardingPage.selectLocation("Absecon");
        onOnboardingPage.selectHomeBased(false);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 6", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.selectIndustry("e-commerce");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=4");
        onOnboardingPage.selectLegalStructure("general-partnership");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=5");
        onOnboardingPage.selectLocation("Absecon");
        onOnboardingPage.selectHomeBased(false);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=6");
        onOnboardingPage.typeFullName("Michael Smith");
        onOnboardingPage.typeEmail("MichaelSmith@gmail.com");
        onOnboardingPage.typeConfirmEmail("MichaelSmith@gmail.com");
        onOnboardingPage.toggleNewsletterCheckbox(true);
        onOnboardingPage.toggleContactMeCheckbox(true);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });

  describe("Onboarding - owning flow", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(true);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(true);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessFormationDate("01/2020");
        onOnboardingPage.typeEntityId("1234567890");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(true);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessFormationDate("01/2020");
        onOnboardingPage.typeEntityId("1234567890");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.selectIndustrySector("clean-energy");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 4", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(true);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessFormationDate("01/2020");
        onOnboardingPage.typeEntityId("1234567890");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.selectIndustrySector("clean-energy");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=4}");
        onOnboardingPage.typeNumberOfEmployees("5");
        onOnboardingPage.selectLocation("Absecon");
        onOnboardingPage.selectHomeBased(false);
        onOnboardingPage.selectOwnership(["women-owned"]);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 5", () => {
      it("should pass the audits", () => {
        cy.url().should("include", "onboarding?page=1");

        onOnboardingPage.selectNewBusiness(true);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=2");
        onOnboardingPage.typeBusinessFormationDate("01/2020");
        onOnboardingPage.typeEntityId("1234567890");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=3");
        onOnboardingPage.typeBusinessName("Beesapple's");
        onOnboardingPage.selectIndustrySector("clean-energy");
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=4}");
        onOnboardingPage.typeNumberOfEmployees("5");
        onOnboardingPage.selectLocation("Absecon");
        onOnboardingPage.selectHomeBased(false);
        onOnboardingPage.selectOwnership(["women-owned"]);
        onOnboardingPage.clickNext();

        cy.url().should("include", "onboarding?page=5}");
        onOnboardingPage.typeFullName("Michael Smith");
        onOnboardingPage.typeEmail("MichaelSmith@gmail.com");
        onOnboardingPage.typeConfirmEmail("MichaelSmith@gmail.com");
        onOnboardingPage.toggleNewsletterCheckbox(true);
        onOnboardingPage.toggleContactMeCheckbox(true);

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });
});

describe.only("Performance and Accessibility - Roadmap [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("Roadmap", () => {
    it("should pass the audits", () => {
      const industry = LookupIndustryById("e-commerce");
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
      const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
      const legalStructureId = "general-partnership";
      const townDisplayName = "Absecon";

      completeNewBusinessOnboarding({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
        townDisplayName,
      });

      // check roadmap
      cy.get('[data-industry="e-commerce"]').should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");

      cy.lighthouse(undefined, lighthouseDesktopConfig);
      cy.pa11y(defaultPa11yThresholds);
    });

    describe("Tasks", () => {
      const urlSlugs = ["identify-potential-lease", "check-site-requirements", "reseller", "business-plan"];
      urlSlugs.forEach((slug) => {
        it(`should pass the audits on ${slug}`, () => {
          const industry = LookupIndustryById("cosmetology");
          const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
          const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
          const legalStructureId = "general-partnership";
          const townDisplayName = "Absecon";

          completeNewBusinessOnboarding({
            industry,
            homeBasedQuestion,
            liquorLicenseQuestion,
            legalStructureId,
            townDisplayName,
          });
          onRoadmapPage.clickRoadmapTask(slug);

          cy.lighthouse(undefined, lighthouseDesktopConfig);
          cy.pa11y(defaultPa11yThresholds);
        });
      });
    });
  });
});

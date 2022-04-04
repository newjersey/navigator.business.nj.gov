/* eslint-disable cypress/no-unnecessary-waiting */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import {
  clickNext,
  clickTask,
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
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="false"]').check();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="false"]').check();
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="false"]').check();
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.contains("E-Commerce").click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 4", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="false"]').check();
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.contains("E-Commerce").click();
        clickNext();

        cy.get('[data-value="general-partnership"]').click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 5", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="false"]').check();
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");
        clickNext();

        cy.get('[aria-label="Industry"]').click();
        cy.contains("E-Commerce").click();
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

  describe("Onboarding - owning flow", () => {
    describe("Step 1", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="true"]').check();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 2", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="true"]').check();
        clickNext();

        cy.chooseDatePicker('[aria-label="Date of formation"]', "01/2020");

        cy.get('input[aria-label="Entity id"]').type("1234567890");

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });

    describe("Step 3", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="true"]').check();
        clickNext();

        cy.chooseDatePicker('[aria-label="Date of formation"]', "01/2020");

        cy.get('input[aria-label="Entity id"]').type("1234567890");
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");

        cy.get('[aria-label="Sector"]').click();
        cy.contains("Clean Energy").click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
    describe("Step 4", () => {
      it("should pass the audits", () => {
        cy.wait(1000); // wait for onboarding animation

        cy.get('input[type="radio"][value="true"]').check();
        clickNext();

        cy.chooseDatePicker('[aria-label="Date of formation"]', "01/2020");

        cy.get('input[aria-label="Entity id"]').type("1234567890");
        clickNext();

        cy.get('input[aria-label="Business name"]').type("Beesapple's");

        cy.get('[aria-label="Sector"]').click();
        cy.contains("Clean Energy").click();
        clickNext();

        cy.get('input[type="radio"][value="false"]').check();
        cy.get('[aria-label="Location"]').click();
        cy.contains("Absecon").click();

        cy.lighthouse(undefined, lighthouseDesktopConfig);
        cy.pa11y(defaultPa11yThresholds);
      });
    });
  });
});

describe("Performance and Accessibility - Roadmap [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("Roadmap", () => {
    it("should pass the audits", () => {
      const businessName = "Smith Works";
      const industry = LookupIndustryById("e-commerce");
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
      const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
      const companyType = "general-partnership";
      const townDisplayName = "Absecon";

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      // check roadmap
      cy.get('[data-business-name="Smith Works"]').should("exist");
      cy.get('[data-industry="e-commerce"]').should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");

      cy.lighthouse(undefined, lighthouseDesktopConfig);
      cy.pa11y(defaultPa11yThresholds);
    });
    describe("Tasks", () => {
      describe("Plan Your Business", () => {
        describe("Write Your Business Plan", () => {
          it("should pass the audits", () => {
            const businessName = "Donut Shop";
            const industry = LookupIndustryById("cosmetology");
            const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
            const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
            const companyType = "general-partnership";
            const townDisplayName = "Absecon";

            completeNewBusinessOnboarding({
              businessName,
              industry,
              homeBasedQuestion,
              liquorLicenseQuestion,
              companyType,
              townDisplayName,
            });

            clickTask("business-plan");

            cy.lighthouse(undefined, lighthouseDesktopConfig);
            cy.pa11y(defaultPa11yThresholds);
          });
        });
        describe("Write Your Business Plan", () => {
          const urlSlugs = ["identify-potential-lease", "check-site-requirements", "reseller"];
          urlSlugs.forEach((slug) => {
            describe(slug, () => {
              it("should pass the audits", () => {
                const businessName = "Donut Shop";
                const industry = LookupIndustryById("cosmetology");
                const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
                const liquorLicenseQuestion =
                  industry.isLiquorLicenseApplicable === false ? undefined : false;
                const companyType = "general-partnership";
                const townDisplayName = "Absecon";

                completeNewBusinessOnboarding({
                  businessName,
                  industry,
                  homeBasedQuestion,
                  liquorLicenseQuestion,
                  companyType,
                  townDisplayName,
                });
                clickTask(slug);

                cy.lighthouse(undefined, lighthouseDesktopConfig);
                cy.pa11y(defaultPa11yThresholds);
              });
            });
          });
        });
      });
    });
  });
});

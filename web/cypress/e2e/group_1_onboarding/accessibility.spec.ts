import "cypress-axe";
import { setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

describe("Automated Accessibilty Testing [feature] [all] [group1]", () => {
  describe("Onboarding - Desktop", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
      cy.injectAxe();
    });

    it("All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });

      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });
    });
  });

  describe("Onboarding - Mobile", () => {
    beforeEach(() => {
      setMobileViewport();
      cy.loginByCognitoApi();
      cy.injectAxe();
    });

    it("All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });

      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
      cy.checkA11y(undefined, {
        runOnly: {
          type: "tag",
          values: ["wcag22aa"],
        },
      });
    });
  });
});

import { setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

describe("Onboarding  when starting a business [feature] [all] [group1]", () => {
  describe("Desktop", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
    });

    it("Onboards learning business", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");

      onOnboardingPageStartingBusiness.selectBusinessIntentRadio("true");
      onOnboardingPageStartingBusiness.getBusinessIntentRadio("true").should("be.checked");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
    });

    it("Onboards ready to start business", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");

      onOnboardingPageStartingBusiness.selectBusinessIntentRadio("false");
      onOnboardingPageStartingBusiness.getBusinessIntentRadio("false").should("be.checked");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
    });
  });

  describe("Mobile", () => {
    beforeEach(() => {
      setMobileViewport();
      cy.loginByCognitoApi();
    });

    it("Onboarding for learning", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");

      onOnboardingPageStartingBusiness.selectBusinessIntentRadio("true");
      onOnboardingPageStartingBusiness.getBusinessIntentRadio("true").should("be.checked");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
    });

    it("Onboarding for ready to start", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");

      onOnboardingPageStartingBusiness.selectBusinessIntentRadio("false");
      onOnboardingPageStartingBusiness.getBusinessIntentRadio("false").should("be.checked");

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
    });
  });
});

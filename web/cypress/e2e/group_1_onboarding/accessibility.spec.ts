import "cypress-axe";
import "cypress-mochawesome-reporter";
//import { setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

describe("Automated Accessibilty Testing [feature] [all] [group1]", () => {
  describe("Accessibility Test", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
      cy.injectAxe();
    });

    it("Accessibility for All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      cy.get("h1").contains("Tell Us About Your Business (Step 1)");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      // cy.checkA11y(undefined, {
      //   runOnly: {
      //     type: "tag",
      //     values: ["wcag22aa"],
      //   },
      // });
      cy.checkA11y();
      cy.pause();
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");
      cy.checkA11y();
      // cy.checkA11y(undefined, {
      //   runOnly: {
      //     type: "tag",
      //     values: ["wcag21aa"],
      //   },
      // });
      cy.pause();

      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
      cy.checkA11y();
      // cy.checkA11y(undefined, {
      //   runOnly: {
      //     type: "tag",
      //     values: ["wcag21aa"],
      //   },
      // });
      cy.pause();
    });
  });
});

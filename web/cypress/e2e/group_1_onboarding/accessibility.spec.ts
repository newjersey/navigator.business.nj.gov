//import { setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

describe("Automated Accessibilty Testing [feature] [all] [group1]", () => {
  describe("Accessibility Test", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
    });

    it("Testing for All Other Businesses", () => {
      cy.url().should("include", "onboarding?page=1");
      cy.get("h1").contains("Tell Us About Your Business (Step 1)");
      onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
      onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
      onOnboardingPageStartingBusiness.clickNext();

      cy.url().should("include", "onboarding?page=2");
      onOnboardingPageStartingBusiness.selectIndustryDropdown("generic");
      onOnboardingPageStartingBusiness.clickNext();
      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
    });
  });
});

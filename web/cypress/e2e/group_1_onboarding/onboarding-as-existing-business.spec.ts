import { arrayOfSectors } from "@businessnjgovnavigator/shared";
import { setMobileViewport } from "../../support/helpers/helpers";
import { onOnboardingPageExistingBusiness } from "../../support/page_objects/onboardingPageNew";

describe("Onboarding for all sectors as an existing business [feature] [all] [group1]", () => {
  describe("Desktop", () => {
    beforeEach(() => {
      cy.loginByCognitoApi();
    });

    for (const sector of arrayOfSectors) {
      it(`Onboarding for ${sector.name}`, () => {
        cy.url().should("include", "onboarding?page=1");
        onOnboardingPageExistingBusiness.selectBusinessPersonaRadio("OWNING");
        onOnboardingPageExistingBusiness.getBusinessPersonaRadio("OWNING").should("be.checked");

        cy.url().should("include", "onboarding?page=1");
        onOnboardingPageExistingBusiness.selectIndustrySector(sector.id);

        onOnboardingPageExistingBusiness.clickShowMyGuide();
        cy.url().should("include", "dashboard");
        cy.get('[data-testid="header-link-to-profile"]');
      });
    }
  });

  describe("Existing Business Mobile", () => {
    beforeEach(() => {
      setMobileViewport();
      cy.loginByCognitoApi();
    });
    it("Onboarding for Other Services", () => {
      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageExistingBusiness.selectBusinessPersonaRadio("OWNING");
      onOnboardingPageExistingBusiness.getBusinessPersonaRadio("OWNING").should("be.checked");

      cy.url().should("include", "onboarding?page=1");
      onOnboardingPageExistingBusiness.selectIndustrySector("other-services");

      onOnboardingPageExistingBusiness.clickShowMyGuide();
      cy.url().should("include", "dashboard");
      cy.get('[data-testid="header-link-to-profile"]');
    });
  });
});

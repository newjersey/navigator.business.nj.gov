import { onOnboardingPageExistingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";
import { arrayOfSectors } from "@businessnjgovnavigator/shared/";

describe("Onboarding for all sectors as an existing business [feature] [all] [group4]", () => {
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
        cy.url().should("include", "dashboard?fromOnboarding=true");
        cy.get('[data-testid="header-link-to-profile"]');
      });
    }
  });
});

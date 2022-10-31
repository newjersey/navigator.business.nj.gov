import { onOnboardingPage } from "cypress/support/page_objects/onboardingPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Onboarding [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("open and closes contextual info panel on onboarding screens", () => {
    cy.url().should("include", "onboarding?page=1");
    onOnboardingPage.selectBusinessPersona("STARTING");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=2");
    onOnboardingPage.selectIndustry("home-contractor");

    cy.get('[data-testid="home-contractors-activities"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=3");
    cy.get('[data-testid="legal-structure-learn-more"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");

    onOnboardingPage.selectLegalStructure("general-partnership");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=4");
    onOnboardingPage.selectLocation("Absecon");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=5");
  });

  it("user data is updated if opted into newsletter", () => {
    cy.intercept("POST", "/local/api/users", (req) => {
      return req.continue();
    }).as("new-user");

    completeNewBusinessOnboarding({
      isNewsletterChecked: true,
      isContactMeChecked: true,
    });

    cy.wait("@new-user").then((event) => {
      cy.log(`Received: ${JSON.stringify(event.request.body.user.externalStatus)}`);
      const expected = {
        success: true,
        status: "SUCCESS",
      };
      cy.log(`Expected: ${JSON.stringify(expected)}`);
      expect(event.request.body.user.externalStatus.newsletter).to.deep.equal(expected);
    });
  });
});

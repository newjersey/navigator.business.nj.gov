import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";

describe("Multiple Businesses [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("adds a second business", () => {
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
    onDashboardPage.getAddBusinessButtonInDropdown().click();

    cy.url().should("include", "onboarding?page=1");

    onOnboardingPage.selectBusinessPersona("OWNING");
    onOnboardingPage.selectIndustrySector("construction");

    onOnboardingPage.clickNext();
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("exist");

    // additional business has filings calendar
    cy.get('[data-testid="filings-calendar"]').should("exist");

    // switch business
    cy.get('[data-testid="business-title-0"]').click();

    // original business has no calendar
    cy.get('[data-testid="filings-calendar"]').should("not.exist");
  });

  it("exits out of additional business onboarding without saving", () => {
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    onDashboardPage.getAddBusinessButtonInDropdown().click();
    cy.url().should("include", "onboarding?page=1");

    onOnboardingPage.selectBusinessPersona("STARTING");
    onOnboardingPage.clickNext();
    cy.get('[data-testid="return-to-prev-button"]').click();
    cy.url().should("contain", "/dashboard");

    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
  });
});

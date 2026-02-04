import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import { getMergedConfig } from "@businessnjgovnavigator/shared";

const Config = getMergedConfig();

/* eslint-disable cypress/no-unnecessary-waiting */

describe("Remove Business [feature] [all] [group5]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("adds multiple businesses and removes one", () => {
    // Create first business
    completeNewBusinessOnboarding({});
    cy.url().should("contain", "/dashboard");

    // Verify first business exists
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
    cy.get('[data-testid="remove-business-link"]').should("not.exist");

    // Add second business
    onDashboardPage.getAddBusinessButtonInDropdown().click();
    cy.url().should("include", "onboarding?additionalBusiness=true&page=1");

    onOnboardingPage.selectBusinessPersona("OWNING");
    onOnboardingPage.selectIndustrySector("construction");
    onOnboardingPage.clickNext();
    cy.url().should("contain", "/dashboard");

    // Verify both businesses exist
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("exist");
    cy.get('[data-testid="remove-business-link"]').should("exist");

    // Test remove business modal - try to remove without checking checkbox
    onDashboardPage.clickRemoveBusinessLink();
    onDashboardPage.getRemoveBusinessModalCheckbox().should("not.be.checked");
    onDashboardPage.getRemoveBusinessModalPrimaryButton().click();
    onDashboardPage.getRemoveBusinessModalErrorAlert().should("exist");
    onDashboardPage
      .getRemoveBusinessModalErrorAlert()
      .contains(Config.removeBusinessModal.agreementCheckboxErrorText);

    // Cancel removal
    onDashboardPage.getRemoveBusinessModalSecondaryButton().click();
    onDashboardPage.getRemoveBusinessModalCheckbox().should("not.exist");

    // Verify both businesses still exist
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("exist");

    // Successfully remove a business
    onDashboardPage.clickRemoveBusinessLink();
    onDashboardPage.getRemoveBusinessModalCheckbox().click();
    const button = onDashboardPage.getRemoveBusinessModalPrimaryButton();

    cy.wait(1000);
    button.click();

    // After removal, should redirect to dashboard and only one business should remain
    cy.wait(1000);
    cy.url().should("contain", "/dashboard");

    // Wait for page to reload after removal
    cy.get('[data-testid="dashboard-header"]').should("exist");

    // Verify only one business remains
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
    cy.get('[data-testid="remove-business-link"]').should("not.exist");
  });
});

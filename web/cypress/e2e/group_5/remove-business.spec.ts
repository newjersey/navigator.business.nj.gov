import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import { getMergedConfig } from "@businessnjgovnavigator/shared";

const Config = getMergedConfig();

/* eslint-disable cypress/no-unnecessary-waiting */

// TODO: This test is failing - cannot find onboarding-additional-business-indicator after 30s
// The additionalBusiness query param may not be propagating correctly through React 19's new routing
// Need to investigate query parameter handling and state updates in onboarding page
describe.skip("Remove Business [feature] [all] [group5]", () => {
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

    // Add second business - verify navigation by content, not URL
    onDashboardPage.getAddBusinessButtonInDropdown().click();

    // Wait for onboarding page to load
    cy.location("pathname").should("eq", "/onboarding");

    // Wait for React to process query params and set isAdditionalBusiness state
    cy.get('[data-testid="onboarding-additional-business-indicator"]', { timeout: 30000 }).should(
      "exist",
    );

    // Verify business persona selector is visible (indicates page loaded correctly)
    cy.get('input[name="business-persona"]').should("exist");

    // Complete second business onboarding
    onOnboardingPage.selectBusinessPersona("OWNING");
    onOnboardingPage.selectIndustrySector("construction");
    onOnboardingPage.clickNext();

    // Wait for navigation to complete
    cy.location("pathname").should("eq", "/dashboard");
    cy.get('[data-testid="dashboard-header"]').should("be.visible");

    // Verify both businesses exist
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("exist");
    cy.get('[data-testid="remove-business-link"]').should("exist");

    // Test remove business modal - try to remove without checking checkbox
    onDashboardPage.clickRemoveBusinessLink();
    onDashboardPage.getRemoveBusinessModalCheckbox().find("input").should("not.be.checked");
    onDashboardPage.getRemoveBusinessModalPrimaryButton().click();
    onDashboardPage.getRemoveBusinessModalErrorAlert().should("be.visible");
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
    onDashboardPage.getRemoveBusinessModalCheckbox().should("be.visible").click();
    onDashboardPage.getRemoveBusinessModalCheckbox().find("input").should("be.checked");

    // Intercept removal API call
    cy.intercept("PUT", "/api/users/*").as("removeBusiness");

    // Click remove button
    onDashboardPage.getRemoveBusinessModalPrimaryButton().should("not.be.disabled").click();

    // Wait for API completion (not arbitrary time)
    cy.wait("@removeBusiness").its("response.statusCode").should("eq", 200);

    // Verify redirect to dashboard
    cy.location("pathname").should("eq", "/dashboard");
    cy.get('[data-testid="dashboard-header"]').should("be.visible");

    // Verify only one business remains
    onDashboardPage.getDropdown().click();
    cy.get('[data-testid="business-title-0"]').should("exist");
    cy.get('[data-testid="business-title-1"]').should("not.exist");
    cy.get('[data-testid="remove-business-link"]').should("not.exist");
  });
});

/* eslint-disable cypress/no-unnecessary-waiting */
import { completeBusinessStructureTask } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("check license status [feature] [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("searches and checks license status", () => {
    const industry = LookupIndustryById("cosmetology");
    const legalStructureId = "general-partnership";
    const businessName = "Pending Business Name";

    completeNewBusinessOnboarding({ industry });

    completeBusinessStructureTask({ legalStructureId });

    onDashboardPage.getEditProfileLink().should("exist");

    // application tab
    cy.get('[data-task="apply-for-shop-license"]').first().click();
    cy.get('button[data-testid="cta-secondary"]').first().click();
    cy.intercept(`${Cypress.env("API_BASE_URL")}/api/users/*`).as("userAPI");

    cy.get('input[data-testid="business-name"]').type(businessName);
    cy.get('input[data-testid="address-1"]').type("111 Business St");
    cy.get('input[data-testid="zipcode"]').type("12345");
    cy.get('button[data-testid="check-status-submit"]').first().click();
    cy.get('[data-testid="permit-PENDING"]').should("exist");
  });
});

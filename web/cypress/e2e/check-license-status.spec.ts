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
    const industry = LookupIndustryById("home-contractor");
    const legalStructureId = "general-partnership";
    const businessName = "Aculyst";

    completeNewBusinessOnboarding({ industry });

    completeBusinessStructureTask({ legalStructureId });

    // dashboard business name
    onDashboardPage.getEditProfileLink().should("exist");

    // application tab
    cy.get('[data-task="register-consumer-affairs"]').first().click();
    cy.get('button[data-testid="cta-secondary"]').first().click();
    cy.intercept(`${Cypress.env("API_BASE_URL")}/api/users/*`).as("userAPI");
    // check status tab, error messages
    cy.get('input[data-testid="business-name"]').type(businessName);
    cy.get('input[data-testid="business-name"]').should("have.value", businessName);

    cy.get('input[data-testid="zipcode"]').type("12345");
    cy.get('button[data-testid="check-status-submit"]').first().click();

    cy.get('[data-testid="error-alert-FIELDS_REQUIRED"]').should("exist");

    cy.get('input[data-testid="address-1"]').type("123 Main Street");
    cy.get('button[data-testid="check-status-submit"]').first().click();

    cy.get('[data-testid="error-alert-NOT_FOUND"]').should("exist");
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait("@userAPI");

    cy.reload();

    cy.get('input[data-testid="business-name"]').should("have.value", "Aculyst");
    cy.get('input[data-testid="address-1"]').should("have.value", "123 Main Street");
    cy.get('input[data-testid="zipcode"]').should("have.value", "12345");

    // enter real address
    cy.get('input[data-testid="address-1"]').clear();
    cy.get('input[data-testid="address-1"]').type("111 Business St");
    cy.get('button[data-testid="check-status-submit"]').first().click();

    // receipt screen, pending
    cy.get('[data-testid="permit-PENDING"]').should("exist");
    cy.contains("Certificate of CGL Insurance").should("exist");
    cy.contains("Business Formation Documents").should("exist");
    cy.contains("Aculyst".toUpperCase()).should("exist");
    cy.contains("111 Business St, 12345 NJ").should("exist");

    cy.reload();
    cy.get('[data-testid="permit-PENDING"]').should("exist");

    // different address
    cy.get('button[data-testid="edit-button"]').first().click();
    cy.get('input[data-testid="address-1"]').clear();
    cy.get('input[data-testid="address-1"]').type("222 License St");
    cy.get('button[data-testid="check-status-submit"]').first().click();

    // receipt screen, active
    cy.get('[data-testid="permit-ACTIVE"]').should("exist");
    cy.contains("222 License St, 12345 NJ").should("exist");
    cy.contains("Insurance Certificate").should("exist");
  });
});

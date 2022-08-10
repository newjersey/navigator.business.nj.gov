/* eslint-disable cypress/no-unnecessary-waiting */
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { completeNewBusinessOnboarding, updateNewBusinessProfilePage } from "cypress/support/helpers";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("search business name [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("searches available names", () => {
    const businessName = "Aculyst";
    const industry = LookupIndustryById("e-commerce");
    const legalStructureId = "limited-partnership";

    completeNewBusinessOnboarding({
      industry,
      legalStructureId,
    });

    // dashboard business name
    updateNewBusinessProfilePage({ businessName });
    onDashboardPage.getEditProfileLink().should("exist");

    // search name
    cy.get('[data-task="search-business-name"]').click();
    cy.get('input[aria-label="Search business name"]').should("have.value", businessName);
    cy.get('button[data-testid="search-availability"]').click();

    // unavailable
    cy.get('[data-testid="unavailable-text"]').should("exist");
    cy.get('[data-testid="available-text"]').should("not.exist");

    // try a new name
    cy.get('input[aria-label="Search business name"]').clear();
    cy.get('input[aria-label="Search business name"]').type("My Cool Business");
    cy.get('button[data-testid="search-availability"]').click();

    // available
    cy.get('[data-testid="available-text"]').should("exist");
    cy.get('[data-testid="unavailable-text"]').should("not.exist");

    // update name
    cy.get('[data-testid="update-name"]').click();
    cy.get('[data-testid="back-to-dashboard"]').click();
    onDashboardPage.getEditProfileLink().should("exist");
  });
});

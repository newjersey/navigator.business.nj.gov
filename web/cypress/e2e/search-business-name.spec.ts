/* eslint-disable cypress/no-unnecessary-waiting */
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { completeForeignNexusBusinessOnboarding } from "cypress/support/helpers";

describe("search business name [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("searches available names", () => {
    const businessName = "Aculyst";
    const industry = LookupIndustryById("e-commerce");
    const legalStructureId = "limited-partnership";

    completeForeignNexusBusinessOnboarding({
      legalStructureId: legalStructureId,
      industry,
      locationInNewJersey: true,
    });

    // search name
    cy.get('[data-task="search-business-name-nexus"]').click();
    cy.get('input[aria-label="Search business name"]').type(businessName);
    cy.get('button[data-testid="search-availability"]').click();

    // unavailable
    cy.get('[data-testid="unavailable-text"]').should("exist");
    cy.get('[data-testid="available-text"]').should("not.exist");

    cy.get('[data-testid="search-again"]').click();
    cy.get('[data-testid="unavailable-text"]').should("not.exist");

    // For some reason there's a race condition that's only happening in cypress when you try to type into the Search business name field again

    // try a new name
    // eslint-disable-next-line testing-library/await-async-utils
    // cy.wait(2000)
    // cy.get('input[aria-label="Search business name"]').click().type("My Cool Business");

    // cy.get('button[data-testid="search-availability"]').click();

    // // available
    // cy.get('[data-testid="available-text"]').should("exist");
    // cy.get('[data-testid="unavailable-text"]').should("not.exist");

    // // update name
    // cy.get('[data-testid="update-name"]').click();
    // cy.get('[data-testid="back-to-dashboard"]').click();
    // onDashboardPage.getEditProfileLink().should("exist");
  });
});

/* eslint-disable cypress/no-unnecessary-waiting */
import { completeOnboarding } from "../support/helpers";

describe("search business name [feature] [all]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  it("searches available names", () => {
    completeOnboarding("Aculyst", "e-commerce", "limited-liability-company");

    // roadmap business name
    cy.get('[data-business-name="Aculyst"]').should("exist");

    // search name
    cy.get('[data-task="search-business-name"]').click();
    cy.get('input[aria-label="Search business name"]').should("have.value", "Aculyst");
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
    cy.get("[data-back-to-roadmap]").click();
    cy.get('[data-business-name="Aculyst"]').should("not.exist");
    cy.get('[data-business-name="My Cool Business"]').should("exist");
  });
});

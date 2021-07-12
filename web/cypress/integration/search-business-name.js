/* eslint-disable cypress/no-unnecessary-waiting */

import { clickNext } from "../support/helpers";

describe("search business name", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  it("searches available names", () => {
    cy.wait(1000); // wait for onboarding animation

    cy.get('input[aria-label="Business name"]').type("Aculyst");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="e-commerce"]').click();
    clickNext();

    cy.get('[data-value="limited-liability-company"]').click();
    clickNext();

    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    clickNext();

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

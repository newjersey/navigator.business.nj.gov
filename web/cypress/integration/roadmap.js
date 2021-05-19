/* eslint-disable cypress/no-unnecessary-waiting */

import { clickEdit, clickNext } from "../support/helpers";

describe("Roadmap", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  it("enters user info and shows the roadmap", () => {
    cy.get("[data-get-started]").click();
    cy.wait(1000); // wait for onboarding animation

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="e-commerce"]').click();
    clickNext();

    cy.get('[data-value="general-partnership"]').click();
    clickNext();

    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    clickNext();

    // check roadmap
    cy.get('[data-business-name="Beesapple\'s"]').should("exist");
    cy.get('[data-industry="e-commerce"]').should("exist");
    cy.get('[data-legal-structure="general-partnership"]').should("exist");
    cy.get('[data-municipality="Absecon"]').should("exist");

    // step 1
    cy.get('[data-step="create-business-plan"]').should("exist");
    cy.get('[data-task="business-plan"]').should("exist");

    // step 2
    cy.get('[data-step="due-diligence"]').should("exist");
    cy.get('[data-task="research-insurance-needs"]').should("exist");

    // step 3
    cy.get('[data-step="register-business"]').should("exist");
    cy.get('[data-task="register-trade-name"]').should("exist");

    // step 4
    cy.get('[data-step="lease-and-permits"]').should("exist");

    // tasks screen
    cy.get('[data-task="register-trade-name"]').click();
    cy.get('[data-business-name="Beesapple\'s"]').should("not.exist");
    cy.get('[data-task-id="register-trade-name"]').should("exist");

    // tasks mini-nav
    cy.get('[data-step="lease-and-permits"]').click();
    cy.get('[data-task="check-local-requirements"]').click();
    cy.get('[data-task-id="register-trade-name"]').should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.contains("Absecon").should("exist");

    cy.get("[data-back-to-roadmap]").click();

    // editing data
    clickEdit();

    cy.get('input[aria-label="Business name"]').clear();
    cy.get('input[aria-label="Business name"]').type("Applebee's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="restaurant"]').click();
    clickNext();
    clickNext();
    clickNext();

    // check roadmap
    cy.get('[data-business-name="Applebee\'s"]').should("exist");
    cy.get('[data-industry="restaurant"]').should("exist");
    cy.get('[data-legal-structure="general-partnership"]').should("exist");
    cy.get('[data-municipality="Absecon"]').should("exist");

    cy.get('[data-task="check-site-requirements"]').should("exist");
    cy.get('[data-task="food-safety-course"]').should("exist");
  });
});

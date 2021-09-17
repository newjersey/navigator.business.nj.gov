/* eslint-disable cypress/no-unnecessary-waiting */

import { clickEdit, clickNext, completeOnboarding } from "../support/helpers";

describe("Roadmap [feature] [all]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
    cy.viewport("iphone-5");
  });

  it("enters user info and shows the roadmap", () => {
    // onboarding
    completeOnboarding("Beesapple's", "e-commerce", "general-partnership", false);

    cy.url().should("contain", "/roadmap");

    // check roadmap
    cy.get('[data-business-name="Beesapple\'s"]').should("exist");
    cy.get('[data-industry="e-commerce"]').should("exist");
    cy.get('[data-legal-structure="general-partnership"]').should("exist");
    cy.get('[data-municipality="Absecon"]').should("exist");

    // step 1
    cy.get('[data-step="1"]').should("exist");
    cy.get('[data-task="business-plan"]').should("exist");

    // step 2
    cy.get('[data-step="2"]').should("exist");
    cy.get('[data-task="research-insurance-needs"]').should("exist");

    // step 3
    cy.get('[data-step="3"]').should("exist");
    cy.get('[data-task="register-trade-name"]').should("exist");

    // step 4
    cy.get('[data-step="4"]').should("exist");

    // tasks screen
    cy.get('[data-task="register-trade-name"]').click();
    cy.get('[data-business-name="Beesapple\'s"]').should("not.exist");
    cy.get('[data-task-id="register-trade-name"]').should("exist");

    // tasks mini-nav
    cy.get("[data-hamburger]").click();
    cy.get('[data-step="5"]').click();
    cy.get('[data-task="check-local-requirements"]').click();
    cy.get('[data-task-id="register-trade-name"]').should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.contains("Absecon").should("exist");

    // task mini-nav - open and close user settings
    cy.get("[data-hamburger]").click();
    cy.get("[data-my-nj-profile-link]").should("not.be.visible");
    cy.get("[data-log-out-button]").should("not.be.visible");
    cy.get("[data-open-user-settings]").click();
    cy.get("[data-my-nj-profile-link]").should("be.visible");
    cy.get("[data-log-out-button]").scrollIntoView();
    cy.get("[data-log-out-button]").should("be.visible");
    cy.get("[data-open-user-settings]").click();
    cy.get("[data-my-nj-profile-link]").should("not.be.visible");
    cy.get("[data-log-out-button]").should("not.be.visible");
    cy.get("[data-task='check-local-requirements']").click();
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

  it("open and closes contextual info panel on onboarding screens", () => {
    cy.wait(1000); // wait for onboarding animation

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="home-contractor"]').click();
    cy.get('[data-contextual-info-id="home-contractors-activities"]').click();
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click();
    cy.get('[data-testid="info-panel"]').should("not.exist");
    clickNext();

    cy.get('[data-contextual-info-id="legal-structure-learn-more"]').click();
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click();
    cy.get('[data-testid="info-panel"]').should("not.exist");
    cy.get('[data-contextual-info-id="llc"]').click();
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click();
    cy.get('[data-testid="info-panel"]').should("not.exist");
    cy.get('[data-value="general-partnership"]').click();
    clickNext();

    cy.get('input[type="radio"][value="false"]').check();
    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    clickNext();
  });

  it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
    // onboarding
    completeOnboarding("Beesapple's", "e-commerce", "general-partnership", false);

    // roadmap
    cy.get('[data-task="register-for-ein"]').click();
    cy.get('[data-contextual-info-id="ein"]').should("exist");
    cy.get('[data-contextual-info-id="ein"]').click();

    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click();
    cy.get('[data-testid="info-panel"]').should("not.exist");
  });
});

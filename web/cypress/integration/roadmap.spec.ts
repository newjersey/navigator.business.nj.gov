/* eslint-disable cypress/no-unnecessary-waiting */

import { clickEdit, clickNext } from "../support/helpers";

describe("Roadmap", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  const onboarding = () => {
    cy.wait(1000); // wait for onboarding animation

    cy.url().should("contain", "/onboarding");

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="e-commerce"]').click();
    clickNext();

    cy.get('[data-value="general-partnership"]').click();
    clickNext();

    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    cy.get('input[type="radio"][value="false"]').check();
    clickNext();

    cy.url().should("contain", "/roadmap");
  };

  it("enters user info and shows the roadmap", () => {
    // onboarding
    onboarding();

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
    cy.get('[data-step="5"]').click();
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

  it("open and closes contextual info panel on onboarding screens", () => {
    cy.wait(1000); // wait for onboarding animation

    // onboarding
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

    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    cy.get('input[type="radio"][value="false"]').check();
    clickNext();
  });

  it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
    // onboarding
    onboarding();

    // roadmap
    cy.get('[data-task="register-for-ein"]').click();
    cy.get('[data-contextual-info-id="ein"]').should("exist");
    cy.get('[data-contextual-info-id="ein"]').click();

    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click();
    cy.get('[data-testid="info-panel"]').should("not.exist");
  });
});

/* eslint-disable cypress/no-unnecessary-waiting */

describe("Roadmap", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  afterEach(() => {
    cy.resetUserData();
  });

  it("enters user info and shows the roadmap", () => {
    cy.get("[data-get-started]").click();

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="e-commerce"]').click();
    clickNext();

    cy.get('[aria-label="Legal structure"]').click();
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
    cy.get('[data-task="executive-summary"]').should("exist");

    // step 2
    cy.get('[data-step="due-diligence"]').should("exist");
    cy.get('[data-task="research-insurance-needs"]').should("exist");

    // step 3 - GP
    cy.get('[data-step="register-business"]').should("exist");
    cy.get('[data-task="register-trade-name"]').should("exist");

    // step 4
    cy.get('[data-step="lease-and-permits"]').should("exist");

    // tasks screen
    cy.get('[data-task="register-trade-name"]').click();
    cy.get('[data-business-name="Beesapple\'s"]').should("not.exist");
    cy.get('[data-task-id="register-trade-name"]').should("exist");

    // tasks mini-nav
    cy.get('[data-step="due-diligence"]').click();
    cy.get('[data-task="research-insurance-needs"]').click();

    cy.get('[data-task-id="register-trade-name"]').should("not.exist");
    cy.get('[data-task-id="research-insurance-needs"]').should("exist");
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

const clickNext = () => {
  cy.get("[data-next]:visible").click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

const clickEdit = () => {
  cy.get("[data-grey-callout-link]").click();
  cy.wait(1000); // wait for onboarding animation
};

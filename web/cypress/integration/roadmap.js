/* eslint-disable cypress/no-unnecessary-waiting */

describe("Roadmap", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  afterEach(() => {
    cy.resetUserData();
  });

  it("enters user info and shows the roadmap", () => {
    cy.contains("Get Started").click();

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="e-commerce"]').click();
    clickNext();

    cy.get('[aria-label="Legal structure"]').click();
    cy.get('[data-value="general-partnership"]').click();
    clickNext();

    // check roadmap
    cy.contains("Business Roadmap for Beesapple's").should("exist");

    // check roadmap
    cy.contains("Business Name: Beesapple's").should("exist");
    cy.contains("Industry: E-Commerce").should("exist");
    cy.contains("Legal Entity: General Partnership").should("exist");

    // step 1
    cy.contains("Create a Business Plan").should("exist");
    cy.contains("Executive Summary").should("exist");

    // step 2
    cy.contains("Due Diligence").should("exist");
    cy.contains("Research Potential Insurance Needs").should("exist");

    // step 3 - GP
    cy.contains("Form & Register Your Business").should("exist");
    cy.contains("Register a Trade Name").should("exist");
    cy.contains("Register for an EIN").should("exist");
    cy.contains("Register for Tax Purposes with DORES").should("exist");

    // step 4
    cy.contains("Sign Your Lease and File Licenses & Local Permits").should("exist");

    // tasks screen
    cy.contains("Register a Trade Name").click();
    cy.contains("Business Roadmap for Beesapple's").should("not.exist");
    cy.contains("Destination: County Clerk").should("exist");

    // tasks mini-nav
    cy.contains("Due Diligence").click();
    cy.contains("Research Potential Insurance Needs").click();
    cy.contains("You may consider obtaining insurance for your business").should("exist");

    cy.contains("← Back to Roadmap").click();

    // editing data
    cy.contains("Edit").click();

    cy.get('input[aria-label="Business name"]').clear();
    cy.get('input[aria-label="Business name"]').type("Applebee's");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="restaurant"]').click();
    clickNext();
    clickNext();

    // check roadmap
    cy.contains("Business Roadmap for Applebee's").should("exist");
    cy.contains("Business Name: Applebee's").should("exist");
    cy.contains("Industry: Restaurant").should("exist");
    cy.contains("Legal Entity: General Partnership").should("exist");

    // step 1
    cy.contains("Check and Plan Local Site Requirements").should("exist");
    cy.contains("Identify a potential lease").should("exist");
  });
});

const clickNext = () => {
  cy.contains("Next").click({ force: true });
  cy.wait(200);
};

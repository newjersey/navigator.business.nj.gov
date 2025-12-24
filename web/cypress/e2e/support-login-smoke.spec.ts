/* eslint-disable cypress/no-unnecessary-waiting */
describe("check login support page [smoke]", () => {
  beforeEach(() => {
    cy.visit("/support/login");
    cy.wait(3000);
  });
  it("loads properly", () => {
    cy.contains("h1", "Having trouble logging in to Business.NJ.gov?").should("exist");
  });
});

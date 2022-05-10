/* eslint-disable cypress/no-unnecessary-waiting */

describe("check login page [smoke]", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.wait(5000);
  });
  it("loads properly", () => {
    cy.get('button[data-testid="login-button"]').should("exist");
  });
});

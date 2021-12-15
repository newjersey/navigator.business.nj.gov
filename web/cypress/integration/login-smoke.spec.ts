/* eslint-disable cypress/no-unnecessary-waiting */

describe("check login page [smoke]", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("loads properly", () => {
    cy.get('button[data-testid="login-button"]').should("exist");
  });
});

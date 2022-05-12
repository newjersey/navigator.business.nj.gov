/* eslint-disable cypress/no-unnecessary-waiting */

describe("check login page [smoke]", () => {
  beforeEach(() => {
    cy.visit("/")
      // eslint-disable-next-line testing-library/await-async-utils
      .wait(5000);
  });
  it("loads properly", () => {
    cy.get('button[data-testid="login-button"]').should("exist");
  });
});

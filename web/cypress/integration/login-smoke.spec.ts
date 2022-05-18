/* eslint-disable cypress/no-unnecessary-waiting */

describe("check login page [smoke]", () => {
  beforeEach((done) => {
    // disable uncaught exceptions just for this test
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include(
        "The following error originated from your application code, not from Cypress"
      );
      done();
      return false;
    });

    cy.visit("/")
      // eslint-disable-next-line testing-library/await-async-utils
      .wait(5000);
  });
  it("loads properly", () => {
    cy.get('button[data-testid="login-button"]').should("exist");
  });
});

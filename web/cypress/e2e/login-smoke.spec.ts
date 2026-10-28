describe("check login page [smoke]", () => {
  beforeEach((done) => {
    // disable uncaught exceptions just for this test
    cy.on("uncaught:exception", () => {
      done();
      return false;
    });

    cy.visit("/").wait(5000);
  });
  it("loads properly", () => {
    cy.get('button[data-testid="login-button"]').should("exist");
  });
});

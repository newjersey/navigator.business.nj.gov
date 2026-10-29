describe("unusedContent page [feature] [all] [group3]", () => {
  describe("when not authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit("/mgmt/unusedContent");
      cy.get('input[data-testid="mgmt-password-field"]').should("be.visible");
    });
    it("loads the auth screen", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-button"]').should("exist");
    });

    it("allows the user to login", () => {
      cy.get('input[data-testid="mgmt-password-field"]').clear();
      cy.get('input[data-testid="mgmt-password-field"]').type(Cypress.env("ADMIN_PASSWORD"));
      cy.get('button[data-testid="mgmt-submit-button"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });

  describe("when authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.loginByCognitoApi();
      cy.visit("/mgmt/unusedContent");
      cy.get('input[data-testid="mgmt-password-field"]').should("be.visible");
    });
    it("loads the auth screen when not authenticated with cognito", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-button"]').should("exist");
    });

    it("allows the user to login", () => {
      cy.get('input[data-testid="mgmt-password-field"]').clear();
      cy.get('input[data-testid="mgmt-password-field"]').type(Cypress.env("ADMIN_PASSWORD"));
      cy.get('button[data-testid="mgmt-submit-button"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });
});

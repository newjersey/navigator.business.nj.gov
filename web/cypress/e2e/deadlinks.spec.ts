/* eslint-disable cypress/no-unnecessary-waiting */

describe("unusedContent page [feature] [all] [group3]", () => {
  describe("when not authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      // Access another mgmt page first to break any routing cache
      cy.request("/mgmt/feature-flags").then((response) => {
        cy.log(`Feature flags status: ${response.status}`);
      });
      // Try cy.request first to see if it works
      cy.request({ url: "/mgmt/unusedContent", failOnStatusCode: false }).then((response) => {
        cy.log(`cy.request unusedContent status: ${response.status}`);
        cy.log(`Response body length: ${response.body.length}`);
      });
      cy.visit("/mgmt/unusedContent", { timeout: 90000, failOnStatusCode: false });
    });
    it("loads the auth screen", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-bttn"]').should("exist");
    });

    it("allows the user to login", () => {
      // React 19: Use selectall+backspace instead of clear() for controlled inputs
      cy.get('input[data-testid="mgmt-password-field"]').focus();
      cy.get('input[data-testid="mgmt-password-field"]').type("{selectall}{backspace}", {
        force: true,
      });
      cy.get('input[data-testid="mgmt-password-field"]').type("Test1!", { force: true });
      cy.get('button[data-testid="mgmt-submit-bttn"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });

  describe("when authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.loginByCognitoApi();
      // Access another mgmt page first to break any routing cache
      cy.request("/mgmt/feature-flags");
      cy.visit("/mgmt/unusedContent", { timeout: 90000, failOnStatusCode: false });
    });
    it("loads the auth screen when not authenticated with cognito", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-bttn"]').should("exist");
    });

    it("allows the user to login", () => {
      // React 19: Use selectall+backspace instead of clear() for controlled inputs
      cy.get('input[data-testid="mgmt-password-field"]').focus();
      cy.get('input[data-testid="mgmt-password-field"]').type("{selectall}{backspace}", {
        force: true,
      });
      cy.get('input[data-testid="mgmt-password-field"]').type("Test1!", { force: true });
      cy.get('button[data-testid="mgmt-submit-bttn"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });
});

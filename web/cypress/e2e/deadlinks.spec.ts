/* eslint-disable cypress/no-unnecessary-waiting */

describe("deadlinks page [feature] [all] [group3]", () => {
  describe("when not authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit("/mgmt/deadlinks")
        // eslint-disable-next-line testing-library/await-async-utils
        .wait(5000);
    });
    it("loads the auth screen", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-bttn"]').should("exist");
    });

    it("allows the user to login", () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cy.get('input[data-testid="mgmt-password-field"]').clear();
      cy.get('input[data-testid="mgmt-password-field"]').type("Test1!");
      cy.get('button[data-testid="mgmt-submit-bttn"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });

  describe("when authenticated with cognito", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.loginByCognitoApi();
      cy.visit("/mgmt/deadlinks")
        // eslint-disable-next-line testing-library/await-async-utils
        .wait(5000);
    });
    it("loads the auth screen when not authenticated with cognito", () => {
      cy.get('input[data-testid="mgmt-password-field"]').should("exist");
      cy.get('button[data-testid="mgmt-submit-bttn"]').should("exist");
    });

    it("allows the user to login", () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cy.get('input[data-testid="mgmt-password-field"]').clear();
      cy.get('input[data-testid="mgmt-password-field"]').type("Test1!");
      cy.get('button[data-testid="mgmt-submit-bttn"]').click();
      cy.get('[data-testid="dl-task-header"]').should("exist");
    });
  });
});

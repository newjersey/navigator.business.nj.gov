import { completeExistingBusinessOnboarding } from "cypress/support/helpers";

describe("existing business [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("navigates through onboarding for existing business", () => {
    completeExistingBusinessOnboarding({});
  });
});

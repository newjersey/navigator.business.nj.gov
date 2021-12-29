/* eslint-disable cypress/no-unnecessary-waiting */

import { clickEdit, completeOnboarding } from "../support/helpers";

describe("Profile [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });
  it("displays correctly", () => {
    // onboarding
    completeOnboarding("Crab Shack", "restaurant", "general-partnership");

    cy.url().should("contain", "/roadmap");
    clickEdit();
    cy.get('[data-testid="onboardingFieldContent-businessName"]').should("exist");
  });
});

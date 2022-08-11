/* eslint-disable cypress/no-unnecessary-waiting */
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Gradual Graduation [feature] [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });
  it("graduates the user", () => {
    const legalStructureId = "limited-liability-company";

    completeNewBusinessOnboarding({
      legalStructureId,
    });

    cy.url().should("contain", "/dashboard");

    //formation-nudge
    cy.get('[data-testid="formation-nudge"]').should("exist");
    cy.get('[data-task="form-business-entity"]').click({ force: true });
    cy.get(`[data-industry='limited-liability-company']`).should("not.exist");
    cy.get('[data-task-id="form-business-entity"]').should("exist");
    cy.get('[data-testid="NOT_STARTED"]').click({ force: true });
    cy.get('[data-testid="COMPLETED"]').click({ force: true });
    cy.chooseDatePicker('[name="dateOfFormation"]', "08/2022");
    cy.get('[data-testid="modal-button-primary"]').click({ force: true });

    // tax nudge
    cy.get('[data-testid="tax-registration-nudge"]').should("exist");
  });
});

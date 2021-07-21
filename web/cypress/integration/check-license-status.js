/* eslint-disable cypress/no-unnecessary-waiting */

import { clickNext } from "../support/helpers";

describe("check license status", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  it("searches and checks license status", () => {
    cy.wait(1000); // wait for onboarding animation

    cy.get('input[aria-label="Business name"]').type("Aculyst");
    clickNext();

    cy.get('[aria-label="Industry"]').click();
    cy.get('[data-value="home-contractor"]').click(); // need to be HIC for the task ID to work
    clickNext();

    cy.get('[data-value="limited-liability-company"]').click();
    clickNext();

    cy.get('[aria-label="Location"]').click();
    cy.contains("Absecon").click();
    clickNext();

    // roadmap business name
    cy.get('[data-business-name="Aculyst"]').should("exist");

    // application tab
    cy.get('[data-task="register-consumer-affairs"]').click();
    cy.get('button[data-testid="cta-secondary"]').click();

    // check status tab, error messages
    cy.get('input[data-testid="business-name"]').should("have.value", "Aculyst");
    cy.get('input[data-testid="zipcode"]').type("12345");
    cy.get('button[data-testid="check-status-submit"]').click();

    cy.get('[data-testid="error-alert-FIELDS_REQUIRED"]').should("exist");

    cy.get('input[data-testid="address-1"]').type("123 Main Street");
    cy.get('button[data-testid="check-status-submit"]').click();

    cy.get('[data-testid="error-alert-NOT_FOUND"]').should("exist");

    // re-load page, come back to same page
    cy.visit("/tasks/register-consumer-affairs");
    cy.get('input[data-testid="business-name"]').should("have.value", "Aculyst");
    cy.get('input[data-testid="address-1"]').should("have.value", "123 Main Street");
    cy.get('input[data-testid="zipcode"]').should("have.value", "12345");

    // enter real address
    cy.get('input[data-testid="address-1"]').clear();
    cy.get('input[data-testid="address-1"]').type("111 Business St");
    cy.get('button[data-testid="check-status-submit"]').click();

    // receipt screen, pending
    cy.get('[data-testid="permit-PENDING"]').should("exist");
    cy.contains("Certificate of CGL Insurance").should("exist");
    cy.contains("Business Formation Documents").should("exist");
    cy.contains("Aculyst").should("exist");
    cy.contains("111 Business St, 12345 NJ").should("exist");

    // re-load page, come back to same page
    cy.visit("/tasks/register-consumer-affairs");
    cy.get('[data-testid="permit-PENDING"]').should("exist");

    // different address
    cy.get('button[data-testid="edit-button"]').click();
    cy.get('input[data-testid="address-1"]').clear();
    cy.get('input[data-testid="address-1"]').type("222 License St");
    cy.get('button[data-testid="check-status-submit"]').click();

    // receipt screen, active
    cy.get('[data-testid="permit-ACTIVE"]').should("exist");
    cy.contains("222 License St, 12345 NJ").should("exist");
    cy.contains("Insurance Certificate").should("exist");
  });
});

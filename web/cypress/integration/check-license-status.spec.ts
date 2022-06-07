/* eslint-disable cypress/no-unnecessary-waiting */
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import { completeNewBusinessOnboarding, updateNewBusinessProfilePage } from "../support/helpers";

describe("check license status [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("searches and checks license status", () => {
    const industry = LookupIndustryById("home-contractor");
    const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
    const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
    const requiresCpa = industry.isCpaRequiredApplicable === false ? undefined : false;
    const legalStructureId = "general-partnership";
    const townDisplayName = "Absecon";

    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      requiresCpa,
      legalStructureId,
      townDisplayName,
    });

    // roadmap business name
    updateNewBusinessProfilePage({ businessName: "Aculyst" });
    onRoadmapPage.getEditProfileLink().should("exist");

    // application tab
    cy.get('[data-task="register-consumer-affairs"]').click();
    cy.get('button[data-testid="cta-secondary"]').click();
    cy.intercept(`${Cypress.env("API_BASE_URL")}/api/users/*`).as("userAPI");
    // check status tab, error messages
    cy.get('input[data-testid="business-name"]').should("have.value", "Aculyst");
    cy.get('input[data-testid="zipcode"]').type("12345");
    cy.get('button[data-testid="check-status-submit"]').click();

    cy.get('[data-testid="error-alert-FIELDS_REQUIRED"]').should("exist");

    cy.get('input[data-testid="address-1"]').type("123 Main Street");
    cy.get('button[data-testid="check-status-submit"]').click();

    cy.get('[data-testid="error-alert-NOT_FOUND"]').should("exist");
    // eslint-disable-next-line testing-library/await-async-utils
    cy.wait("@userAPI");
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

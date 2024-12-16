/* eslint-disable cypress/no-unnecessary-waiting */
import {
  clickModalSaveButton,
  completeBusinessStructureTask,
  openFormationDateModal,
  randomPublicFilingLegalStructure,
  selectDate,
  selectLocation,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { randomNonHomeBasedIndustry } from "@businessnjgovnavigator/cypress/support/helpers/helpers-select-industries";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";

describe("auto tax filing [feature] [all] [group4]", () => {
  let businessName: string;
  beforeEach(() => {
    cy.loginByCognitoApi();
    businessName = "Cool Business Name";
  });

  // TODO: There is an issue in Cypress where the value of the taxId is being entered incorrectly by the automation. Need to investigate further. Temporarily skipping this test to avoid false failures.
  it.skip("automatically registers for Gov2Go and retrieves tax events if business name and tax id are provided", () => {
    completeNewBusinessOnboarding({ industry: randomNonHomeBasedIndustry() });
    completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

    onDashboardPage.getEditProfileLink().should("exist");
    cy.visit("/profile");
    cy.get('input[data-testid="businessName"]').type(businessName);
    onProfilePage.getSaveButton().first().click();
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    onDashboardPage.registerForTaxes();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("not.exist");
    cy.get('[data-testid="alert-content-container"]').should("exist");
    onDashboardPage.getTaxFilingCalendar().should("contain", "Your Tax Calendar is pending.");
    onDashboardPage.getTaxFilingCalendar().should("contain", "Sales and Use Tax");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing business name", () => {
    completeNewBusinessOnboarding({ industry: randomNonHomeBasedIndustry() });
    completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

    onDashboardPage.getEditProfileLink().should("exist");
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    onDashboardPage.registerForTaxes();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("exist");
    cy.get('[data-testid="alert-content-container"]').should("not.exist");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing tax id", () => {
    completeNewBusinessOnboarding({ industry: randomNonHomeBasedIndustry() });
    completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

    onDashboardPage.getEditProfileLink().should("exist");
    cy.visit("/profile");
    cy.get('input[data-testid="businessName"]').type(businessName);
    onProfilePage.getSaveButton().first().click();
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("exist");
    cy.get('[data-testid="alert-content-container"]').should("not.exist");
  });
});

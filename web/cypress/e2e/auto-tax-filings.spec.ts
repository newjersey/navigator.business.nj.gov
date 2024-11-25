/* eslint-disable cypress/no-unnecessary-waiting */
import {
  clickModalSaveButton,
  completeBusinessStructureTask,
  openFormationDateModal,
  selectDate,
  selectLocation,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("auto tax filing [feature] [all] [group4]", () => {
  let businessName: string;
  beforeEach(() => {
    cy.loginByCognitoApi();
    const industry = LookupIndustryById("cosmetology");
    const legalStructureId = "limited-liability-company";
    businessName = "Make Me Pretty";

    completeNewBusinessOnboarding({ industry });
    completeBusinessStructureTask({ legalStructureId });

    onDashboardPage.getEditProfileLink().should("exist");
  });

  it("automatically registers for Gov2Go and retrieves tax events if business name and tax id are provided", () => {
    cy.visit("/profile");
    cy.get('input[data-testid="businessName"]').type(businessName);
    onProfilePage.getSaveButton().first().click();
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    onProfilePage.registerForTaxes();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("not.exist");
    cy.get('[data-testid="alert-content-container"]').should("exist");
    onProfilePage.getTaxFilingCalendar().should("contain", "Your Tax Calendar is pending.");
    onProfilePage.getTaxFilingCalendar().should("contain", "November 20, 2024");
    onProfilePage.getTaxFilingCalendar().should("contain", "Sales and Use Tax");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing business name", () => {
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    onProfilePage.registerForTaxes();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("exist");
    cy.get('[data-testid="alert-content-container"]').should("not.exist");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing tax id", () => {
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

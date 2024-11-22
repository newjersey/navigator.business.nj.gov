/* eslint-disable cypress/no-unnecessary-waiting */
import {
  clickModalSaveButton,
  completeBusinessStructureTask,
  openFormationDateModal,
  selectDate,
  selectLocation,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("auto tax filing [feature] [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("automatically registers for Gov2Go and retrieves tax events if business name and tax id are provided", () => {
    const industry = LookupIndustryById("cosmetology");
    const legalStructureId = "limited-liability-company";
    const businessName = "Make Me Pretty";

    completeNewBusinessOnboarding({ industry });

    completeBusinessStructureTask({ legalStructureId });

    onDashboardPage.getEditProfileLink().should("exist");

    cy.visit("/profile");
    cy.get('input[data-testid="businessName"]').type(businessName);
    cy.get('button[data-testid="save"]').first().click();
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    cy.get('[data-testid="register-for-taxes"]').first().click();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("not.exist");
    cy.get('[data-testid="alert-content-container"]').should("exist");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing business name", () => {
    const industry = LookupIndustryById("cosmetology");
    const legalStructureId = "limited-liability-company";

    completeNewBusinessOnboarding({ industry });

    completeBusinessStructureTask({ legalStructureId });

    onDashboardPage.getEditProfileLink().should("exist");
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();

    cy.get('[data-testid="register-for-taxes"]').first().click();
    cy.get('input[name="taxId"]').type("123456789098");
    cy.get("button").contains("Save").click();
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("exist");
    cy.get('[data-testid="alert-content-container"]').should("not.exist");
  });

  it("does not automatically register for Gov2Go and retrieve tax filing if missing tax id", () => {
    const industry = LookupIndustryById("cosmetology");
    const legalStructureId = "limited-liability-company";
    const businessName = "Make Me Pretty";

    completeNewBusinessOnboarding({ industry });

    completeBusinessStructureTask({ legalStructureId });

    onDashboardPage.getEditProfileLink().should("exist");

    cy.visit("/profile");
    cy.get('input[data-testid="businessName"]').type(businessName);
    cy.get('button[data-testid="save"]').first().click();
    openFormationDateModal();
    selectDate("04/2021");
    selectLocation("Allendale");
    clickModalSaveButton();
    cy.get('[data-testid="cta-funding-nudge"]').first().click();
    cy.get('[data-testid="get-tax-access"]').should("exist");
    cy.get('[data-testid="alert-content-container"]').should("not.exist");
  });
});

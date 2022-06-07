/* eslint-disable cypress/no-unnecessary-waiting */
import { LookupIndustryById, randomInt } from "@businessnjgovnavigator/shared/";
import { completeNewBusinessOnboarding, updateNewBusinessProfilePage } from "cypress/support/helpers";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";

describe("search business name [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("searches available names", () => {
    const businessName = "Aculyst";
    const industry = LookupIndustryById("e-commerce");
    const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
    const liquorLicenseQuestion =
      industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
    const legalStructureId = "limited-partnership";
    const townDisplayName = undefined;
    const requiresCpa = industry.isCpaRequiredApplicable === false ? undefined : Boolean(randomInt() % 2);

    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      legalStructureId,
      townDisplayName,
      requiresCpa,
    });

    // roadmap business name
    updateNewBusinessProfilePage({ businessName });
    onRoadmapPage.getEditProfileLink().should("exist");

    // search name
    cy.get('[data-task="search-business-name"]').click();
    cy.get('input[aria-label="Search business name"]').should("have.value", businessName);
    cy.get('button[data-testid="search-availability"]').click();

    // unavailable
    cy.get('[data-testid="unavailable-text"]').should("exist");
    cy.get('[data-testid="available-text"]').should("not.exist");

    // try a new name
    cy.get('input[aria-label="Search business name"]').clear();
    cy.get('input[aria-label="Search business name"]').type("My Cool Business");
    cy.get('button[data-testid="search-availability"]').click();

    // available
    cy.get('[data-testid="available-text"]').should("exist");
    cy.get('[data-testid="unavailable-text"]').should("not.exist");

    // update name
    cy.get('[data-testid="update-name"]').click();
    cy.get('[data-testid="back-to-roadmap"]').click();
    onRoadmapPage.getEditProfileLink().should("exist");
  });
});

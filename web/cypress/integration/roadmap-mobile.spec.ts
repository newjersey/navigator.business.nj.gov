/* eslint-disable cypress/no-unnecessary-waiting */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { clickEdit, clickNext, clickSave, completeNewBusinessOnboarding } from "../support/helpers";

describe("Roadmap [feature] [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
    cy.viewport("iphone-5");
  });

  it("enters user info and shows the roadmap", () => {
    const businessName = "Beesapple's";
    const industry = LookupIndustryById("e-commerce");
    const homeBasedQuestion = false;
    const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
    const companyType = "general-partnership";
    const townDisplayName = "Absecon";

    completeNewBusinessOnboarding({
      businessName,
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      companyType,
      townDisplayName,
    });

    // check roadmap
    cy.get('[data-business-name="Beesapple\'s"]').should("exist");
    cy.get('[data-industry="e-commerce"]').should("exist");
    cy.get('[data-legal-structure="general-partnership"]').should("exist");
    cy.get('[data-municipality="Absecon"]').should("exist");

    // step 1
    cy.get('[id="plan-content"]').should("be.visible");
    cy.get('[id="plan-header"]').click({ force: true });
    cy.get('[id="plan-content"]').should("not.be.visible");
    cy.get('[id="plan-header"]').click({ force: true });
    cy.get('[data-step="1"]').should("exist");
    cy.get('[data-task="business-plan"]').should("exist");
    cy.get('[data-task="research-insurance-needs"]').should("exist");

    // step 2
    cy.get('[id="start-content"]').should("be.visible");
    cy.get('[id="start-header"]').click({ force: true });
    cy.get('[id="start-content"]').should("not.be.visible");
    cy.get('[id="start-header"]').click({ force: true });
    cy.get('[id="start-content"]').should("be.visible");
    cy.get('[data-step="2"]').should("exist");
    cy.get('[data-task="register-trade-name"]').should("exist");

    // step 3
    cy.get('[data-step="3"]').should("exist");

    // step 4
    cy.get('[data-step="4"]').should("exist");

    // tasks screen
    cy.get('[data-task="register-trade-name"]').click({ force: true });
    cy.get('[data-business-name="Beesapple\'s"]').should("not.exist");
    cy.get('[data-task-id="register-trade-name"]').should("exist");

    // tasks mini-nav
    cy.get('[data-testid="nav-menu-open"]').click({ force: true });
    cy.get('[data-step="4"]').click({ force: true });
    cy.get('[data-task="check-local-requirements"]').click({ force: true });
    cy.get('[data-task-id="register-trade-name"]').should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.contains("Absecon").should("exist");

    // editing data
    cy.get('[data-testid="back-to-roadmap"]').click({ force: true });
    clickEdit();

    cy.get('input[aria-label="Business name"]').clear();
    cy.get('input[aria-label="Business name"]').type("Applebee's");

    cy.get('[aria-label="Industry"]').click({ force: true });
    cy.contains("Restaurant").click({ force: true });

    clickSave();

    // check roadmap
    cy.get('[data-business-name="Applebee\'s"]').should("exist");
    cy.get('[data-industry="restaurant"]').should("exist");
    cy.get('[data-legal-structure="general-partnership"]').should("exist");
    cy.get('[data-municipality="Absecon"]').should("exist");

    cy.get('[data-task="check-site-requirements"]').should("exist");
    cy.get('[data-task="food-safety-course"]').should("exist");
  });

  it("open and closes contextual info panel on onboarding screens", () => {
    cy.wait(1000); // wait for onboarding animation

    cy.get('input[type="radio"][value="false"]').check();
    clickNext();

    cy.get('input[aria-label="Business name"]').type("Beesapple's");
    clickNext();

    cy.get('[aria-label="Industry"]').click({ force: true });
    cy.contains("Home Improvement Contractor").click({ force: true });
    cy.get('[data-testid="home-contractors-activities"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");
    clickNext();

    cy.get('[data-testid="legal-structure-learn-more"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");
    cy.get('[data-value="general-partnership"]').click({ force: true });
    clickNext();

    cy.get('input[type="radio"][value="false"]').check();
    cy.get('[aria-label="Location"]').click({ force: true });
    cy.contains("Absecon").click({ force: true });
    clickNext();
  });

  it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
    const businessName = "Beesapple's";
    const industry = LookupIndustryById("e-commerce");
    const homeBasedQuestion = false;
    const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
    const companyType = "general-partnership";
    const townDisplayName = "Absecon";

    completeNewBusinessOnboarding({
      businessName,
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      companyType,
      townDisplayName,
    });

    // roadmap
    cy.get('[data-task="register-for-ein"]').click({ force: true });
    cy.get('[data-testid="ein"]').should("exist");
    cy.get('[data-testid="ein"]').click({ force: true });

    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");
  });
});

/* eslint-disable cypress/no-unnecessary-waiting */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Guest Dashboard [feature] [all] [group2]", () => {
  const industry = LookupIndustryById("home-contractor");
  const legalStructureId = "limited-liability-company";
  const townDisplayName = "Atlantic City";

  beforeEach(() => {
    cy.clearCookies();
    cy.window().then((window) => window.sessionStorage.clear());
    cy.visit("/");
    cy.get('[data-testid="hero-login-button"]').click();
    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion: false,
      townDisplayName,
      legalStructureId,
    });
  });

  it("enters user info and shows the dashboard", () => {
    cy.url().should("contain", "/dashboard");

    // check dashboard
    onDashboardPage.getEditProfileLink().should("exist");

    cy.get('[data-testid="self-reg-snackbar"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-snackbar"]').should("not.exist");

    // step 1
    cy.get(`[id="plan-content"]`).should("be.visible");
    cy.get(`[id="plan-header"]`).click({ force: true });
    cy.get(`[id="plan-content"]`).should("not.be.visible");
    cy.get(`[id="plan-header"]`).click({ force: true });
    cy.get(`[data-step="1"]`).should("exist");
    cy.get(`[data-task="business-plan"]`).should("exist");
    cy.get(`[data-task="research-insurance-needs"]`).should("exist");

    // step 3
    cy.get(`[id="start-content"]`).should("be.visible");
    cy.get(`[id="start-header"]`).click({ force: true });
    cy.get(`[id="start-content"]`).should("not.be.visible");
    cy.get(`[id="start-header"]`).click({ force: true });
    cy.get(`[data-step="2"]`).should("exist");
    cy.get(`[data-step="3"]`).should("exist");

    // go to regular task
    cy.get('[data-task="check-local-requirements"]').click({ force: true });
    cy.get(`[data-industry='${industry.id}']`).should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="self-reg-snackbar"]').should("not.exist");

    // go back to dashboard
    cy.log("go back to dashboard");
    cy.get(`[data-testid="back-to-dashboard"]`).click({ force: true });
    cy.get('[data-testid="self-reg-snackbar"]').should("not.exist");

    // go to auth blocked task
    cy.get('[data-task="register-consumer-affairs"]').click({ force: true });
    cy.get('[data-task-id="register-consumer-affairs"]').should("exist");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    // go back to dashboard
    cy.get(`[data-testid="back-to-dashboard"]`).click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="self-reg-snackbar"]').should("not.exist");

    // try editing data in the Profile page
    onDashboardPage.clickEditProfileLink();

    cy.get('input[aria-label="Business name"]').clear().type("Applebee's");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    cy.get(`[data-testid="numbers"]`).click({ force: true });
    cy.get('input[aria-label="Employer id"]').clear().type("123456789");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");

    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
  });
});

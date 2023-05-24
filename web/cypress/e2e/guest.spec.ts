/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import {
  clickDeferredSaveButton,
  completeNewBusinessOnboarding,
  updateNewBusinessProfilePage,
} from "../support/helpers";

// skipping until there is clarity on how save business structure button should behave for guest mode
describe.skip("Guest Dashboard [feature] [all] [group2]", () => {
  const industry = LookupIndustryById("home-contractor");
  const townDisplayName = "Atlantic City";
  const legalStructureId = "limited-liability-company";

  beforeEach(() => {
    cy.clearCookies();
    cy.window().then((window) => {
      return window.sessionStorage.clear();
    });
    cy.visit("/onboarding");
    completeNewBusinessOnboarding({
      industry,
    });
  });

  it("enters user info and shows the dashboard", () => {
    cy.url().should("contain", "/dashboard");

    // check dashboard
    onDashboardPage.getEditProfileLink().should("exist");

    cy.get('[data-testid="self-reg-snackbar"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-snackbar"]').should("not.exist");

    // answer deferred question to get local-requirements task
    onDashboardPage.getHomeBased().should("exist");
    onDashboardPage.selectHomeBased(false);
    clickDeferredSaveButton();
    onDashboardPage.getHomeBased().should("not.exist");
    cy.get('[data-task="identify-potential-lease"]').should("exist");
    cy.wait(1000);

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

    updateNewBusinessProfilePage({
      legalStructureId,
      townDisplayName,
    });

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

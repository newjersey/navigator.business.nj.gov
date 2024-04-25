/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import {
  clickDeferredSaveButton,
  completeBusinessStructureTask,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("Guest Dashboard [feature] [all] [group2]", () => {
  const industry = LookupIndustryById("home-contractor");
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

    cy.get('[data-testid="needs-account-alert"]').should("be.visible");
    cy.wait(7000);
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    completeBusinessStructureTask({ legalStructureId });

    // answer deferred question to get local-requirements task
    onDashboardPage.getHomeBased().should("exist");
    onDashboardPage.selectHomeBased(false);
    clickDeferredSaveButton();
    onDashboardPage.getHomeBased().should("not.exist");
    cy.get('[data-task="identify-potential-lease"]').should("exist");
    cy.wait(1000);

    // step 1
    cy.get(`[id="plan-content"]`).should("be.visible");
    cy.get(`[id="plan-header"]`).first().click({ force: true });
    cy.get(`[id="plan-content"]`).should("not.be.visible");
    cy.get(`[id="plan-header"]`).first().click({ force: true });
    cy.get(`[data-step="1"]`).should("exist");
    cy.get(`[data-task="business-plan"]`).should("exist");
    cy.get(`[data-task="get-insurance-home-contractor"]`).should("exist");

    // step 3
    cy.get(`[id="start-content"]`).should("be.visible");
    cy.get(`[id="start-header"]`).first().click({ force: true });
    cy.get(`[id="start-content"]`).should("not.be.visible");
    cy.get(`[id="start-header"]`).first().click({ force: true });
    cy.get(`[data-step="2"]`).should("exist");
    cy.get(`[data-step="3"]`).should("exist");

    // go to regular task
    cy.get('[data-task="check-local-requirements"]').first().click({ force: true });
    cy.get(`[data-industry='${industry.id}']`).should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    // go back to dashboard
    cy.log("go back to dashboard");
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    // go to auth blocked task
    cy.get('[data-task="register-consumer-affairs"]').first().click({ force: true });
    cy.get('[data-task-id="register-consumer-affairs"]').should("exist");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");
    cy.get('[aria-label="close"]').first().click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    // go back to dashboard
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    // try editing data in the Profile page
    onDashboardPage.clickEditProfileLink();

    cy.get('input[aria-label="Business name"]').clear();
    cy.get('input[aria-label="Business name"]').type("Applebee's");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    cy.get(`[data-testid="numbers"]`).first().click({ force: true });
    cy.get('input[aria-label="Employer id"]').clear();
    cy.get('input[aria-label="Employer id"]').type("123456789");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");

    cy.get('[aria-label="close"]').first().click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
  });
});

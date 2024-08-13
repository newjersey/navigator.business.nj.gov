/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import { completeBusinessStructureTask } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";

describe("Guest Dashboard [feature] [all] [group2]", () => {
  const industry = LookupIndustryById("cosmetology");
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

    completeBusinessStructureTask({ legalStructureId });

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
    cy.get('[data-task="apply-for-shop-license"]').first().click({ force: true });
    cy.get('[data-task-id="apply-for-shop-license"]').should("exist");
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

/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import { completeBusinessStructureTask } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";

describe("Guest Dashboard [feature] [all] [group2]", () => {
  const legalStructureId = "limited-liability-company";

  beforeEach(() => {
    cy.clearCookies();
    cy.window().then((window) => {
      return window.sessionStorage.clear();
    });
    cy.visit("/onboarding");
    completeNewBusinessOnboarding({ industry_id: "cosmetology", isLearningBusiness: false });
  });

  it("enters user info and shows the dashboard", () => {
    cy.url().should("contain", "/dashboard");

    // check dashboard
    onDashboardPage.getDashboardHeader().should("exist");
    completeBusinessStructureTask({ legalStructureId });

    // go to regular task
    cy.get('[data-task="determine-naics-code"]').first().click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    // go back to dashboard
    cy.log("go back to dashboard");
    cy.get(`[data-testid="back-to-dashboard"]`).first().click({ force: true });
    cy.get('[data-testid="needs-account-alert"]').should("not.exist");

    // edit data in the Profile page
    onDashboardPage.clickEditProfileInDropdown();

    cy.get('input[aria-label="Business name"]').clear();
    cy.get('input[aria-label="Business name"]').type("Applebee's");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    onProfilePage.clickSaveButton();
    onDashboardPage.getDashboardHeader().should("exist");
  });
});

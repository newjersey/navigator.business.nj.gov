/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { onProfilePage } from "cypress/support/page_objects/profilePage";
import {
  clickDeferredSaveButton,
  completeExistingBusinessOnboarding,
  completeNewBusinessOnboarding,
  waitForUserDataMountUpdate,
} from "../support/helpers";

const sizes = ["iphone-5", [1024, 768]];
describe("Dashboard [feature] [all] [group2]", () => {
  for (const size of sizes) {
    beforeEach(() => {
      cy.loginByCognitoApi();
      if (Cypress._.isArray(size)) {
        cy.viewport(size[0], size[1]);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cy.viewport(size);
      }
    });

    describe("Owning an existing business", () => {
      it("navigates through onboarding for existing business", () => {
        completeExistingBusinessOnboarding({});
        cy.url().should("contain", "/dashboard");
        // check dashboard
        onDashboardPage.getEditProfileLink().should("exist");
      });
    });

    describe("Starting a Business", () => {
      it("enters user info and shows the dashboard", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
          legalStructureId,
        });

        // check dashboard
        onDashboardPage.getEditProfileLink().should("exist");

        // step 1
        cy.get('[id="plan-content"]').should("be.visible");
        cy.get('[id="plan-header"]').click({ force: true });
        cy.get('[id="plan-content"]').should("not.be.visible");
        cy.get('[id="plan-header"]').click({ force: true });
        cy.get('[data-step="1"]').should("exist");
        cy.get('[data-task="business-plan"]').should("exist");
        cy.get('[data-task="research-insurance-needs"]').should("exist");

        // step 3
        cy.get('[id="start-content"]').should("be.visible");
        cy.get('[id="start-header"]').click({ force: true });
        cy.get('[id="start-content"]').should("not.be.visible");
        cy.get('[id="start-header"]').click({ force: true });
        cy.get('[data-step="2"]').should("exist");
        cy.get('[data-task="register-trade-name"]').should("exist");

        // step 4
        cy.get('[data-step="3"]').should("exist");
      });

      it("verifies the task screen and mini-roadmap displays", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
          legalStructureId,
        });

        waitForUserDataMountUpdate();

        // answer deferred question to get local-requirements task
        onDashboardPage.getHomeBased().should("exist");
        onDashboardPage.selectHomeBased(false);
        clickDeferredSaveButton();
        onDashboardPage.getHomeBased().should("not.exist");
        cy.get('[data-task="identify-potential-lease"]').should("exist");
        cy.wait(1000);

        // tasks screen
        cy.get('[data-task="register-trade-name"]').click({ force: true });
        cy.get('[data-legal-structure="general-partnership"]').should("not.exist");
        cy.get('[data-task-id="register-trade-name"]').should("exist");

        // tasks mini-nav
        cy.get('[data-step="4"]').click({ force: true });
        cy.get('[data-task="check-local-requirements"]').click({ force: true });
        cy.get('[data-task-id="register-trade-name"]').should("not.exist");
        cy.get('[data-task-id="check-local-requirements"]').should("exist");

        cy.get('[data-testid="back-to-dashboard"]').click({ force: true });
      });

      it("update the industry and verifies the dashboard tasks are updated", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
          legalStructureId,
        });

        // editing data in the Profile page
        onDashboardPage.clickEditProfileLink();
        cy.url().should("contain", "/profile");

        cy.get('input[aria-label="Business name"]').clear().type("Applebee's");
        cy.get('[aria-label="Industry"]').click({ force: true });
        cy.contains("Restaurant").click({ force: true });
        cy.get('[aria-label="Business structure"]').click({ force: true });
        cy.get('[data-value="limited-liability-company"]').click({ force: true });
        cy.get('[aria-label="Location"]').click({ force: true });
        cy.contains("Allendale").click({ force: true });

        onProfilePage.clickSaveButton();
        cy.url().should("contain", "/dashboard");

        // check dashboard
        onDashboardPage.getEditProfileLink().should("exist");

        cy.get('[data-task="check-site-requirements"]').should("exist");
        cy.get('[data-task="food-safety-course"]').should("exist");
      });

      it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
          legalStructureId,
        });

        // dashboard
        cy.get('[data-task="register-for-ein"]').click({ force: true });
        cy.get('[data-testid="ein"]').should("exist");
        cy.get('[data-testid="ein"]').click({ force: true });

        cy.get('[data-testid="info-panel"]').should("exist");
        cy.get('[aria-label="close panel"]').click({ force: true });
        cy.get('[data-testid="info-panel"]').should("not.exist");
      });
    });
  }
});

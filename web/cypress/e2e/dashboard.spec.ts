/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import { completeBusinessStructureTask } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import {
  completeExistingBusinessOnboarding,
  completeNewBusinessOnboarding,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { onProfilePage } from "cypress/support/page_objects/profilePage";

const sizes = [
  [375, 667],
  [1024, 768],
];

describe("Dashboard [feature] [all] [group2]", () => {
  for (const size of sizes) {
    beforeEach(() => {
      cy.loginByCognitoApi();
      if (Cypress._.isArray(size)) {
        cy.viewport(size[0], size[1]);
      } else {
        // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
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
        onDashboardPage.getDashboardHeader().should("exist");
      });
    });

    describe("Starting a Business", () => {
      it("enters user info and shows the dashboard", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
        });

        completeBusinessStructureTask({ legalStructureId });

        // check dashboard
        onDashboardPage.getDashboardHeader().should("exist");

        // verify required tasks are displayed
        cy.get('[data-task="register-trade-name"]').should("exist");
        cy.get('[data-task="register-for-ein"]').should("exist");
        cy.get('[data-task="register-for-taxes"]').should("exist");
      });

      it("displays progress bar, which updates as tasks are completed", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";
        let beforeBusinessStructurePercentage: number;
        let beforeCheckboxPercentage: number;

        completeNewBusinessOnboarding({
          industry,
        });

        cy.get('[data-testid="section-progress-bar"]').should("exist");

        // capture value before completing business structure task
        cy.get('[data-testid="section-progress-bar"]')
          .first()
          .invoke("attr", "aria-valuenow")
          .then((val) => {
            beforeBusinessStructurePercentage = Number(val);
          });

        completeBusinessStructureTask({ legalStructureId });

        // verify progress bar increased after business structure completion
        cy.get('[data-testid="section-progress-bar"]')
          .first()
          .invoke("attr", "aria-valuenow")
          .then((val) => {
            expect(Number(val)).to.be.greaterThan(beforeBusinessStructurePercentage);
          });

        // capture value before clicking a checkbox
        cy.get('[data-testid="section-progress-bar"]')
          .first()
          .invoke("attr", "aria-valuenow")
          .then((val) => {
            beforeCheckboxPercentage = Number(val);
          });

        // click a checkbox to mark a task as completed
        cy.get('[data-testid="change-task-progress-checkbox"]').first().click({ force: true });
        cy.wait(1000);

        // verify the progress bar value increased after checkbox click
        cy.get('[data-testid="section-progress-bar"]')
          .first()
          .invoke("attr", "aria-valuenow")
          .then((val) => {
            expect(Number(val)).to.be.greaterThan(beforeCheckboxPercentage);
          });
      });

      it("verifies the task screen and mini-roadmap displays", () => {
        const industry = LookupIndustryById("cannabis");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
        });

        completeBusinessStructureTask({ legalStructureId });

        // tasks screen
        cy.get('[data-task="register-trade-name"]').first().click({ force: true });
        cy.wait(1000);
        cy.get('[data-legal-structure="general-partnership"]').should("not.exist");
        cy.get('[data-task-id="register-trade-name"]').should("exist");

        // navigate to another task via mini-roadmap
        cy.get('[data-task="town-mercantile-license"]').first().click({ force: true });
        cy.get('[data-task-id="register-trade-name"]').should("not.exist");
        cy.get('[data-task-id="town-mercantile-license"]').should("exist");

        cy.get('[data-testid="back-to-dashboard"]').first().click({ force: true });
      });

      it("update the industry and verifies the dashboard tasks are updated", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
        });

        completeBusinessStructureTask({ legalStructureId });

        // editing data in the Profile page
        onDashboardPage.clickEditProfileInDropdown();
        cy.url().should("contain", "/profile");

        cy.get('[aria-label="Industry"]').first().click({ force: true });
        cy.contains("Restaurant").first().click({ force: true });
        cy.get('[aria-label="Industry"]').should("have.value", "Restaurant");
        cy.get('[aria-label="Location"]').first().click({ force: true });
        cy.contains("Allendale").first().click({ force: true });
        cy.get('[aria-label="Location"]').should("have.value", "Allendale");

        cy.intercept("POST", "**/api/users").as("saveProfile");
        onProfilePage.clickSaveButton();
        cy.wait("@saveProfile").then(({ request }) => {
          const profileData = request.body.businesses[request.body.currentBusinessId].profileData;
          expect(profileData.industryId).to.equal("restaurant");
          expect(profileData.municipality.displayName).to.equal("Allendale");
        });
        cy.url().should("contain", "/dashboard");

        // check dashboard
        cy.get('[data-task="check-site-requirements"]').should("exist");
        cy.get('[data-task="food-safety-course"]').should("exist");
      });

      it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
        const industry = LookupIndustryById("e-commerce");
        const legalStructureId = "general-partnership";

        completeNewBusinessOnboarding({
          industry,
        });

        completeBusinessStructureTask({ legalStructureId });

        // dashboard
        cy.get('[data-task="register-for-ein"]').first().click({ force: true });
        cy.get('[data-testid="ein"]').should("exist");
        cy.get('[data-testid="ein"]').first().click({ force: true });

        cy.get('[data-testid="info-panel"]').should("exist");
        cy.get('[aria-label="close panel"]').first().click({ force: true });
        cy.get('[data-testid="info-panel"]').should("not.exist");
      });
    });
  }
});

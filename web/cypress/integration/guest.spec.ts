/* eslint-disable cypress/no-unnecessary-waiting */

import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Guest Roadmap [feature] [all] [group2]", () => {
  const industry = LookupIndustryById("home-contractor");
  const legalStructureId = "limited-liability-company";
  const townDisplayName = "Atlantic City";

  beforeEach(() => {
    cy.clearCookies();
    cy.window().then((window) => window.sessionStorage.clear());
    cy.visit("/");
    cy.get('[data-testid="hero"]').click();
    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion: false,
      liquorLicenseQuestion: undefined,
      townDisplayName,
      legalStructureId,
      isContactMeChecked: true,
    });
  });

  it("enters user info and shows the roadmap", () => {
    cy.url().should("contain", "/roadmap");

    // check roadmap
    cy.get(`[data-industry='${industry.id}']`).should("exist");
    cy.get(`[data-legal-structure='${legalStructureId}']`).should("exist");
    cy.get(`[data-municipality='${townDisplayName}']`).should("exist");

    cy.get('[data-testid="self-reg-toast"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-toast"]').should("not.exist");

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
    cy.get('[data-testid="self-reg-toast"]').should("not.exist");

    // go back to roadmap
    cy.get(`[data-testid="back-to-roadmap"]`).click({ force: true });
    cy.get('[data-testid="self-reg-toast"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-toast"]').should("not.exist");

    // go to auth blocked task
    cy.get('[data-task="register-consumer-affairs"]').click({ force: true });
    cy.get('[data-task-id="register-consumer-affairs"]').should("exist");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");
    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    // go back to roadmap
    cy.get(`[data-testid="back-to-roadmap"]`).click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
    cy.get('[data-testid="self-reg-toast"]').should("be.visible");

    // try editing data in the Profile page
    cy.get('[aria-label="close"]').click({ force: true });
    onRoadmapPage.clickEditProfileLink();

    cy.get('input[aria-label="Business name"]').clear().type("Applebee's");
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");

    cy.get('input[aria-label="Employer id"]').clear().type("123456789");
    cy.get('[data-testid="self-reg-modal"]').should("be.visible");

    cy.get('[aria-label="close"]').click({ force: true });
    cy.get('[data-testid="self-reg-modal"]').should("not.exist");
  });
});

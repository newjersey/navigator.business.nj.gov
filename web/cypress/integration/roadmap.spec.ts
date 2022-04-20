/* eslint-disable cypress/no-unnecessary-waiting */

import {
  Industries,
  Industry,
  LegalStructure,
  LegalStructures,
  LookupIndustryById,
} from "@businessnjgovnavigator/shared/";
import { onOnboardingPage } from "cypress/support/page_objects/onboardingPage";
import { onProfilePage } from "cypress/support/page_objects/profilePage";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import { completeNewBusinessOnboarding, randomElementFromArray, randomInt } from "../support/helpers";

describe("Roadmap [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("enters user info and shows the roadmap", () => {
    const industry = LookupIndustryById("e-commerce");
    const homeBasedQuestion = false;
    const liquorLicenseQuestion =
      industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
    const legalStructureId = "general-partnership";
    const townDisplayName = "Absecon";

    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      legalStructureId,
      townDisplayName,
    });

    // check roadmap
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

    // step 3
    cy.get('[id="start-content"]').should("be.visible");
    cy.get('[id="start-header"]').click({ force: true });
    cy.get('[id="start-content"]').should("not.be.visible");
    cy.get('[id="start-header"]').click({ force: true });
    cy.get('[data-step="2"]').should("exist");
    cy.get('[data-task="register-trade-name"]').should("exist");

    // step 4
    cy.get('[data-step="3"]').should("exist");

    // tasks screen
    cy.get('[data-task="register-trade-name"]').click({ force: true });
    cy.get('[data-legal-structure="general-partnership"]').should("not.exist");
    cy.get('[data-task-id="register-trade-name"]').should("exist");

    // tasks mini-nav
    cy.get('[data-step="4"]').click({ force: true });
    cy.get('[data-task="check-local-requirements"]').click({ force: true });
    cy.get('[data-task-id="register-trade-name"]').should("not.exist");
    cy.get('[data-task-id="check-local-requirements"]').should("exist");
    cy.contains("Absecon").should("exist");

    cy.get('[data-testid="back-to-roadmap"]').click({ force: true });

    // editing data in the Profile page
    onRoadmapPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");

    cy.get('input[aria-label="Business name"]').clear().type("Applebee's");
    cy.get('[aria-label="Industry"]').click({ force: true });
    cy.contains("Restaurant").click({ force: true });
    cy.get('[aria-label="Legal structure"]').click({ force: true });
    cy.get('[data-value="limited-liability-company"]').click({ force: true });
    cy.get('[aria-label="Location"]').click({ force: true });
    cy.contains("Allendale").click({ force: true });

    onProfilePage.clickSaveButton();
    cy.url().should("contain", "/roadmap");

    // check roadmap
    cy.get('[data-business-name="Applebee\'s"]').should("exist");
    cy.get('[data-industry="restaurant"]').should("exist");
    cy.get('[data-legal-structure="limited-liability-company"]').should("exist");
    cy.get('[data-municipality="Allendale"]').should("exist");

    cy.get('[data-task="check-site-requirements"]').should("exist");
    cy.get('[data-task="food-safety-course"]').should("exist");
  });

  it("open and closes contextual info panel on onboarding screens", () => {
    cy.url().should("include", "onboarding?page=1");
    onOnboardingPage.selectNewBusiness(false);
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=2");
    onOnboardingPage.selectIndustry("home-contractor");

    cy.get('[data-testid="home-contractors-activities"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=3");
    cy.get('[data-testid="legal-structure-learn-more"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("exist");
    cy.get('[aria-label="close panel"]').click({ force: true });
    cy.get('[data-testid="info-panel"]').should("not.exist");

    onOnboardingPage.selectLegalStructure("general-partnership");
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=4");
    onOnboardingPage.selectLocation("Absecon");
    onOnboardingPage.selectHomeBased(false);
    onOnboardingPage.clickNext();

    cy.url().should("include", "onboarding?page=5");
  });

  it("open and closes contextual info panel on get EIN from the IRS Task screen", () => {
    const industry = LookupIndustryById("e-commerce");
    const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
    const liquorLicenseQuestion =
      industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
    const legalStructureId = "general-partnership";
    const townDisplayName = "Absecon";

    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      legalStructureId,
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

  it("user data is updated if opted into newsletter", () => {
    const industry = randomElementFromArray(Industries as Industry[]) as Industry;
    const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
    const liquorLicenseQuestion =
      industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
    const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
    const townDisplayName = "Absecon";

    cy.intercept("POST", "/local/api/users", (req) => req.continue()).as("new-user");

    completeNewBusinessOnboarding({
      industry,
      homeBasedQuestion,
      liquorLicenseQuestion,
      legalStructureId,
      townDisplayName,
    });

    cy.wait("@new-user").then((event) => {
      cy.log(`Received: ${JSON.stringify(event.request.body.user.externalStatus)}`);
      const expected = {
        success: true,
        status: "SUCCESS",
      };
      cy.log(`Expected: ${JSON.stringify(expected)}`);
      expect(event.request.body.user.externalStatus.newsletter).to.deep.equal(expected);
    });
  });
});

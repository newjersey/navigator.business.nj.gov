/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import {
  clickDeferredSaveButton,
  clickModalSaveButton,
  completeBusinessStructureTask,
  openFormationDateModal,
  randomPublicFilingLegalStructure,
  selectDate,
  selectLocation,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import {
  completeForeignBusinessOnboarding,
  completeForeignNexusBusinessOnboarding,
  completeNewBusinessOnboarding,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { updateNewBusinessProfilePage } from "@businessnjgovnavigator/cypress/support/helpers/helpers-profile";
import {
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-select-industries";
import { onDashboardPage } from "../support/page_objects/dashboardPage";
import { onProfilePage } from "../support/page_objects/profilePage";

describe("Deferred Onboarding [feature] [all] [group5]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("deferred location", () => {
    describe("onboarded as STARTING - PublicFiling", () => {
      const testLocationInThreePlaces = (): void => {
        it("can provide location in Location-Dependent task", () => {
          goToMercantileTask();
          selectLocation("Allendale");
          clickDeferredSaveButton();

          expectLocationSuccessBanner("Allendale");
          expectLocationSpecificContentInTask("Allendale");
          navigateBackToDashboard();
          expectLocationQuestionIsCompletedInProfile("Allendale");
        });

        it("can provide location in Formation Date Modal", () => {
          openFormationDateModal();
          selectDate("04/2021");
          selectLocation("Allendale");
          clickModalSaveButton();

          goToMercantileTask();
          expectLocationSpecificContentInTask("Allendale");
          navigateBackToDashboard();
          expectLocationQuestionIsCompletedInProfile("Allendale");
        });

        it("can provide location in profile", () => {
          updateNewBusinessProfilePage({
            townDisplayName: "Allendale",
          });

          goToMercantileTask();
          expectLocationSpecificContentInTask("Allendale");
        });
      };

      describe("when home-based business question does not exist", () => {
        beforeEach(() => {
          completeNewBusinessOnboarding({
            industry: randomNonHomeBasedIndustry(),
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        });

        testLocationInThreePlaces();
      });

      describe("when we answer No to home-based business question immediately", () => {
        beforeEach(() => {
          completeNewBusinessOnboarding({
            industry: randomHomeBasedIndustry(),
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
          selectHomeBased(false);
        });

        testLocationInThreePlaces();
      });

      describe("when we answer No to home-based business question after providing location", () => {
        beforeEach(() => {
          completeNewBusinessOnboarding({
            industry: randomHomeBasedIndustry(),
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        });

        it("can provide location in Formation Date Modal", () => {
          openFormationDateModal();
          selectDate("04/2021");
          selectLocation("Allendale");
          clickModalSaveButton();

          selectHomeBased(false);

          goToMercantileTask();
          expectLocationSpecificContentInTask("Allendale");
          navigateBackToDashboard();
          expectLocationQuestionIsCompletedInProfile("Allendale");
        });

        it("can provide location in profile", () => {
          goToProfile();
          selectLocation("Allendale");
          onProfilePage.clickSaveButton();
          cy.url().should("contain", "/dashboard");
          onProfilePage.getLocationDropdown().should("not.exist");

          selectHomeBased(false);

          goToMercantileTask();
          expectLocationSpecificContentInTask("Allendale");
        });
      });
    });
  });

  describe("home-based business", () => {
    describe("onboarded as STARTING - applicable industry", () => {
      it("shows and answers home-based-business deferred question", () => {
        completeNewBusinessOnboarding({ industry: randomHomeBasedIndustry() });
        completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
      });
    });

    describe("onboarded as STARTING - non-applicable industry", () => {
      it("does not show pre-answered home-based-business deferred question", () => {
        completeNewBusinessOnboarding({ industry: randomNonHomeBasedIndustry() });
        completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        hasNonHomeBasedTasks();
        doesNotShowHomeBasedBusinessQuestionAtAll();
      });
    });

    describe("onboarded as FOREIGN", () => {
      describe("remote seller / remote worker", () => {
        it("does not show pre-answered home-based-business deferred question", () => {
          completeForeignBusinessOnboarding({ foreignBusinessTypeIds: ["employeesInNJ"] });
          doesNotShowHomeBasedBusinessQuestionAtAll();
        });
      });

      describe("NEXUS - applicable industry - location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomHomeBasedIndustry(),
            locationInNewJersey: true,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
          hasNonHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionAtAll();
        });
      });

      describe("NEXUS - applicable industry - no location in NJ", () => {
        it("shows and answers home-based-business deferred question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomHomeBasedIndustry(),
            locationInNewJersey: false,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
        });
      });

      describe("NEXUS - non-applicable industry - location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomNonHomeBasedIndustry(),
            locationInNewJersey: true,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          hasNonHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionAtAll();
        });
      });

      describe("NEXUS - non-applicable industry - no location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomNonHomeBasedIndustry(),
            locationInNewJersey: false,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          hasHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionAtAll();
        });
      });
    });
  });

  const hasHomeBasedTasks = (): void => {
    cy.get('[data-task="identify-potential-lease"]').should("not.exist");
  };

  const hasNonHomeBasedTasks = (): void => {
    cy.get('[data-task="identify-potential-lease"]').should("exist");
  };

  const doesNotShowHomeBasedBusinessQuestionAtAll = (): void => {
    onDashboardPage.getHomeBased().should("not.exist");
    onDashboardPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");
    cy.wait(1000);
    onProfilePage.getHomeBased().should("not.exist");
  };

  const selectHomeBased = (value: boolean): void => {
    onDashboardPage.getHomeBased().should("exist");
    onDashboardPage.selectHomeBased(value);
    clickDeferredSaveButton();
    onDashboardPage.getHomeBased().should("not.exist");
    cy.url().should("contain", "deferred");
    cy.url().should("not.contain", "deferred");
  };

  const showsAndAnswersHomeBasedBusinessQuestionOnDashboard = (): void => {
    selectHomeBased(true);

    onDashboardPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");
    cy.wait(1000);

    onProfilePage.getHomeBased().should("exist");
    onProfilePage.getHomeBased(true).should("be.checked");
    onProfilePage.getHomeBased(false).should("not.be.checked");
  };

  const goToProfile = (): void => {
    onDashboardPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");
    cy.wait(1000);
  };

  const expectLocationQuestionIsCompletedInProfile = (townDisplayName: string): void => {
    goToProfile();
    onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  };

  const goToMercantileTask = (): void => {
    cy.get('[data-task="check-local-requirements"]').first().click({ force: true });
  };

  const expectLocationSuccessBanner = (townDisplayName: string): void => {
    cy.get(`[data-testid="city-success-banner"]`).should("contain", townDisplayName);
  };

  const expectLocationSpecificContentInTask = (townDisplayName: string): void => {
    cy.get('[data-testid="deferred-location-task"]').find(".usa-link").should("have.length", 2);
    cy.get('[data-testid="deferred-location-task"] .usa-link').first().should("contain", townDisplayName);
  };

  const navigateBackToDashboard = (): void => {
    cy.get(`[data-testid="back-to-dashboard"]`).first().click();
  };
});

/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import {
  clickDeferredSaveButton,
  completeBusinessStructureTask,
  randomPublicFilingLegalStructure,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import {
  completeForeignBusinessOnboarding,
  completeForeignNexusBusinessOnboarding,
  completeNewBusinessOnboarding,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { updateNewBusinessProfilePage } from "@businessnjgovnavigator/cypress/support/helpers/helpers-profile";
import {
  randomHomeBasedNonDomesticEmployerIndustry,
  randomNonHomeBasedIndustry,
  randomNonHomeBasedNonDomesticEmployerIndustry,
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
            industry: randomHomeBasedNonDomesticEmployerIndustry(),
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
          selectHomeBased(false);
        });

        testLocationInThreePlaces();
      });

      describe("when we answer No to home-based business question after providing location", () => {
        beforeEach(() => {
          completeNewBusinessOnboarding({
            industry: randomHomeBasedNonDomesticEmployerIndustry(),
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
        completeNewBusinessOnboarding({ industry: randomHomeBasedNonDomesticEmployerIndustry() });
        completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
      });
    });

    describe("onboarded as STARTING - non-applicable industry", () => {
      it("does not show pre-answered home-based-business deferred question", () => {
        completeNewBusinessOnboarding({
          industry: randomNonHomeBasedNonDomesticEmployerIndustry(),
        });
        completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
        hasNonHomeBasedTasks();
        doesNotShowHomeBasedBusinessQuestionOnPermitsTab();
      });
    });

    describe("onboarded as FOREIGN", () => {
      describe("remote seller / remote worker", () => {
        it("does not show permits tab or the pre-answered home-based-business deferred question", () => {
          completeForeignBusinessOnboarding({ foreignBusinessTypeIds: ["employeesInNJ"] });
          doesNotShowPermitsTabAtAll();
        });
      });

      describe("NEXUS - applicable industry - location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomHomeBasedNonDomesticEmployerIndustry(),
            locationInNewJersey: true,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });
          hasNonHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionOnPermitsTab();
        });
      });

      describe("NEXUS - applicable industry - no location in NJ", () => {
        it("shows and answers home-based-business deferred question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomHomeBasedNonDomesticEmployerIndustry(),
            locationInNewJersey: false,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
        });
      });

      describe("NEXUS - non-applicable industry - location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomHomeBasedNonDomesticEmployerIndustry(),
            locationInNewJersey: true,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          hasNonHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionOnPermitsTab();
        });
      });

      describe("NEXUS - non-applicable industry - no location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomNonHomeBasedNonDomesticEmployerIndustry(),
            locationInNewJersey: false,
          });
          completeBusinessStructureTask({ legalStructureId: randomPublicFilingLegalStructure() });

          hasHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionOnPermitsTab();
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

  // TODO: DELETE ME - this exists for the case that a user does NOT have a permits tab
  const doesNotShowPermitsTabAtAll = (): void => {
    onDashboardPage.clickEditProfileLink();
    onProfilePage.getPermitsTab().should("not.exist");
  };

  // TODO: DELETE ME - this exists for the case that a user has a permits tab and does NOT have home-based question
  const doesNotShowHomeBasedBusinessQuestionOnPermitsTab = (): void => {
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
    cy.get('[data-task="town-mercantile-license"]').first().click({ force: true });
  };

  const selectLocation = (townDisplayName: string): void => {
    cy.get('[data-testid="municipality"]').type(townDisplayName);
    cy.get("#municipality-option-0").click({ force: true });
  };

  const expectLocationSuccessBanner = (townDisplayName: string): void => {
    cy.get(`[data-testid="city-success-banner"]`).should("contain", townDisplayName);
  };

  const expectLocationSpecificContentInTask = (townDisplayName: string): void => {
    cy.get('[data-testid="deferred-location-task"]').find(".usa-link").should("have.length", 2);
    cy.get('[data-testid="deferred-location-task"] .usa-link')
      .first()
      .should("contain", townDisplayName);
  };

  const navigateBackToDashboard = (): void => {
    cy.get(`[data-testid="back-to-dashboard"]`).first().click();
  };

  const openFormationDateModal = (): void => {
    cy.get('[data-testid="cta-formation-nudge"]').first().click();
  };

  const selectDate = (monthYear: string): void => {
    cy.chooseDatePicker('[name="dateOfFormation"]', monthYear);
  };

  const clickModalSaveButton = (): void => {
    cy.get('[data-testid="modal-button-primary"]').first().click();
    cy.wait(1000);
  };
});

/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable testing-library/await-async-utils */

import {
  completeExistingBusinessOnboarding,
  completeForeignBusinessOnboarding,
  completeForeignNexusBusinessOnboarding,
  completeNewBusinessOnboarding,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
} from "../support/helpers";
import { onDashboardPage } from "../support/page_objects/dashboardPage";
import { onProfilePage } from "../support/page_objects/profilePage";

describe("Deferred Onboarding [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("home-based business", () => {
    describe("onboarded as STARTING - applicable industry", () => {
      it("shows and answers home-based-business deferred question", () => {
        completeNewBusinessOnboarding({ industry: randomHomeBasedIndustry() });
        showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
      });
    });

    describe("onboarded as STARTING - non-applicable industry", () => {
      it("does not show pre-answered home-based-business deferred question", () => {
        completeNewBusinessOnboarding({ industry: randomNonHomeBasedIndustry() });
        hasNonHomeBasedTasks();
        doesNotShowHomeBasedBusinessQuestionAtAll();
      });
    });

    describe("onboarded as OWNING - all sectors", () => {
      it("shows and answers home-based-business deferred question", () => {
        completeExistingBusinessOnboarding({});
        showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
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
          showsAndAnswersHomeBasedBusinessQuestionOnDashboard();
        });
      });

      describe("NEXUS - non-applicable industry - location in NJ", () => {
        it("does not show home-based-business question", () => {
          completeForeignNexusBusinessOnboarding({
            industry: randomNonHomeBasedIndustry(),
            locationInNewJersey: true,
          });
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
          hasHomeBasedTasks();
          doesNotShowHomeBasedBusinessQuestionAtAll();
        });
      });
    });
  });

  const hasHomeBasedTasks = () => {
    cy.get('[data-task="identify-potential-lease"]').should("not.exist");
  };

  const hasNonHomeBasedTasks = () => {
    cy.get('[data-task="identify-potential-lease"]').should("exist");
  };

  const doesNotShowHomeBasedBusinessQuestionAtAll = () => {
    onDashboardPage.getHomeBased().should("not.exist");
    onDashboardPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");
    cy.wait(1000);
    onProfilePage.getHomeBased().should("not.exist");
  };

  const showsAndAnswersHomeBasedBusinessQuestionOnDashboard = () => {
    onDashboardPage.getHomeBased().should("exist");
    onDashboardPage.selectHomeBased(true);
    onDashboardPage.clickDeferredSaveButton();

    onDashboardPage.getHomeBased().should("not.exist");
    cy.wait(1000);

    onDashboardPage.clickEditProfileLink();
    cy.url().should("contain", "/profile");
    cy.wait(1000);

    onProfilePage.getHomeBased().should("exist");
    onProfilePage.getHomeBased(true).should("be.checked");
    onProfilePage.getHomeBased(false).should("not.be.checked");
  };
});

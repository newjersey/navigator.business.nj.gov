/* eslint-disable cypress/no-unnecessary-waiting */

import {
  completeExistingBusinessOnboarding,
  completeForeignBusinessOnboarding,
  completeNewBusinessOnboarding,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import {
  checkExistingBusinessProfilePage,
  checkNewBusinessProfilePage,
  updateExistingBusinessProfilePage,
  updateForeignBusinessProfilePage,
  updateNewBusinessProfilePage,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-profile";
import {
  homeBasedIndustries,
  liquorLicenseIndustries,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-select-industries";
import { Industry, arrayOfSectors, randomElementFromArray, randomInt } from "@businessnjgovnavigator/shared/";

describe("Profile [feature] [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("navigates to profile page and updates all fields", () => {
    it("onboards random industry where homebase doesn't apply, then changes to industry where it applies and updates all fields in profile", () => {
      const industry = randomNonHomeBasedIndustry();
      const homeBasedQuestion = industry.industryOnboardingQuestions.canBeHomeBased
        ? Boolean(randomInt() % 2)
        : undefined;
      const liquorLicenseQuestion = industry.industryOnboardingQuestions.isLiquorLicenseApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const townDisplayName = "Barnegat";

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        requiresCpa,
      });
      updateNewBusinessProfilePage({
        townDisplayName,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
      });

      const newBusinessName = `Generic Business Name ${randomInt()}`;
      const newIndustry = randomElementFromArray(
        homeBasedIndustries.filter((x) => {
          return x.isEnabled;
        }) as Industry[]
      );
      const newtownDisplayName = "Bass River";
      const newHomeBasedQuestion = Boolean(randomInt() % 2);
      const newEmployerId = randomInt(9).toString();
      // const newTaxId = randomInt(12).toString();
      const newNotes = `New notes ${randomInt()}`;

      updateNewBusinessProfilePage({
        businessName: newBusinessName,
        industry: newIndustry,
        townDisplayName: newtownDisplayName,
        homeBasedQuestion: newHomeBasedQuestion,
        employerId: newEmployerId,
        // taxId: newTaxId,
        notes: newNotes,
      });
    });

    it("onboards random homebased industry, then updates the field in profile", () => {
      const industry = randomHomeBasedIndustry();
      const homeBasedQuestion = Boolean(randomInt() % 2);
      const liquorLicenseQuestion = industry.industryOnboardingQuestions.isLiquorLicenseApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const townDisplayName = "Barnegat";

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        requiresCpa,
      });

      updateNewBusinessProfilePage({
        homeBasedQuestion: homeBasedQuestion,
        townDisplayName,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
      });
    });

    it("onboards random liquor license industry, then updates the field in profile", () => {
      const industry = randomElementFromArray(
        liquorLicenseIndustries.filter((x) => {
          return x.isEnabled;
        }) as Industry[]
      );
      const liquorLicenseQuestion = Boolean(randomInt() % 2);
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const townDisplayName = "Barnegat";

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        requiresCpa,
      });

      updateNewBusinessProfilePage({
        townDisplayName,
      });

      checkNewBusinessProfilePage({
        industry,
        liquorLicenseQuestion,
        townDisplayName,
      });

      updateNewBusinessProfilePage({
        liquorLicenseQuestion: !liquorLicenseQuestion,
      });
    });
  });

  it("onboards existing business and updates profile data ", () => {
    const sectorId = randomElementFromArray(arrayOfSectors).id;

    completeExistingBusinessOnboarding({ sectorId });
    checkExistingBusinessProfilePage({ sectorId });

    const updatedEntityId = randomInt(10).toString();
    const updatedBusinessName = `Generic Business Name ${randomInt()}`;
    const updatedSectorId = randomElementFromArray(arrayOfSectors).id;
    const updatedNumberOfEmployees = randomInt(1).toString();
    const updatedOwnershipDataValues = ["disabled-veteran"];
    const employerId = randomInt(10).toString();
    // const taxId = randomInt(12).toString();
    const notes = `Notes ${randomInt()}`;
    const taxPin = randomInt(4).toString();

    updateExistingBusinessProfilePage({
      entityId: updatedEntityId,
      businessName: updatedBusinessName,
      sectorId: updatedSectorId,
      numberOfEmployees: updatedNumberOfEmployees,
      homeBasedQuestion: Boolean(randomInt() % 2),
      ownershipDataValues: updatedOwnershipDataValues,
      employerId,
      // taxId,
      notes,
      taxPin,
    });
  });

  it("onboards REMOTE_SELLER foreign business and updates profile data", () => {
    completeForeignBusinessOnboarding({
      foreignBusinessTypeIds: ["revenueInNJ"],
    });

    updateForeignBusinessProfilePage({
      // taxId: randomInt(12).toString(),
      notes: `Notes ${randomInt()}`,
    });
  });
});

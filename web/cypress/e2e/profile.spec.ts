/* eslint-disable cypress/no-unnecessary-waiting */

import {
  arrayOfSectors,
  Industry,
  LegalStructure,
  LegalStructures,
  randomInt,
} from "@businessnjgovnavigator/shared/";
import {
  checkExistingBusinessProfilePage,
  checkNewBusinessProfilePage,
  completeExistingBusinessOnboarding,
  completeForeignBusinessOnboarding,
  completeNewBusinessOnboarding,
  homeBasedIndustries,
  liquorLicenseIndustries,
  randomElementFromArray,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
  updateExistingBusinessProfilePage,
  updateForeignBusinessProfilePage,
  updateNewBusinessProfilePage,
} from "../support/helpers";

describe("Profile [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("navigates to profile page and updates all fields", () => {
    it("onboards random industry where homebase doesn't apply, then changes to industry where it applies and updates all fields in profile", () => {
      const industry = randomNonHomeBasedIndustry();
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const homeBasedQuestion = industry.industryOnboardingQuestions.canBeHomeBased
        ? Boolean(randomInt() % 2)
        : undefined;
      const liquorLicenseQuestion = industry.industryOnboardingQuestions.isLiquorLicenseApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        legalStructureId,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
      });

      const newBusinessName = `Generic Business Name ${randomInt()}`;
      const newIndustry = randomElementFromArray(
        homeBasedIndustries.filter((x) => {
          return x.isEnabled;
        }) as Industry[]
      );
      const newLegalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const newtownDisplayName = "Bass River";
      const newHomeBasedQuestion = Boolean(randomInt() % 2);
      const newEmployerId = randomInt(9).toString();
      const newTaxId = randomInt(12).toString();
      const newNotes = `New notes ${randomInt()}`;

      updateNewBusinessProfilePage({
        businessName: newBusinessName,
        legalStructureId: newLegalStructureId,
        industry: newIndustry,
        townDisplayName: newtownDisplayName,
        homeBasedQuestion: newHomeBasedQuestion,
        employerId: newEmployerId,
        taxId: newTaxId,
        notes: newNotes,
      });
    });

    it("onboards random homebased industry, then updates the field in profile", () => {
      const industry = randomHomeBasedIndustry();
      const homeBasedQuestion = Boolean(randomInt() % 2);
      const liquorLicenseQuestion = industry.industryOnboardingQuestions.isLiquorLicenseApplicable
        ? Boolean(randomInt() % 2)
        : undefined;
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        legalStructureId,
        requiresCpa,
      });

      updateNewBusinessProfilePage({
        homeBasedQuestion: homeBasedQuestion,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
      });
    });

    it("onboards random liquor license industry, then updates the field in profile", () => {
      const industry = randomElementFromArray(
        liquorLicenseIndustries.filter((x) => {
          return x.isEnabled;
        }) as Industry[]
      );
      const liquorLicenseQuestion = Boolean(randomInt() % 2);
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
        ? Boolean(randomInt() % 2)
        : undefined;

      completeNewBusinessOnboarding({
        industry,
        liquorLicenseQuestion,
        legalStructureId,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        liquorLicenseQuestion,
        legalStructureId,
      });

      updateNewBusinessProfilePage({
        liquorLicenseQuestion: !liquorLicenseQuestion,
      });
    });
  });

  it("onboards existing business and updates profile data", () => {
    const businessFormationDate = "04/2021";
    const sectorId = randomElementFromArray(arrayOfSectors).id;
    const townDisplayName = "Atlantic";

    completeExistingBusinessOnboarding({
      businessFormationDate,
      sectorId,
      townDisplayName,
    });

    checkExistingBusinessProfilePage({
      businessFormationDate,
      sectorId,
      townDisplayName,
    });

    const updatedBusinessFormationDate = "03/2020";
    const updatedEntityId = randomInt(10).toString();
    const updatedBusinessName = `Generic Business Name ${randomInt()}`;
    const updatedSectorId = randomElementFromArray(arrayOfSectors).id;
    const updatedNumberOfEmployees = randomInt(1).toString();
    const updatedTownDisplayName = "Bass River";
    const updatedOwnershipDataValues = ["disabled-veteran"];
    const employerId = randomInt(10).toString();
    const taxId = randomInt(12).toString();
    const notes = `Notes ${randomInt()}`;
    const taxPin = randomInt(4).toString();

    updateExistingBusinessProfilePage({
      businessFormationDate: updatedBusinessFormationDate,
      entityId: updatedEntityId,
      businessName: updatedBusinessName,
      sectorId: updatedSectorId,
      numberOfEmployees: updatedNumberOfEmployees,
      townDisplayName: updatedTownDisplayName,
      homeBasedQuestion: Boolean(randomInt() % 2),
      ownershipDataValues: updatedOwnershipDataValues,
      employerId,
      taxId,
      notes,
      taxPin,
    });
  });

  it("onboards REMOTE_SELLER foreign business and updates profile data", () => {
    completeForeignBusinessOnboarding({
      foreignBusinessTypeIds: ["revenueInNJ"],
    });

    updateForeignBusinessProfilePage({
      taxId: randomInt(12).toString(),
      notes: `Notes ${randomInt()}`,
    });
  });
});

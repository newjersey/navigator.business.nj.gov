/* eslint-disable cypress/no-unnecessary-waiting */

import {
  arrayOfSectors,
  Industries,
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
  industriesNotHomeBasedOrLiquorLicense,
  legalStructureWithTradeName,
  liquorLicenseIndustries,
  randomElementFromArray,
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
      const industry = randomElementFromArray(
        industriesNotHomeBasedOrLiquorLicense.filter((x) => x.isEnabled) as Industry[]
      );
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";
      const homeBasedQuestion =
        industry.industryOnboardingQuestions.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.industryOnboardingQuestions.isLiquorLicenseApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);
      const requiresCpa =
        industry.industryOnboardingQuestions.isCpaRequiredApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
        legalStructureId,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
        legalStructureId,
      });

      const newBusinessName = `Generic Business Name ${randomInt()}`;
      const newIndustry = randomElementFromArray(
        homeBasedIndustries.filter((x) => x.isEnabled) as Industry[]
      );
      const newLegalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const newtownDisplayName = "Bass River";
      const newHomeBasedQuestion = Boolean(randomInt() % 2);
      const newEmployerId = randomInt(9).toString();
      const newTaxId = randomInt(9).toString();
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
      const industry = randomElementFromArray(homeBasedIndustries.filter((x) => x.isEnabled) as Industry[]);
      const homeBasedQuestion = Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.industryOnboardingQuestions.isLiquorLicenseApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";
      const requiresCpa = industry.isCpaRequiredApplicable === false ? undefined : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
        townDisplayName,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
        townDisplayName,
      });

      updateNewBusinessProfilePage({
        homeBasedQuestion: !homeBasedQuestion,
      });
    });

    it("onboards random liquor license industry, then updates the field in profile", () => {
      const industry = randomElementFromArray(
        liquorLicenseIndustries.filter((x) => x.isEnabled) as Industry[]
      );
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion = Boolean(randomInt() % 2);
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";
      const requiresCpa =
        industry.industryOnboardingQuestions.isCpaRequiredApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
        townDisplayName,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        legalStructureId,
        townDisplayName,
      });

      updateNewBusinessProfilePage({
        liquorLicenseQuestion: !liquorLicenseQuestion,
      });
    });

    it("onboards random industry with company type that enables entity id field, then updates the field in profile", () => {
      const industry = randomElementFromArray(Industries.filter((x) => x.isEnabled) as Industry[]);
      const legalStructureId = randomElementFromArray(legalStructureWithTradeName as LegalStructure[]).id;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.industryOnboardingQuestions.isLiquorLicenseApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);
      const townDisplayName = "Atlantic";
      const updatedEntityId = randomInt(10).toString();
      const requiresCpa =
        industry.industryOnboardingQuestions.isCpaRequiredApplicable === false
          ? undefined
          : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        industry,
        legalStructureId,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
        requiresCpa,
      });

      checkNewBusinessProfilePage({
        industry,
        legalStructureId,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
      });

      updateNewBusinessProfilePage({
        entityId: updatedEntityId,
      });
    });
  });

  it("onboards existing business and updates profile data", () => {
    const businessFormationDate = "04/2021";
    const entityId = randomInt(10).toString();
    const businessName = `Generic Business Name ${randomInt()}`;
    const sectorId = randomElementFromArray(arrayOfSectors).id;
    const numberOfEmployees = randomInt(1).toString();
    const townDisplayName = "Atlantic";
    const homeBasedQuestion = Boolean(randomInt() % 2);
    const ownershipDataValues = ["woman-owned", "veteran-owned"];

    completeExistingBusinessOnboarding({
      businessFormationDate,
      entityId,
      businessName,
      sectorId,
      numberOfEmployees,
      townDisplayName,
      homeBasedQuestion,
      ownershipDataValues,
    });

    checkExistingBusinessProfilePage({
      businessFormationDate,
      entityId,
      businessName,
      sectorId,
      numberOfEmployees,
      townDisplayName,
      homeBasedQuestion,
      ownershipDataValues,
    });

    const updatedBusinessFormationDate = "03/2020";
    const updatedEntityId = randomInt(10).toString();
    const updatedBusinessName = `Generic Business Name ${randomInt()}`;
    const updatedSectorId = randomElementFromArray(arrayOfSectors).id;
    const updatedNumberOfEmployees = randomInt(1).toString();
    const updatedTownDisplayName = "Bass River";
    const updatedOwnershipDataValues = ["disabled-veteran"];
    const employerId = randomInt(10).toString();
    const taxId = randomInt(9).toString();
    const notes = `Notes ${randomInt()}`;
    const taxPin = randomInt(4).toString();

    updateExistingBusinessProfilePage({
      businessFormationDate: updatedBusinessFormationDate,
      entityId: updatedEntityId,
      businessName: updatedBusinessName,
      sectorId: updatedSectorId,
      numberOfEmployees: updatedNumberOfEmployees,
      townDisplayName: updatedTownDisplayName,
      homeBasedQuestion: !homeBasedQuestion,
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
      taxId: randomInt(9).toString(),
      notes: `Notes ${randomInt()}`,
    });
  });
});

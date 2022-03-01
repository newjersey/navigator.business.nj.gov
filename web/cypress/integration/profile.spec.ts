/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries, Industry, LegalStructure, LegalStructures } from "@businessnjgovnavigator/shared/";
import {
  checkProfilePage,
  completeNewBusinessOnboarding,
  homeBasedIndustries,
  industriesNotHomeBasedOrLiquorLicense,
  legalStructureWithTradeName,
  liquorLicenseIndustries,
  randomElementFromArray,
  randomInt,
  updateProfilePage,
} from "../support/helpers";

describe("Profile [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("navigates to profile page and updates all fields", () => {
    it("onboards random industry where homebase doesn't apply, then changes to industry where it applies and updates all fields in profile", () => {
      const industry = randomElementFromArray(industriesNotHomeBasedOrLiquorLicense as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const companyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
        companyType,
      });

      checkProfilePage({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
        companyType,
      });

      const newBusinessName = `Generic Business Name ${randomInt()}`;
      const newIndustry = randomElementFromArray(homeBasedIndustries as Industry[]);
      const newCompanyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const newtownDisplayName = "Bass River";
      const newHomeBasedQuestion = Boolean(randomInt() % 2);
      const newEmployerId = randomInt(9).toString();
      const newTaxId = randomInt(9).toString();
      const newNotes = `New notes ${randomInt()}`;

      updateProfilePage({
        businessName: newBusinessName,
        companyType: newCompanyType,
        industry: newIndustry,
        townDisplayName: newtownDisplayName,
        homeBasedQuestion: newHomeBasedQuestion,
        employerId: newEmployerId,
        taxId: newTaxId,
        notes: newNotes,
      });
    });

    it("onboards random homebased industry, then updates the field in profile", () => {
      const industry = randomElementFromArray(homeBasedIndustries as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
      const companyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      checkProfilePage({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      updateProfilePage({
        homeBasedQuestion: !homeBasedQuestion,
      });
    });

    it("onboards random liquor license industry, then updates the field in profile", () => {
      const industry = randomElementFromArray(liquorLicenseIndustries as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion = Boolean(randomInt() % 2);
      const companyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = "Atlantic";

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      checkProfilePage({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      updateProfilePage({
        liquorLicenseQuestion: !liquorLicenseQuestion,
      });
    });

    it("onboards random industry with company type that enables entity id field, then updates the field in profile", () => {
      const businessName = `Generic Business Name ${randomInt()}`;
      const industry = randomElementFromArray(Industries as Industry[]);
      const companyTypeWithTradeName = randomElementFromArray(
        legalStructureWithTradeName as LegalStructure[]
      );
      const companyType = companyTypeWithTradeName.id;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
      const townDisplayName = "Atlantic";
      const updatedEntityId = randomInt(10).toString();

      completeNewBusinessOnboarding({
        businessName,
        industry,
        companyType,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
      });

      checkProfilePage({
        businessName,
        industry,
        companyType,
        homeBasedQuestion,
        liquorLicenseQuestion,
        townDisplayName,
      });

      updateProfilePage({
        entityId: updatedEntityId,
      });
    });
  });
});

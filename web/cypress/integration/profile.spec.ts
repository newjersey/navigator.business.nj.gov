/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries, Industry, LegalStructure } from "@businessnjgovnavigator/shared/";
import {
  checkProfilePage,
  completeNewBusinessOnboarding,
  homeBasedIndustries,
  industriesNotHomeBasedOrLiquorLicense,
  legalStructureWithTradeName,
  liquorLicenseIndustries,
  randomElementFromArray,
  randomInt,
} from "../support/helpers";

describe("Profile [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  describe("navigates to profile page and checks all fields", () => {
    it("random industry", () => {
      const industry = randomElementFromArray(industriesNotHomeBasedOrLiquorLicense as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });

      checkProfilePage({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });
    });

    it("random homebased industry", () => {
      const industry = randomElementFromArray(homeBasedIndustries as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });

      checkProfilePage({ businessName, industry, homeBasedQuestion, liquorLicenseQuestion });
    });

    it("random liquor license industry", () => {
      const industry = randomElementFromArray(liquorLicenseIndustries as Industry[]);
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion = Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });

      checkProfilePage({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });
    });

    it("random industry with company type that has trade name (entity id)", () => {
      const industry = randomElementFromArray(Industries as Industry[]);
      const companyTypeWithTradeName = randomElementFromArray(
        legalStructureWithTradeName as LegalStructure[]
      );
      const businessName = `Generic Business Name ${randomInt()}`;
      const companyType = companyTypeWithTradeName.id;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);

      completeNewBusinessOnboarding({
        businessName,
        industry,
        companyType,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });

      checkProfilePage({
        businessName,
        industry,
        companyType,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });
    });
  });
});

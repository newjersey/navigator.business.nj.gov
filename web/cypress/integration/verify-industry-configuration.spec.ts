/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries, LegalStructure, LegalStructures, randomInt } from "@businessnjgovnavigator/shared/";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import { completeNewBusinessOnboarding, randomElementFromArray } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  for (const industry of Industries) {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
      const requiresCpa = industry.isCpaRequiredApplicable === false ? undefined : Boolean(randomInt() % 2);
      const legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = undefined;

      completeNewBusinessOnboarding({
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        requiresCpa,
        legalStructureId,
        townDisplayName,
      });

      // check roadmap
      onRoadmapPage.getEditProfileLink().should("exist");
    });
  }
});

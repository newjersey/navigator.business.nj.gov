/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries, LegalStructure, LegalStructures } from "@businessnjgovnavigator/shared";
import { completeNewBusinessOnboarding, randomElementFromArray, randomInt } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  Industries.forEach((industry) => {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : Boolean(randomInt() % 2);
      const liquorLicenseQuestion =
        industry.isLiquorLicenseApplicable === false ? undefined : Boolean(randomInt() % 2);
      const companyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const townDisplayName = undefined;

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
        companyType,
        townDisplayName,
      });

      // check roadmap
      cy.get(`[data-business-name="${businessName}"]`).should("exist");
      cy.get(`[data-industry="${industry.id}"]`).should("exist");
      cy.get(`[data-legal-structure="${companyType}"]`).should("exist");
      cy.get(`[data-testid="mini-profile-location"]`)
        .invoke("attr", "data-municipality")
        .should("not.eq", "");
    });
  });
});

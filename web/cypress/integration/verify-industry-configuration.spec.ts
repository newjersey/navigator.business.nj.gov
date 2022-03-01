/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries, LegalStructure, LegalStructures } from "@businessnjgovnavigator/shared";
import { completeNewBusinessOnboarding, randomElementFromArray, randomInt } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  // Regular function used to access test context object
  beforeEach(function () {
    cy.loginByCognitoApi();
    cy.fixture("municipalities.json").then((list) => {
      this.muni = Object.values(list);
    });
  });

  Industries.forEach((industry) => {
    // Regular function used to access test context object
    it(` ${industry.name} completes onboarding and shows the roadmap`, function () {
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
      const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;
      const companyType = randomElementFromArray(LegalStructures as LegalStructure[]).id;
      const { townDisplayName, townName } = randomElementFromArray(this.muni);

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
      cy.get(`[data-municipality="${townName}"]`).should("exist");
    });
  });
});

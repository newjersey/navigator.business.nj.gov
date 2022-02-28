/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries } from "@businessnjgovnavigator/shared";
import { completeNewBusinessOnboarding, randomInt } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  Industries.forEach((industry) => {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      const businessName = `Generic Business Name ${randomInt()}`;
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
      const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;

      completeNewBusinessOnboarding({
        businessName,
        industry,
        homeBasedQuestion,
        liquorLicenseQuestion,
      });

      // check roadmap
      cy.get(`[data-business-name="${businessName}"]`).should("exist");
      cy.get(`[data-industry=${industry.id}]`).should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");
    });
  });
});

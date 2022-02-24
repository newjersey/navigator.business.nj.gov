/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries } from "@businessnjgovnavigator/shared";
import { completeNewBusinessOnboarding, randomInt } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  Industries.forEach((industry) => {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      const businessName = `Generic Business Name ${randomInt()}`;
      const industryId = industry.id;
      const companyType = "general-partnership";
      const location = "Absecon";
      const homeBasedQuestion = industry.canBeHomeBased === false ? undefined : true;
      const liquorLicenseQuestion = industry.isLiquorLicenseApplicable === false ? undefined : false;

      completeNewBusinessOnboarding(
        businessName,
        industryId,
        companyType,
        location,
        homeBasedQuestion,
        liquorLicenseQuestion
      );

      // check roadmap
      cy.get(`[data-business-name="${businessName}"]`).should("exist");
      cy.get(`[data-industry=${industry.id}]`).should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");
    });
  });
});

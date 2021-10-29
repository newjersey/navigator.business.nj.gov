/* eslint-disable cypress/no-unnecessary-waiting */

import { completeOnboarding } from "../support/helpers";
import { Industries } from "@businessnjgovnavigator/shared";

describe("Roadmap [all] [group2]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });

  Industries.forEach((industry) => {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      // onboarding
      completeOnboarding("Beesapple's", industry.id, "general-partnership", !industry.canBeHomeBased);

      cy.url().should("contain", "/roadmap");

      // check roadmap
      cy.get('[data-business-name="Beesapple\'s"]').should("exist");
      cy.get(`[data-industry=${industry.id}]`).should("exist");
      cy.get('[data-legal-structure="general-partnership"]').should("exist");
      cy.get('[data-municipality="Absecon"]').should("exist");
    });
  });
});

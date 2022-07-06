/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries } from "@businessnjgovnavigator/shared/";
import { onRoadmapPage } from "cypress/support/page_objects/roadmapPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Roadmap [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  for (const industry of Industries.filter((x) => x.isEnabled)) {
    it(` ${industry.name} completes onboarding and shows the roadmap`, () => {
      completeNewBusinessOnboarding({
        industry,
      });

      // check roadmap
      onRoadmapPage.getEditProfileLink().should("exist");
    });
  }
});

/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Dashboard [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  for (const industry of Industries.filter((x) => {
    return x.isEnabled;
  })) {
    it(` ${industry.name} completes onboarding and shows the dashboard`, () => {
      completeNewBusinessOnboarding({
        industry,
      });

      // check dashboard
      onDashboardPage.getEditProfileLink().should("exist");
    });
  }
});

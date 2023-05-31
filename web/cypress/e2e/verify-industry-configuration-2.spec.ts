/* eslint-disable cypress/no-unnecessary-waiting */

import { Industries } from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "cypress/support/page_objects/dashboardPage";
import { completeNewBusinessOnboarding } from "../support/helpers";

describe("Dashboard [all] [group1]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  const enabledIndustries = Industries.filter((x) => {
    return x.isEnabled;
  });

  const startIndex = Math.ceil(enabledIndustries.length / 2);

  for (const industry of enabledIndustries.slice(startIndex)) {
    it(` ${industry.name} completes onboarding and shows the dashboard`, () => {
      completeNewBusinessOnboarding({
        industry,
      });

      // check dashboard
      onDashboardPage.getEditProfileLink().should("exist");
    });
  }
});

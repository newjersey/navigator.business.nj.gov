/* eslint-disable cypress/no-unnecessary-waiting */

import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { Industries } from "@businessnjgovnavigator/shared/";

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

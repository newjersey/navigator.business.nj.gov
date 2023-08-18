/* eslint-disable cypress/no-unnecessary-waiting */

import { completeNewBusinessOnboarding } from "@businessnjgovnavigator/cypress/support/helpers/helpers-onboarding";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { Industries } from "@businessnjgovnavigator/shared/";

describe("Dashboard [all] [group4]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  const enabledIndustries = Industries.filter((x) => {
    return x.isEnabled;
  });

  const lastIndex = Math.floor(enabledIndustries.length / 2);

  for (const industry of enabledIndustries.slice(0, lastIndex)) {
    it(` ${industry.name} completes onboarding and shows the dashboard`, () => {
      completeNewBusinessOnboarding({
        industry
      });

      // check dashboard
      onDashboardPage.getEditProfileLink().should("exist");
    });
  }
});

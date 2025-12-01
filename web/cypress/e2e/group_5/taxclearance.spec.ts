/* eslint-disable cypress/no-unnecessary-waiting */
import {
  completeTaxClearanceFlow,
  fillOutTaxClearanceForm,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPageExistingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";

describe("Tax Clearance [feature] [all] [group5]", () => {
  let taxFormData: {
    businessName: string;
    addressLine1: string;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    taxPayerId: string;
    taxPayerPin: string;
  };

  beforeEach(() => {
    cy.loginByCognitoApi();
    taxFormData = {
      businessName: "Tax Clearance Business",
      addressLine1: "123 Agent Main St.",
      addressState: "NJ",
      addressCity: "Teaneck",
      addressZipCode: "07666",
      taxPayerId: "777777777771",
      taxPayerPin: "3889",
    };
  });

  it("test tax clearance certificate", () => {
    cy.url().should("include", "onboarding?page=1");
    onOnboardingPageExistingBusiness.selectBusinessPersonaRadio("OWNING");
    onOnboardingPageExistingBusiness.getBusinessPersonaRadio("OWNING").should("be.checked");
    onOnboardingPageExistingBusiness.selectIndustrySector("other-services");
    onOnboardingPageExistingBusiness.clickShowMyGuide();

    cy.url().should("include", "dashboard");
    cy.get('[data-testid="anytimeActionSearch"]').click();
    cy.get('[data-testid="option"]').contains("Get a Tax Clearance Certificate").click();

    // Inside AA task
    cy.get('[data-testid="cta-primary-1"]').click();
    cy.get('[id="mui-component-select-tax-clearance-certificate-agency-dropdown"]').click();
    cy.get('[data-testid="newJerseyBoardOfPublicUtilities"]').click();

    fillOutTaxClearanceForm(taxFormData);
    completeTaxClearanceFlow();
  });
});

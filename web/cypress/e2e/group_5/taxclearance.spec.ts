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
    cy.intercept("POST", "**/api/users").as("saveOnboarding");
    onOnboardingPageExistingBusiness.clickShowMyGuide();

    cy.wait("@saveOnboarding").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "dashboard");
    cy.intercept("GET", "**/api/users/*").as("loadUser");
    cy.visit("/actions/tax-clearance-certificate-apply");
    cy.wait("@loadUser").its("response.statusCode").should("eq", 200);
    cy.url().should("include", "/actions/tax-clearance-certificate-apply");

    // Inside AA task
    cy.get('[data-testid="cta-primary-1"]').should("be.visible").click();
    cy.get('[id="mui-component-select-tax-clearance-certificate-agency-dropdown"]').click();
    cy.get('[data-testid="newJerseyBoardOfPublicUtilities"]').click();
    cy.get('[id="mui-component-select-tax-clearance-certificate-agency-dropdown"]').should(
      "contain.text",
      "New Jersey Board of Public Utilities",
    );

    fillOutTaxClearanceForm(taxFormData);
    cy.get('[id="mui-component-select-tax-clearance-certificate-agency-dropdown"]').should(
      "contain.text",
      "New Jersey Board of Public Utilities",
    );
    completeTaxClearanceFlow();
  });
});

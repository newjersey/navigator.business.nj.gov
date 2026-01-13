import {
  completeBusinessStructureTask,
  fillOutLicenseStatusCheckForm,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";
describe("License Status Check [feature] [all] [group5]", () => {
  let checkStatusFormData: {
    businessName: string;
    addressLine1: string;
    addressZipCode: string;
  };
  beforeEach(() => {
    cy.loginByCognitoApi();
    checkStatusFormData = {
      businessName: "Pending Business Name",
      addressLine1: "111 Business St",
      addressZipCode: "12345",
    };
  });
  it("shows the Permit Status screen after submitting form for Cosmetology Shop License", () => {
    cy.url().should("include", "onboarding?page=1");
    onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
    onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
    onOnboardingPageStartingBusiness.clickNext();

    cy.url().should("include", "onboarding?page=2");
    onOnboardingPageStartingBusiness.selectIndustryDropdown("cosmetology");
    onOnboardingPageStartingBusiness.clickNext();

    cy.url().should("include", "dashboard");

    completeBusinessStructureTask({ legalStructureId: "limited-liability-company" });

    cy.get('[data-testid="apply-for-shop-license"]').click();
    cy.contains("Check Status").click();

    fillOutLicenseStatusCheckForm(checkStatusFormData);

    cy.get('[data-testid="check-status-submit"]').click();
    cy.contains("Permit Status:");
  });
});

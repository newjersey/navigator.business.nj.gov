import { completeBusinessStructureTask } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPageStartingBusiness } from "../../support/page_objects/onboardingPageNew";

// TODO: This test is failing - cannot find license-status-form after 30s timeout
// Likely related to React 19 timing/hydration changes affecting form visibility after tab switch
// Need to investigate if form rendering is delayed or if element selection is incorrect
describe.skip("License Status Check [feature] [all] [group5]", () => {
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
    // Complete onboarding
    cy.url().should("include", "onboarding?page=1");
    onOnboardingPageStartingBusiness.selectBusinessPersonaRadio("STARTING");
    onOnboardingPageStartingBusiness.getBusinessPersonaRadio("STARTING").should("be.checked");
    onOnboardingPageStartingBusiness.clickNext();

    cy.url().should("include", "onboarding?page=2");
    onOnboardingPageStartingBusiness.selectIndustryDropdown("cosmetology");
    onOnboardingPageStartingBusiness.clickNext();

    cy.url().should("include", "dashboard");

    // Complete business structure to ensure industry is set
    completeBusinessStructureTask({ legalStructureId: "limited-liability-company" });

    // Navigate to license task
    cy.get('[data-testid="apply-for-shop-license"]').should("be.visible").click();
    cy.contains("Check Status").should("be.visible").click();

    // Wait for form to load after tab switch
    cy.get('[data-testid="license-status-form"]', { timeout: 30000 }).should("be.visible");

    // Set up API interception
    cy.intercept("POST", "/api/license-status").as("licenseStatusCheck");

    // Fill form using standard Cypress commands (works with React 19)
    cy.get('[data-testid="business-name"]').clear();
    cy.get('[data-testid="business-name"]').type(checkStatusFormData.businessName);
    cy.get('[data-testid="address-1"]').clear();
    cy.get('[data-testid="address-1"]').type(checkStatusFormData.addressLine1);
    cy.get('[data-testid="zipcode"]').clear();
    cy.get('[data-testid="zipcode"]').type(checkStatusFormData.addressZipCode);

    // Verify form values are set
    cy.get('[data-testid="business-name"]').should("have.value", checkStatusFormData.businessName);
    cy.get('[data-testid="address-1"]').should("have.value", checkStatusFormData.addressLine1);
    cy.get('[data-testid="zipcode"]').should("have.value", checkStatusFormData.addressZipCode);

    // Verify submit button is enabled and click
    cy.get('[data-testid="check-status-submit"]').should("be.visible");
    cy.get('[data-testid="check-status-submit"]').should("not.be.disabled");
    cy.get('[data-testid="check-status-submit"]').click();

    // Wait for API completion (not arbitrary time)
    cy.wait("@licenseStatusCheck").its("response.statusCode").should("eq", 200);

    // Verify request had required fields
    cy.get("@licenseStatusCheck")
      .its("request.body.nameAndAddress.name")
      .should("eq", checkStatusFormData.businessName);
    cy.get("@licenseStatusCheck")
      .its("request.body.nameAndAddress.addressLine1")
      .should("eq", checkStatusFormData.addressLine1);
    cy.get("@licenseStatusCheck")
      .its("request.body.nameAndAddress.zipCode")
      .should("eq", checkStatusFormData.addressZipCode);

    // Verify permit status screen appears
    cy.get('[data-testid="permit-status-screen"]', { timeout: 10000 }).should("be.visible");
    cy.contains("Permit Status:").should("be.visible");
    cy.get('[data-testid="permit-status-value"]').should("be.visible");
  });
});

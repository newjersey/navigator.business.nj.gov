import { testUserEmail } from "../support";
import { tryLogIn } from "../support/helpers";

describe("Restaurant LLC", () => {
  beforeEach(() => {
    tryLogIn();
  });

  it("enters user info and shows the roadmap", () => {
    cy.contains("Get Started").click();

    // onboarding form
    cy.get('input[label="firstName"]').type("Ada");
    cy.get('input[label="lastName"]').type("Lovelace");
    cy.get('input[label="email"]').should("have.value", testUserEmail);
    cy.contains("Next").click();

    cy.get("select#root_businessType_businessType").select("Restaurant");
    cy.contains("Next").click();

    cy.get('input[label="businessName"]').type("My cool business");
    cy.contains("Next").click();

    cy.get('input[label="businessDescription"]').type("Selling useful products");
    cy.contains("Next").click();

    cy.get("select#root_businessStructure_businessStructure").select("LLC");
    cy.contains("Next").click();

    cy.get('input[label="zipCode"]').type("11111");
    cy.contains("Next").click();

    // check roadmap
    restaurantStepsShouldExist();
    llcStepShouldExist();
    liquorLicenseShouldNotExist();

    // add liquor license
    cy.get("button").contains("Edit my data").click();
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.get('input[type="radio"][value="true"]').check();
    cy.contains("Next").click();

    // check roadmap
    restaurantStepsShouldExist();
    llcStepShouldExist();
    liquorLicenseShouldExist();
  });
});

const restaurantStepsShouldExist = () => {
  // step 1
  cy.contains("Plan Your Location").should("exist");
  cy.contains("Identify a potential lease").should("exist");
  cy.contains("Verify zoning").should("exist");
  cy.contains("Inquire about Local Permits Required").should("exist");

  // step 2
  cy.contains("Research and Prepare Your Business License").should("exist");

  // step 4
  cy.contains("Sign Your Lease & File Local Permits").should("exist");
  cy.contains("Sign Your Lease").should("exist");
  cy.contains("Obtain Building Permit").should("exist");
  cy.contains("Get your floor plan approved by your local DOH").should("exist");
  cy.contains("Complete Food Safety Course").should("exist");
};

const llcStepShouldExist = () => {
  // step 3 - LLC
  cy.contains("Form & Register Your Business").should("exist");
  cy.contains("Search for Available Business Names").should("exist");
  cy.contains("Register for an EIN").should("exist");
  cy.contains("Form your Business Entity").should("exist");
  cy.contains("Register Your Alternate Name").should("exist");
  cy.contains("Register for Tax Purposes with DORES").should("exist");
};

const liquorLicenseShouldExist = () => {
  cy.contains("Confirm liquor license availability").should("exist");
  cy.contains("Obtain your Liquor License").should("exist");
};

const liquorLicenseShouldNotExist = () => {
  cy.contains("Confirm liquor license availability").should("not.exist");
  cy.contains("Obtain your Liquor License").should("not.exist");
};

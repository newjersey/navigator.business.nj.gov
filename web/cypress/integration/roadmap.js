import { testUserEmail } from "../support";

describe("Roadmap", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  afterEach(() => {
    cy.resetUserData();
  });

  it("enters user info and shows the roadmap", () => {
    cy.contains("Get Started").click();

    // onboarding form
    cy.get('input[label="firstName"]').type("Ada");
    cy.get('input[label="lastName"]').type("Lovelace");
    cy.get('input[label="email"]').should("have.value", testUserEmail);
    cy.contains("Next").click();

    cy.get("select#root_businessType_businessType").select("E-Commerce");
    cy.contains("Next").click();

    cy.get('input[label="businessName"]').type("Beesapple's");
    cy.contains("Next").click();

    cy.get('input[label="businessDescription"]').type("Selling useful products");
    cy.contains("Next").click();

    cy.get("select#root_businessStructure_businessStructure").select("General Partnership");
    cy.contains("Next").click();

    cy.get('input[label="zipCode"]').type("11111");
    cy.contains("Next").click();

    // step 1
    cy.contains("Create a Business Plan").should("exist");
    cy.contains("Executive Summary").should("exist");

    // step 2
    cy.contains("Due Diligence").should("exist");
    cy.contains("Research Potential Insurance Needs").should("exist");

    // step 3 - GP
    cy.contains("Form & Register Your Business").should("exist");
    cy.contains("Register a Trade Name").should("exist");
    cy.contains("Register for an EIN").should("exist");
    cy.contains("Register for Tax Purposes with DORES").should("exist");

    // step 4
    cy.contains("Sign Your Lease and File Licenses & Local Permits").should("exist");

    // tasks screen
    cy.contains("Register a Trade Name").click();
    cy.contains("Business Roadmap for Beesapple's").should("not.exist");
    cy.contains("Destination: County Clerk").should("exist");

    // tasks mini-nav
    cy.contains("Due Diligence").click();
    cy.contains("Research Potential Insurance Needs").click();
    cy.contains("You may consider obtaining insurance for your business").should("exist");

    cy.contains("← Back to Roadmap").click();

    // editing data
    cy.contains("Edit").click();
    cy.contains("Next").click();

    cy.get("select#root_businessType_businessType").should("have.value", "e-commerce");
    cy.get("select#root_businessType_businessType").select("Restaurant");
    cy.contains("Next").click();

    cy.get('input[label="businessName"]').clear();
    cy.get('input[label="businessName"]').type("Applebee's");
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.contains("Next").click();
    cy.contains("Next").click();

    // step 1
    cy.contains("Check and Plan Local Site Requirements").should("exist");
    cy.contains("Identify a potential lease").should("exist");
  });
});

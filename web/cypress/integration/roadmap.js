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

    // check roadmap
    cy.contains("Business Roadmap for Beesapple's").should("exist");

    // check roadmap
    cy.contains("Business Name: Beesapple's").should("exist");
    cy.contains("Industry: e-commerce").should("exist");
    cy.contains("Legal Entity: General Partnership").should("exist");

    // step 1
    cy.contains("Plan Your Location").should("exist");
    cy.contains("Zoning Requirements").should("exist");

    // step 2
    cy.contains("Research and Prepare Your Business License").should("exist");
    cy.contains("Search Licenses").should("exist");

    // step 3 - GP
    cy.contains("Form & Register Your Business").should("exist");
    cy.contains("Register a Trade Name").should("exist");
    cy.contains("Register for an EIN").should("exist");
    cy.contains("Register for Tax Purposes with DORES").should("exist");

    // step 4
    cy.contains("Sign Your Lease & File Local Permits").should("exist");
    cy.contains("Municipality Licenses").should("exist");

    // tasks screen
    cy.contains("Zoning Requirements").click();
    cy.contains("Business Roadmap for Beesapple's").should("not.exist");
    cy.contains("Destination: City Office of Zoning").should("exist");

    // tasks mini-nav
    cy.contains("Form & Register Your Business").click();
    cy.contains("Register for an EIN").click();
    cy.contains("Start Application").should("exist");

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

    // check roadmap
    cy.contains("Business Roadmap for Applebee's").should("exist");
    cy.contains("Business Name: Applebee's").should("exist");
    cy.contains("Industry: restaurant").should("exist");
    cy.contains("Legal Entity: General Partnership").should("exist");

    // step 1
    cy.contains("Plan Your Location").should("exist");
    cy.contains("Identify a potential lease").should("exist");
  });
});

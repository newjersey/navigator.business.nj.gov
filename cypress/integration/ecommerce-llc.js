import { testUserEmail } from "../support";
import {
  ecommerceStepsShouldExist,
  liquorLicenseShouldNotExist,
  llcStepShouldExist,
} from "../support/steps-validators";
import { checkAllTaskLinks } from "../support/tasks-validators";

describe("E-Commerce LLC", () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it("enters user info and shows the roadmap", () => {
    cy.contains("Get Started").click();

    // onboarding form
    cy.get('input[label="firstName"]').type("Ada");
    cy.get('input[label="lastName"]').type("Lovelace");
    cy.get('input[label="email"]').should("have.value", testUserEmail);
    cy.contains("Next").click();

    cy.get("select#root_businessType_businessType").select("E-Commerce");
    cy.contains("Next").click();

    cy.get('input[label="businessName"]').type("My cool business");
    cy.contains("Next").click();

    cy.get('input[label="businessDescription"]').type("Selling useful products");
    cy.contains("Next").click();

    cy.get("select#root_businessStructure_businessStructure").select("Limited Liability Company (LLC)");
    cy.contains("Next").click();

    cy.get('input[label="zipCode"]').type("11111");
    cy.contains("Next").click();

    // check roadmap
    ecommerceStepsShouldExist();
    llcStepShouldExist();
    liquorLicenseShouldNotExist();
    checkAllTaskLinks();
  });
});

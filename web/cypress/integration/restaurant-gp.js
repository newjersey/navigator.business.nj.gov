import { testUserEmail } from "../support";
import {
  gpStepShouldExist,
  liquorLicenseShouldExist,
  liquorLicenseShouldNotExist,
  restaurantStepsShouldExist,
} from "../support/steps-validators";
import { checkAllTaskLinks } from "../support/tasks-validators";

describe("Restaurant GP", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
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

    cy.get("select#root_businessStructure_businessStructure").select("General Partnership");
    cy.contains("Next").click();

    cy.get('input[label="zipCode"]').type("11111");
    cy.contains("Next").click();

    // check roadmap
    restaurantStepsShouldExist();
    gpStepShouldExist();
    liquorLicenseShouldNotExist();
    checkAllTaskLinks();

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
    gpStepShouldExist();
    liquorLicenseShouldExist();
    checkAllTaskLinks();
  });
});

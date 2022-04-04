import { arrayOfSectors } from "@businessnjgovnavigator/shared/";
import {
  completeExistingBusinessOnboarding,
  randomElementFromArray,
  randomInt,
} from "cypress/support/helpers";

describe("existing business [feature] [all] [group3]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it.skip("navigates through onboarding for existing business", () => {
    const businessFormationMonth = "Apr";
    const businessFormationYear = "2021";
    const entityId = randomInt(10).toString();
    const businessName = `Generic Business Name ${randomInt()}`;
    const sectorId = randomElementFromArray(arrayOfSectors).id;
    const numberOfEmployees = randomInt(1).toString();
    const townDisplayName = "Atlantic";
    const homeBasedQuestion = Boolean(randomInt() % 2);
    const ownershipDataValues = ["woman-owned", "veteran-owned"];

    completeExistingBusinessOnboarding({
      businessFormationMonth,
      businessFormationYear,
      entityId,
      businessName,
      sectorId,
      numberOfEmployees,
      townDisplayName,
      homeBasedQuestion,
      ownershipDataValues,
    });
  });
});

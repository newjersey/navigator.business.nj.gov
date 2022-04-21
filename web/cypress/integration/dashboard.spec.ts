import { arrayOfSectors, randomInt } from "@businessnjgovnavigator/shared/";
import { completeExistingBusinessOnboarding, randomElementFromArray } from "cypress/support/helpers";

describe("existing business [feature] [all] [group2]", () => {
  beforeEach(() => {
    cy.loginByCognitoApi();
  });

  it("navigates through onboarding for existing business", () => {
    const businessFormationDate = "04/2021";
    const entityId = randomInt(10).toString();
    const businessName = `Generic Business Name ${randomInt()}`;
    const sectorId = randomElementFromArray(arrayOfSectors).id;
    const numberOfEmployees = randomInt(1).toString();
    const townDisplayName = "Atlantic";
    const homeBasedQuestion = Boolean(randomInt() % 2);
    const ownershipDataValues = ["woman-owned", "veteran-owned"];

    completeExistingBusinessOnboarding({
      businessFormationDate,
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

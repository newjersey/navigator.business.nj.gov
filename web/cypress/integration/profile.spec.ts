/* eslint-disable cypress/no-unnecessary-waiting */

import { completeNewBusinessOnboarding, randomInt } from "../support/helpers";
import { onProfilePage } from "../support/page_objects/profilePage";
import { onRoadmapPage } from "../support/page_objects/roadmapPage";

describe("Profile [feature] [all] [group1]", () => {
  beforeEach(() => {
    cy.resetUserData();
    cy.loginByCognitoApi();
  });
  it("navigates to profile page and updates all available fields", () => {
    const businessName = `Generic Business Name ${randomInt()}`;
    const industryId = "generic";
    const companyType = "general-partnership";
    const location = "Absecon";
    const homeBasedQuestion = false;
    const liquorLicenseQuestion = undefined;

    const newBusinessName = `Generic Business Name ${randomInt()}`;
    const newIndustryId = "restaurant";
    const newLiquorLicenseQuestion = true;
    const newCompanyType = "limited-liability-partnership";
    const newLocation = "Atlantic";
    const newEmployerId = randomInt(9).toString();
    const newNotes = `Notes ${randomInt()}`;
    const newEntityId = randomInt(10).toString();
    const newTaxId = randomInt(9).toString();

    completeNewBusinessOnboarding(
      businessName,
      industryId,
      companyType,
      location,
      homeBasedQuestion,
      liquorLicenseQuestion
    );

    cy.url().should("contain", "/roadmap");
    onRoadmapPage.clickEditProfileLink();

    onProfilePage.getBusinessName().should("exist");
    onProfilePage.getIndustryDropdown().should("exist");
    onProfilePage.getLiquorLicense().should("not.exist");
    onProfilePage.getLegalStructure().should("exist");
    onProfilePage.getLocationDropdown().should("exist");
    onProfilePage.getHomeBased(false).should("be.checked");
    onProfilePage.getEmployerId().should("exist");
    onProfilePage.getTaxId().should("exist");
    onProfilePage.getNotes().should("exist");
    onProfilePage.getEntityId().should("not.exist");

    // update profile page
    onProfilePage.selectHomeBased(true);
    onProfilePage.getBusinessName().clear();
    onProfilePage.typeBusinessName(newBusinessName);
    onProfilePage.selectIndustry(newIndustryId);
    onProfilePage.getHomeBased().should("not.exist");
    onProfilePage.getLiquorLicense(false).should("be.checked");
    onProfilePage.selectLiquorLicense(newLiquorLicenseQuestion);
    onProfilePage.getLiquorLicense(false).should("not.be.checked");
    onProfilePage.getLiquorLicense(true).should("be.checked");
    onProfilePage.selectLegalStructure(newCompanyType);
    onProfilePage.selectLocation(newLocation);
    onProfilePage.typeEntityId(newEntityId);
    onProfilePage.typeEmployerId(newEmployerId);
    onProfilePage.typeNotes(newNotes);
    onProfilePage.typeTaxId(newTaxId);

    onProfilePage.clickSaveButton();
    cy.url().should("contain", "/roadmap");
  });
});

import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { onDashboardPage } from "@businessnjgovnavigator/cypress/support/page_objects/dashboardPage";
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";
import {
  ExistingProfileData,
  ForeignProfileData,
  StartingProfileData,
} from "@businessnjgovnavigator/cypress/support/types";
import {
  Industry,
  LookupLegalStructureById,
  LookupSectorTypeById,
} from "@businessnjgovnavigator/shared/";

export const checkNewBusinessProfilePage = ({
  businessName,
  industry,
  legalStructureId,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId = "",
  taxId = "",
  notes = "",
  entityId = "",
}: Partial<StartingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileInDropdown();
  cy.url().should("contain", "/profile");
  cy.wait(1000);

  if (businessName) {
    onProfilePage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  }

  onProfilePage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  if (liquorLicenseQuestion === undefined) {
    onProfilePage.getLiquorLicense().should("not.exist");
  } else {
    onProfilePage.getLiquorLicense(liquorLicenseQuestion).should("be.checked");
    onProfilePage.getLiquorLicense(!liquorLicenseQuestion).should("not.be.checked");
  }

  if (townDisplayName) {
    onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  }

  if (homeBasedQuestion !== undefined) {
    onProfilePage.getHomeBased(homeBasedQuestion).should("be.checked");
    onProfilePage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  if (entityId && legalStructureId) {
    if (LookupLegalStructureById(legalStructureId).elementsToDisplay.has("entityId")) {
      onProfilePage.getEntityId().should("exist");
      onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
    } else {
      onProfilePage.getEntityId().should("not.exist");
    }
  }

  const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
  onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);
  onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};
export const checkExistingBusinessProfilePage = ({
  businessFormationDate,
  sectorId,
  numberOfEmployees,
  townDisplayName,
  homeBasedQuestion,
  ownershipDataValues,
  employerId = "",
  taxId = "",
  notes = "",
  taxPin = "",
}: Partial<ExistingProfileData>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileInDropdown();
  cy.url().should("contain", "/profile");

  cy.wait(1000);

  onProfilePage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId as string).name);
    });
  if (numberOfEmployees !== undefined) {
    onProfilePage
      .getNumberOfEmployees()
      .invoke("prop", "value")
      .should("contain", numberOfEmployees);
  }
  if (townDisplayName !== undefined) {
    onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  }
  if (homeBasedQuestion !== undefined) {
    onProfilePage.getHomeBased(homeBasedQuestion).should("be.checked");
    onProfilePage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }
  if (!!ownershipDataValues && ownershipDataValues.length) {
    ownershipDataValues.forEach((dataValue) => {
      onProfilePage.getOwnershipDropdown().invoke("prop", "value").should("contain", dataValue);
    });
  }

  const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
  onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);

  if (businessFormationDate) {
    onProfilePage
      .getBusinessFormationDatePicker()
      .invoke("prop", "value")
      .should("contain", businessFormationDate);
  }

  onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  onProfilePage.getTaxPin().invoke("prop", "value").should("contain", taxPin);

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};
export const updateNewBusinessProfilePage = ({
  businessName,
  industry,
  legalStructureId,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId,
  taxId,
  notes,
  entityId,
}: Partial<StartingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileInDropdown();
  cy.url().should("contain", "/profile");
  cy.wait(1000);

  if (industry) {
    onProfilePage.selectIndustry((industry as Industry).id);
    onProfilePage
      .getIndustryDropdown()
      .invoke("prop", "value")
      .should("contain", (industry as Industry).name);
  }

  if (legalStructureId) {
    onProfilePage.selectLegalStructure(legalStructureId);
    onProfilePage
      .getLegalStructure()
      .parent()
      .find("input")
      .invoke("prop", "value")
      .should("contain", legalStructureId);
    onProfilePage.clickSaveButton(); // save because changing legal structure can change fields
    cy.wait(1000);
    onDashboardPage.clickEditProfileInDropdown();
    cy.url().should("contain", "/profile");
    cy.wait(1000);

    if (businessName) {
      const hasTradeName = LookupLegalStructureById(legalStructureId).hasTradeName;
      if (hasTradeName) {
        onProfilePage.typeTradeName(businessName);
        onProfilePage.getTradeName().invoke("prop", "value").should("contain", businessName);
      } else {
        onProfilePage.typeBusinessName(businessName);
        onProfilePage.getBusinessName().invoke("prop", "value").should("contain", businessName);
      }
    }
  }
  if (townDisplayName) {
    onProfilePage.selectLocation(townDisplayName);
    onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  }

  if (homeBasedQuestion !== undefined) {
    onProfilePage.selectHomeBased(homeBasedQuestion);
    onProfilePage.getHomeBased(homeBasedQuestion).should("be.checked");
    onProfilePage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  if (employerId) {
    const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
    onProfilePage.typeEmployerId(employerId);
    onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);
  }

  if (
    entityId &&
    legalStructureId &&
    LookupLegalStructureById(legalStructureId).elementsToDisplay.has("entityId")
  ) {
    onProfilePage.typeEntityId(entityId);
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
  }

  if (taxId) {
    onProfilePage.typeTaxId(formatTaxId(taxId));
    onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  }

  if (notes) {
    onProfilePage.typeNotes(notes);
    onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  }

  if (liquorLicenseQuestion) {
    onProfilePage.selectLiquorLicense(liquorLicenseQuestion);
    onProfilePage.getLiquorLicense(liquorLicenseQuestion).should("be.checked");
    onProfilePage.getLiquorLicense(!liquorLicenseQuestion).should("not.be.checked");
  }

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};
export const updateExistingBusinessProfilePage = ({
  businessFormationDate,
  entityId,
  businessName,
  sectorId,
  numberOfEmployees,
  townDisplayName,
  homeBasedQuestion,
  ownershipDataValues,
  employerId,
  taxId,
  notes,
  taxPin,
}: Partial<ExistingProfileData>): void => {
  cy.url().should("contain", "/dashboard");
  cy.wait(1500);
  onDashboardPage.clickEditProfileInDropdown();
  cy.url().should("contain", "/profile");
  cy.wait(1000);

  if (businessName) {
    onProfilePage.typeBusinessName(businessName);
    onProfilePage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  }

  if (sectorId) {
    onProfilePage.selectIndustrySector(sectorId);
    onProfilePage
      .getIndustrySectorDropdown()
      .invoke("prop", "value")
      .then((value) => {
        expect(value).to.contain(LookupSectorTypeById(sectorId).name);
      });
  }

  if (numberOfEmployees) {
    onProfilePage.typeNumberOfEmployees(numberOfEmployees);
    onProfilePage
      .getNumberOfEmployees()
      .invoke("prop", "value")
      .should("contain", numberOfEmployees);
  }

  if (townDisplayName) {
    onProfilePage.selectLocation(townDisplayName);
    onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  }

  if (homeBasedQuestion !== undefined) {
    onProfilePage.selectHomeBased(homeBasedQuestion);
    onProfilePage.getHomeBased(homeBasedQuestion).should("be.checked");
    onProfilePage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  if (ownershipDataValues !== undefined && ownershipDataValues.length) {
    onProfilePage.selectOwnership(ownershipDataValues);
    ownershipDataValues.forEach((dataValue) => {
      onProfilePage.getOwnershipDropdown().invoke("prop", "value").should("contain", dataValue);
    });
  }

  if (employerId) {
    const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
    onProfilePage.typeEmployerId(employerId);
    onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);
  }

  if (entityId) {
    onProfilePage.typeEntityId(entityId);
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
  }

  if (businessFormationDate) {
    onProfilePage.typeBusinessFormationDate(businessFormationDate);
    onProfilePage
      .getBusinessFormationDatePicker()
      .invoke("prop", "value")
      .should("contain", businessFormationDate);
  }

  if (taxId) {
    onProfilePage.typeTaxId(formatTaxId(taxId));
    onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  }

  if (taxPin) {
    onProfilePage.typeTaxPin(taxPin);
    onProfilePage.getTaxPin().invoke("prop", "value").should("contain", taxPin);
  }

  if (notes) {
    onProfilePage.typeNotes(notes);
    onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  }

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};
export const updateForeignBusinessProfilePage = ({
  taxId,
  notes,
}: Partial<ForeignProfileData>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileInDropdown();
  cy.url().should("contain", "/profile");
  cy.wait(1000);

  if (taxId) {
    onProfilePage.typeTaxId(formatTaxId(taxId));
    onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  }

  if (notes) {
    onProfilePage.typeNotes(notes);
    onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  }

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};

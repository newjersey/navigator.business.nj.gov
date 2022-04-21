import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import {
  Industries,
  Industry,
  LegalStructures,
  LookupLegalStructureById,
  LookupSectorTypeById,
  randomInt,
} from "@businessnjgovnavigator/shared/";
import { onDashboardPage } from "./page_objects/dashboardPage";
import { onOnboardingPage } from "./page_objects/onboardingPage";
import { onProfilePage } from "./page_objects/profilePage";
import { onRoadmapPage } from "./page_objects/roadmapPage";

/* eslint-disable cypress/no-unnecessary-waiting */

export const lighthouseDesktopConfig: LighthouseConfig = {
  formFactor: "desktop",
  screenEmulation: {
    disabled: true,
  },
};

export const lighthouseMobileConfig: LighthouseConfig = {
  formFactor: "mobile",
  screenEmulation: {
    disabled: true,
  },
};

export const defaultPa11yThresholds: Pa11yThresholds = {
  ignore: [
    "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail",
    "color-contrast",
    "landmark-no-duplicate-banner",
    "landmark-unique",
    "aria-allowed-attr",
  ],
  runners: ["axe", "htmlcs"],
};

export interface LighthouseThresholds {
  accessibility: number;
  "best-practices": number;
  performance: number;
  seo: number;
  pwa: number;
}

export interface LighthouseConfig {
  formFactor: "desktop" | "mobile";
  screenEmulation?: {
    disabled: boolean;
  };
}

export interface Pa11yThresholds {
  ignore?: string[];
  runners?: string[];
}

export const randomElementFromArray = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const homeBasedIndustries = Industries.filter((industry) => {
  return industry.canBeHomeBased;
});

export const liquorLicenseIndustries = Industries.filter((industry) => {
  return industry.isLiquorLicenseApplicable;
});

export const industriesNotHomeBasedOrLiquorLicense = Industries.filter((industry) => {
  return !industry.canBeHomeBased && !industry.isLiquorLicenseApplicable;
});

export const legalStructureWithTradeName = LegalStructures.filter((legalStructure) => {
  return !legalStructure.hasTradeName;
});

type registration = {
  fullName: string;
  email: string;
  isNewsletterChecked: boolean;
  isContactMeChecked: boolean;
};

interface startingOnboardingData {
  industry: Industry;
  legalStructureId: string;
  townDisplayName: string | undefined;
  homeBasedQuestion: boolean | undefined;
  liquorLicenseQuestion: boolean | undefined;
}

export const completeNewBusinessOnboarding = ({
  industry,
  legalStructureId,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = true,
  isContactMeChecked = false,
}: startingOnboardingData & Partial<registration>): void => {
  cy.url().should("include", "onboarding?page=1");
  onOnboardingPage.selectNewBusiness(false);
  onOnboardingPage.getHasExistingBusiness(true).should("not.be.checked");
  onOnboardingPage.getHasExistingBusiness(false).should("be.checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=2");

  onOnboardingPage.selectIndustry((industry as Industry).id);
  onOnboardingPage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  if (liquorLicenseQuestion === undefined) {
    onOnboardingPage.getLiquorLicense().should("not.exist");
  } else {
    onOnboardingPage.selectLiquorLicense(liquorLicenseQuestion);
    onOnboardingPage.getLiquorLicense(liquorLicenseQuestion).should("be.checked");
    onOnboardingPage.getLiquorLicense(!liquorLicenseQuestion).should("not.be.checked");
  }
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=3");
  onOnboardingPage.selectLegalStructure(legalStructureId);
  onOnboardingPage
    .getLegalStructure(legalStructureId)
    .parents(`[data-testid=${legalStructureId}]`)
    .find("span")
    .first()
    .should("have.class", "Mui-checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=4");

  if (townDisplayName) {
    onOnboardingPage.selectLocation(townDisplayName);
    onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  } else {
    onOnboardingPage.selectRandomLocation();
    onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("not.eq", "");
  }

  if (homeBasedQuestion === undefined) {
    onOnboardingPage.getHomeBased().should("not.exist");
  } else {
    onOnboardingPage.selectHomeBased(homeBasedQuestion);
    onOnboardingPage.getHomeBased(homeBasedQuestion).should("be.checked");
    onOnboardingPage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  onOnboardingPage.clickNext();
  cy.url().should("include", "onboarding?page=5");
  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.toggleContactMeCheckbox(!isContactMeChecked);
  onOnboardingPage.getContactMeCheckbox().should(`${!isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `roadmap`);
};

interface existingOnboardingData {
  businessFormationDate?: string;
  entityId?: string;
  businessName: string;
  sectorId: string;
  legalStructureId?: string;
  numberOfEmployees: string;
  townDisplayName: string;
  homeBasedQuestion: boolean;
  ownershipDataValues?: string[];
}

export const completeExistingBusinessOnboarding = ({
  businessFormationDate,
  entityId,
  businessName,
  sectorId,
  numberOfEmployees,
  townDisplayName,
  homeBasedQuestion,
  ownershipDataValues,
  legalStructureId = businessFormationDate || entityId || randomInt() % 2
    ? "limited-partnership"
    : "sole-proprietorship",
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = true,
  isContactMeChecked = false,
}: existingOnboardingData & Partial<registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectNewBusiness(true);
  onOnboardingPage.getHasExistingBusiness(true).should("be.checked");
  onOnboardingPage.getHasExistingBusiness(false).should("not.be.checked");
  const companyType = LookupLegalStructureById(legalStructureId);
  onOnboardingPage.selectLegalStructureDropDown(companyType.name);
  onOnboardingPage
    .getLegalStructureDropDown()
    .parent()
    .find("input")
    .invoke("prop", "value")
    .should("contain", legalStructureId);

  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  if (companyType.requiresPublicFiling) {
    if (businessFormationDate) {
      onOnboardingPage.typeBusinessFormationDate(businessFormationDate);
      onOnboardingPage
        .getBusinessFormationDatePicker()
        .invoke("prop", "value")
        .should("contain", businessFormationDate);
    }
    if (entityId) {
      onOnboardingPage.typeEntityId(entityId);
      onOnboardingPage.getEntityId().invoke("prop", "value").should("contain", entityId);
    }
    onOnboardingPage.clickNext();

    pageIndex += 1;
    cy.url().should("include", `onboarding?page=${pageIndex}`);
  }
  onOnboardingPage.typeBusinessName(businessName);
  onOnboardingPage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  onOnboardingPage.selectIndustrySector(sectorId);
  onOnboardingPage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId).name);
    });
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.typeNumberOfEmployees(numberOfEmployees);
  onOnboardingPage.getNumberOfEmployees().invoke("prop", "value").should("contain", numberOfEmployees);
  onOnboardingPage.selectLocation(townDisplayName);
  onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  onOnboardingPage.selectHomeBased(homeBasedQuestion);
  onOnboardingPage.getHomeBased(homeBasedQuestion).should("be.checked");
  onOnboardingPage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  if (!!ownershipDataValues && ownershipDataValues.length) {
    onOnboardingPage.selectOwnership(ownershipDataValues);
    ownershipDataValues.forEach((dataValue) => {
      onOnboardingPage.getOwnershipDropdown().invoke("prop", "value").should("contain", dataValue);
    });
  }
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.toggleContactMeCheckbox(!isContactMeChecked);
  onOnboardingPage.getContactMeCheckbox().should(`${!isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
interface startingProfileData extends startingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
}

interface existingProfileData extends existingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
  taxPin: string;
}

export const checkNewBusinessProfilePage = ({
  businessName,
  industry,
  legalStructureId: companyType,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId = "",
  taxId = "",
  notes = "",
  entityId = "",
}: Partial<startingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/roadmap");
  onRoadmapPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");

  if (businessName) {
    onOnboardingPage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  }

  onOnboardingPage
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
    onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  } else {
    onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("not.eq", "");
  }

  if (homeBasedQuestion === undefined) {
    onOnboardingPage.getHomeBased().should("not.exist");
  } else {
    onOnboardingPage.getHomeBased(homeBasedQuestion).should("be.checked");
    onOnboardingPage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  onProfilePage
    .getLegalStructure()
    .parent()
    .find("input")
    .invoke("prop", "value")
    .should("contain", companyType);

  const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
  onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);
  onProfilePage.getTaxId().invoke("prop", "value").should("contain", taxId);
  onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);

  if (isEntityIdApplicable(companyType)) {
    onProfilePage.getEntityId().should("exist");
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
  } else {
    onProfilePage.getEntityId().should("not.exist");
  }

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/roadmap");
};

export const checkExistingBusinessProfilePage = ({
  businessFormationDate,
  entityId,
  businessName,
  sectorId,
  numberOfEmployees,
  townDisplayName,
  homeBasedQuestion,
  ownershipDataValues,
  employerId = "",
  taxId = "",
  notes = "",
  taxPin = "",
}: Partial<existingProfileData>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");

  onProfilePage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  onProfilePage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId as string).name);
    });
  onProfilePage.getNumberOfEmployees().invoke("prop", "value").should("contain", numberOfEmployees);
  onProfilePage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  onProfilePage.getHomeBased(homeBasedQuestion).should("be.checked");
  onProfilePage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  if (!!ownershipDataValues && ownershipDataValues.length) {
    ownershipDataValues.forEach((dataValue) => {
      onProfilePage.getOwnershipDropdown().invoke("prop", "value").should("contain", dataValue);
    });
  }

  const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
  onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);

  if (entityId) {
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
  }

  onProfilePage
    .getBusinessFormationDatePicker()
    .invoke("prop", "value")
    .should("contain", businessFormationDate);

  onProfilePage.getTaxId().invoke("prop", "value").should("contain", taxId);
  onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  onProfilePage.getTaxPin().invoke("prop", "value").should("contain", taxPin);

  onProfilePage.clickSaveButton();
  cy.url().should("contain", "/dashboard");
};

export const updateNewBusinessProfilePage = ({
  businessName,
  industry,
  legalStructureId: companyType,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId,
  taxId,
  notes,
  entityId,
}: Partial<startingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/roadmap");
  onRoadmapPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");

  if (businessName) {
    onProfilePage.typeBusinessName(businessName);
    onProfilePage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  }

  if (industry) {
    onProfilePage.selectIndustry((industry as Industry).id);
    onProfilePage
      .getIndustryDropdown()
      .invoke("prop", "value")
      .should("contain", (industry as Industry).name);
  }

  if (companyType) {
    onProfilePage.selectLegalStructure(companyType);
    onProfilePage
      .getLegalStructure()
      .parent()
      .find("input")
      .invoke("prop", "value")
      .should("contain", companyType);
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

  if (entityId) {
    if (companyType && isEntityIdApplicable(companyType)) {
      onProfilePage.typeEntityId(entityId);
      onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
    } else if (!companyType) {
      onProfilePage
        .getLegalStructure()
        .parent()
        .find("input")
        .invoke("prop", "value")
        .then((legalStructure) => {
          if (isEntityIdApplicable(legalStructure)) {
            onProfilePage.typeEntityId(entityId);
            onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
          }
        });
    }
  }

  if (taxId) {
    onProfilePage.typeTaxId(taxId);
    onProfilePage.getTaxId().invoke("prop", "value").should("contain", taxId);
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
  cy.url().should("contain", "/roadmap");
};

export const updateExBusinessProfilePage = ({
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
}: Partial<existingProfileData>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");

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
    onProfilePage.getNumberOfEmployees().invoke("prop", "value").should("contain", numberOfEmployees);
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
    onProfilePage.typeTaxId(taxId);
    onProfilePage.getTaxId().invoke("prop", "value").should("contain", taxId);
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

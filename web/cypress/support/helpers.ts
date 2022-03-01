import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { Industries, Industry, LegalStructures, LookupIndustryById } from "@businessnjgovnavigator/shared";
import { onOnboardingPage } from "./page_objects/onboardingPage";
import { onProfilePage } from "./page_objects/profilePage";
import { onRoadmapPage } from "./page_objects/roadmapPage";

/* eslint-disable cypress/no-unnecessary-waiting */
export const clickNext = (): void => {
  cy.wait(300);
  cy.get('[data-testid="next"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

/* eslint-disable cypress/no-unnecessary-waiting */
export const clickSave = (): void => {
  cy.wait(300);
  cy.get('[data-testid="save"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

export const clickEdit = (): void => {
  cy.get('[data-testid="grey-callout-link"]').click();
  cy.wait(1000); // wait for onboarding animation
};

export const clickTask = (taskId: string): void => {
  cy.get('[id="plan-header"]').click();
  cy.get('[id="start-header"]').click();
  const taskValue = `[data-task="${taskId}"]`;
  cy.get(taskValue).click({ force: true });
  cy.wait(1000);
};

export const completeOnboarding = (
  businessName: string,
  industry: string,
  companyType: string,
  homeBased = true,
  city = "Absecon"
): void => {
  cy.wait(1000); // wait for onboarding animation

  // check 'starting a business'
  cy.get('input[type="radio"][value="false"]').check();
  clickNext();

  cy.get('input[aria-label="Business name"]').type(businessName);
  clickNext();

  const industryValue = LookupIndustryById(industry).name;
  cy.get('[aria-label="Industry"]').click();
  cy.contains(industryValue).click();
  clickNext();

  const companyTypeValue = `[data-value="${companyType}"]`;
  cy.get(companyTypeValue).click();
  clickNext();

  if (!homeBased) {
    cy.get('input[type="radio"][value="false"]').check();
  }

  cy.get('[aria-label="Location"]').click();
  cy.contains(city).click();
  clickNext();

  clickNext();
  cy.wait(2000); // wait for redirect
};

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

export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

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
};
interface startingOnboardingData {
  businessName: string;
  industry: Industry;
  companyType: string;
  townDisplayName: string;
  homeBasedQuestion: boolean | undefined;
  liquorLicenseQuestion: boolean | undefined;
}

export const completeNewBusinessOnboarding = ({
  businessName,
  industry,
  companyType,
  townDisplayName,
  homeBasedQuestion = undefined,
  liquorLicenseQuestion = undefined,
  fullName = "Michael Smith",
  email = "MichaelSmith@gmail.com",
}: startingOnboardingData & Partial<registration>): void => {
  cy.url().should("include", `onboarding?page=${1}`);
  onOnboardingPage.selectNewBusiness(false);
  onOnboardingPage.getHasExistingBusiness(true).should("not.be.checked");
  onOnboardingPage.getHasExistingBusiness(false).should("be.checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${2}`);
  onOnboardingPage.typeBusinessName(businessName);
  onOnboardingPage.getBusinessName().invoke("prop", "value").should("contain", businessName);
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${3}`);
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

  cy.url().should("include", `onboarding?page=${4}`);
  onOnboardingPage.selectLegalStructure(companyType);
  onOnboardingPage
    .getLegalStructure(companyType)
    .parents(`[data-testid=${companyType}]`)
    .find("span")
    .first()
    .should("have.class", "Mui-checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${5}`);
  onOnboardingPage.selectLocation(townDisplayName);
  onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);
  if (homeBasedQuestion === undefined) {
    onOnboardingPage.getHomeBased().should("not.exist");
  } else {
    onOnboardingPage.selectHomeBased(homeBasedQuestion);
    onOnboardingPage.getHomeBased(homeBasedQuestion).should("be.checked");
    onOnboardingPage.getHomeBased(!homeBasedQuestion).should("not.be.checked");
  }

  onOnboardingPage.clickNext();
  cy.url().should("include", `onboarding?page=${6}`);
  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.getNewsletterCheckbox().should("be.checked");
  onOnboardingPage.getContactMeCheckbox().should("not.be.checked");
  onOnboardingPage.checkContactMeCheckbox();
  onOnboardingPage.getContactMeCheckbox().should("be.checked");

  onOnboardingPage.clickNext();
  cy.url().should("include", `roadmap`);
};

interface startingProfileData extends startingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
}

export const checkProfilePage = ({
  businessName,
  industry,
  companyType,
  townDisplayName,
  homeBasedQuestion = undefined,
  liquorLicenseQuestion = undefined,
  employerId = "",
  taxId = "",
  notes = "",
  entityId = "",
}: Partial<startingProfileData>): void => {
  cy.url().should("contain", "/roadmap");
  onRoadmapPage.clickEditProfileLink();

  onOnboardingPage.getBusinessName().invoke("prop", "value").should("contain", businessName);
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
  onOnboardingPage.getLocationDropdown().invoke("prop", "value").should("contain", townDisplayName);

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

export const updateProfilePage = ({
  businessName,
  industry,
  companyType,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId,
  taxId,
  notes,
  entityId,
}: Partial<startingProfileData>): void => {
  cy.url().should("contain", "/roadmap");
  onRoadmapPage.clickEditProfileLink();

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

  if (entityId && !isEntityIdApplicable(companyType)) {
    onProfilePage.typeEntityId(entityId);
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
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

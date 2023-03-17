import { formatTaxId } from "@/lib/domain-logic/formatTaxId";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import {
  allFormationLegalTypes,
  arrayOfCountriesObjects as countries,
  arrayOfSectors,
  arrayOfStateObjects as states,
  BusinessSignerTypeMap,
  carServiceOptions,
  CarServiceType,
  FormationAddress,
  FormationFormData,
  FormationLegalType,
  FormationMember,
  FormationSigner,
  Industries,
  Industry,
  LegalStructure,
  LegalStructures,
  LookupLegalStructureById,
  LookupSectorTypeById,
  Municipality,
  randomInt,
  randomIntFromInterval,
} from "@businessnjgovnavigator/shared";
import { onDashboardPage } from "./page_objects/dashboardPage";
import { onOnboardingPage } from "./page_objects/onboardingPage";
import { onProfilePage } from "./page_objects/profilePage";

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
  return industry.industryOnboardingQuestions.canBeHomeBased && industry.canHavePermanentLocation;
});

export const liquorLicenseIndustries = Industries.filter((industry) => {
  return industry.industryOnboardingQuestions.isLiquorLicenseApplicable;
});

export const industriesNotHomeBasedOrLiquorLicense = Industries.filter((industry) => {
  return (
    !industry.industryOnboardingQuestions.canBeHomeBased &&
    industry.canHavePermanentLocation &&
    !industry.industryOnboardingQuestions.isLiquorLicenseApplicable
  );
});

export const legalStructureWithTradeName = LegalStructures.filter((legalStructure) => {
  return !legalStructure.hasTradeName;
});

type Registration = {
  fullName: string;
  email: string;
  isNewsletterChecked: boolean;
  isContactMeChecked: boolean;
};

interface StartingOnboardingData {
  industry: Industry | undefined;
  legalStructureId: string | undefined;
  townDisplayName: string | undefined;
  homeBasedQuestion: boolean | undefined;
  liquorLicenseQuestion: boolean | undefined;
  requiresCpa: boolean | undefined;
  providesStaffingService: boolean | undefined;
  certifiedInteriorDesigner: boolean | undefined;
  realEstateAppraisalManagement: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  carService: CarServiceType | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface ExistingOnboardingData {
  businessFormationDate?: string;
  businessName?: string;
  sectorId?: string;
  legalStructureId?: string;
  numberOfEmployees?: string;
  townDisplayName?: string;
  homeBasedQuestion?: boolean;
  ownershipDataValues?: string[];
}

interface ForeignOnboardingData {
  foreignBusinessTypeIds: string[];
  locationInNewJersey: boolean;
}

export const completeNewBusinessOnboarding = ({
  industry = undefined,
  legalStructureId = undefined,
  liquorLicenseQuestion = undefined,
  requiresCpa = undefined,
  providesStaffingService = undefined,
  certifiedInteriorDesigner = undefined,
  realEstateAppraisalManagement = undefined,
  interstateLogistics = undefined,
  interstateMoving = undefined,
  carService = undefined,
  isChildcareForSixOrMore = undefined,
  willSellPetCareItems = undefined,
  petCareHousing = undefined,
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = false,
  isContactMeChecked = false,
}: Partial<StartingOnboardingData> & Partial<Registration>): void => {
  if (industry === undefined) {
    industry = randomElementFromArray(Industries.filter((x) => x.isEnabled) as Industry[]) as Industry;
  }

  if (carService === undefined) {
    carService = industry.industryOnboardingQuestions.isCarServiceApplicable
      ? randomElementFromArray([...carServiceOptions])
      : undefined;
  }

  if (isChildcareForSixOrMore === undefined) {
    isChildcareForSixOrMore = industry.industryOnboardingQuestions.isChildcareForSixOrMore
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (petCareHousing === undefined) {
    petCareHousing = industry.industryOnboardingQuestions.isPetCareHousingApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }
  if (willSellPetCareItems === undefined) {
    willSellPetCareItems = industry.industryOnboardingQuestions.willSellPetCareItems
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (liquorLicenseQuestion === undefined) {
    liquorLicenseQuestion = industry.industryOnboardingQuestions.isLiquorLicenseApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (requiresCpa === undefined) {
    requiresCpa = industry.industryOnboardingQuestions.isCpaRequiredApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (providesStaffingService === undefined) {
    providesStaffingService = industry.industryOnboardingQuestions.isProvidesStaffingServicesApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (certifiedInteriorDesigner === undefined) {
    certifiedInteriorDesigner = industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (realEstateAppraisalManagement === undefined) {
    realEstateAppraisalManagement = industry.industryOnboardingQuestions
      .isRealEstateAppraisalManagementApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (interstateLogistics === undefined) {
    interstateLogistics = industry.industryOnboardingQuestions.isInterstateLogisticsApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (interstateMoving === undefined) {
    interstateMoving = industry.industryOnboardingQuestions.isInterstateMovingApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (legalStructureId === undefined) {
    legalStructureId = randomElementFromArray(LegalStructures as LegalStructure[]).id;
  }

  if (!industry.industryOnboardingQuestions.isCpaRequiredApplicable && requiresCpa) {
    throw "Cypress configuration error - CPA set for non-cpa industry";
  }

  cy.url().should("include", "onboarding?page=1");
  onOnboardingPage.selectBusinessPersona("STARTING");
  onOnboardingPage.getBusinessPersona("STARTING").should("be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");
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

  if (requiresCpa === undefined) {
    onOnboardingPage.getCpa().should("not.exist");
  } else {
    onOnboardingPage.selectCpa(requiresCpa);
    onOnboardingPage.getCpa(requiresCpa).should("be.checked");
    onOnboardingPage.getCpa(!requiresCpa).should("not.be.checked");
  }

  if (providesStaffingService === undefined) {
    onOnboardingPage.getStaffingService().should("not.exist");
  } else {
    onOnboardingPage.selectStaffingService(providesStaffingService);
    onOnboardingPage.getStaffingService(providesStaffingService).should("be.checked");
    onOnboardingPage.getStaffingService(!providesStaffingService).should("not.be.checked");
  }

  if (certifiedInteriorDesigner === undefined) {
    onOnboardingPage.getInteriorDesigner().should("not.exist");
  } else {
    onOnboardingPage.selectInteriorDesigner(certifiedInteriorDesigner);
    onOnboardingPage.getInteriorDesigner(certifiedInteriorDesigner).should("be.checked");
    onOnboardingPage.getInteriorDesigner(!certifiedInteriorDesigner).should("not.be.checked");
  }

  if (realEstateAppraisalManagement === undefined) {
    onOnboardingPage.getRealEstateAppraisal().should("not.exist");
  } else {
    onOnboardingPage.selectRealEstateAppraisal(realEstateAppraisalManagement);
    onOnboardingPage.getRealEstateAppraisal(realEstateAppraisalManagement).should("be.checked");
    onOnboardingPage.getRealEstateAppraisal(!realEstateAppraisalManagement).should("not.be.checked");
  }

  if (interstateLogistics === undefined) {
    onOnboardingPage.getInterstateLogistics().should("not.exist");
  } else {
    onOnboardingPage.selectInterstateLogistics(!!interstateLogistics);
    onOnboardingPage.getInterstateLogistics(interstateLogistics).should("be.checked");
    onOnboardingPage.getInterstateLogistics(!interstateLogistics).should("not.be.checked");
  }

  if (interstateMoving === undefined) {
    onOnboardingPage.getInterstateMoving().should("not.exist");
  } else {
    onOnboardingPage.selectInterstateMoving(!!interstateMoving);
    onOnboardingPage.getInterstateMoving(interstateMoving).should("be.checked");
    onOnboardingPage.getInterstateMoving(!interstateMoving).should("not.be.checked");
  }

  if (carService === undefined) {
    onOnboardingPage.getCarService().should("not.exist");
  } else {
    onOnboardingPage.selectCarService(carService);
    onOnboardingPage.getCarService(carService).should("be.checked");

    const otherValues = carServiceOptions.filter((value) => value !== carService);
    otherValues.forEach((value) => {
      onOnboardingPage.getCarService(value).should("not.be.checked");
    });
  }

  if (isChildcareForSixOrMore === undefined) {
    onOnboardingPage.getChildcare().should("not.exist");
  } else {
    onOnboardingPage.selectChildcare(isChildcareForSixOrMore);
    onOnboardingPage.getChildcare(isChildcareForSixOrMore).should("be.checked");
    onOnboardingPage.getChildcare(!isChildcareForSixOrMore).should("not.be.checked");
  }

  if (willSellPetCareItems === undefined) {
    onOnboardingPage.getWillSellPetcareItems().should("not.exist");
  } else {
    onOnboardingPage.selectWillSellPetcareItems(willSellPetCareItems);
    onOnboardingPage.getWillSellPetcareItems(willSellPetCareItems).should("be.checked");
    onOnboardingPage.getWillSellPetcareItems(!willSellPetCareItems).should("not.be.checked");
  }

  if (petCareHousing === undefined) {
    onOnboardingPage.getPetCareHousing().should("not.exist");
  } else {
    onOnboardingPage.selectPetCareHousing(petCareHousing);
    onOnboardingPage.getPetCareHousing(petCareHousing).should("be.checked");
    onOnboardingPage.getPetCareHousing(!petCareHousing).should("not.be.checked");
  }

  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=3");
  onOnboardingPage.selectLegalStructure(legalStructureId!);
  onOnboardingPage
    .getLegalStructure(legalStructureId!)
    .parents(`[data-testid=${legalStructureId}]`)
    .find("span")
    .first()
    .should("have.class", "Mui-checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=4");

  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.toggleNewsletterCheckbox(isNewsletterChecked);
  onOnboardingPage.toggleContactMeCheckbox(isContactMeChecked);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};

export const completeExistingBusinessOnboarding = ({
  sectorId = randomElementFromArray(arrayOfSectors).id,
  legalStructureId = randomInt() % 2 ? "limited-partnership" : "sole-proprietorship",
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = false,
  isContactMeChecked = false,
}: Partial<ExistingOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("OWNING");
  onOnboardingPage.getBusinessPersona("OWNING").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");
  const companyType = LookupLegalStructureById(legalStructureId);
  onOnboardingPage.selectLegalStructureDropDown(companyType.name);
  onOnboardingPage
    .getLegalStructureDropDown()
    .parent()
    .find("input")
    .invoke("prop", "value")
    .should("contain", legalStructureId);

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

  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.toggleNewsletterCheckbox(isNewsletterChecked);
  onOnboardingPage.toggleContactMeCheckbox(isContactMeChecked);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};

export const completeForeignBusinessOnboarding = ({
  foreignBusinessTypeIds,
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = false,
  isContactMeChecked = false,
}: Partial<ForeignOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("FOREIGN");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  if (foreignBusinessTypeIds) {
    for (const id of foreignBusinessTypeIds) {
      onOnboardingPage.checkForeignBusinessType(id);
    }
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
  onOnboardingPage.toggleNewsletterCheckbox(isNewsletterChecked);
  onOnboardingPage.toggleContactMeCheckbox(isContactMeChecked);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};

export const completeForeignNexusBusinessOnboarding = ({
  fullName = `Michael Smith ${randomInt()}`,
  email = `MichaelSmith${randomInt()}@gmail.com`,
  isNewsletterChecked = false,
  isContactMeChecked = false,
  industry = undefined,
  legalStructureId = undefined,
  townDisplayName = "Absecon",
  locationInNewJersey = false,
}: Partial<ForeignOnboardingData> & Partial<StartingOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("FOREIGN");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.checkForeignBusinessType("employeeOrContractorInNJ");
  onOnboardingPage.clickNext();
  cy.url().should("include", `onboarding?page=3`);

  if (industry === undefined) {
    industry = randomElementFromArray(Industries.filter((x) => x.isEnabled) as Industry[]) as Industry;
  }

  onOnboardingPage.selectIndustry((industry as Industry).id);
  onOnboardingPage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=4");

  if (legalStructureId === undefined) {
    legalStructureId = randomInt() % 2 ? "limited-partnership" : "sole-proprietorship";
  }

  onOnboardingPage.selectLegalStructure(legalStructureId!);
  onOnboardingPage
    .getLegalStructure(legalStructureId!)
    .parents(`[data-testid=${legalStructureId}]`)
    .find("span")
    .first()
    .should("have.class", "Mui-checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=5");

  onOnboardingPage.selectLocationInNewJersey(locationInNewJersey);

  onOnboardingPage.clickNext();
  cy.url().should("include", "onboarding?page=6");
  onOnboardingPage.typeFullName(fullName);
  onOnboardingPage.getFullName().invoke("prop", "value").should("contain", fullName);
  onOnboardingPage.typeEmail(email);
  onOnboardingPage.getEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.typeConfirmEmail(email);
  onOnboardingPage.getConfirmEmail().invoke("prop", "value").should("contain", email);
  onOnboardingPage.toggleNewsletterCheckbox(isNewsletterChecked);
  onOnboardingPage.toggleContactMeCheckbox(isContactMeChecked);
  onOnboardingPage.getNewsletterCheckbox().should(`${isNewsletterChecked ? "be" : "not.be"}.checked`);
  onOnboardingPage.getContactMeCheckbox().should(`${isContactMeChecked ? "be" : "not.be"}.checked`);

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};

interface StartingProfileData extends StartingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
}

interface ExistingProfileData extends ExistingOnboardingData {
  employerId: string;
  taxId: string;
  notes: string;
  entityId: string;
  taxPin: string;
}

interface ForeignProfileData {
  taxId: string;
  notes: string;
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
}: Partial<StartingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileLink();
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

  onProfilePage
    .getLegalStructure()
    .parent()
    .find("input")
    .invoke("prop", "value")
    .should("contain", companyType);

  const employerIdWithMatch = employerId.match("^[0-9]$") ? employerId.match("^[0-9]$") : "";
  onProfilePage.getEmployerId().invoke("prop", "value").should("contain", employerIdWithMatch);
  onProfilePage.getTaxId().invoke("prop", "value").should("contain", formatTaxId(taxId));
  onProfilePage.getNotes().invoke("prop", "value").should("contain", notes);
  if (isEntityIdApplicable(companyType)) {
    onProfilePage.getEntityId().should("exist");
    onProfilePage.getEntityId().invoke("prop", "value").should("contain", entityId);
  } else {
    onProfilePage.getEntityId().should("not.exist");
  }

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
  onDashboardPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");

  cy.wait(1000);

  onProfilePage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId as string).name);
    });
  if (numberOfEmployees !== undefined) {
    onProfilePage.getNumberOfEmployees().invoke("prop", "value").should("contain", numberOfEmployees);
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
  legalStructureId: companyType,
  townDisplayName,
  homeBasedQuestion,
  liquorLicenseQuestion,
  employerId,
  taxId,
  notes,
  entityId,
}: Partial<StartingProfileData & { businessName: string }>): void => {
  cy.url().should("contain", "/dashboard");
  onDashboardPage.clickEditProfileLink();
  cy.url().should("contain", "/profile");
  cy.wait(1000);

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
  onDashboardPage.clickEditProfileLink();
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

export const updateForeignBusinessProfilePage = ({ taxId, notes }: Partial<ForeignProfileData>): void => {
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

export interface AdditionalFormation extends Partial<FormationFormData> {
  registeredAgentSameAsAccountCheckbox: boolean;
  getRegisteredAgentSameAsBusinessAddressCheckbox: boolean;
}

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateFormationUSAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-address-city-${randomInt()}`,
    addressState: randomElementFromArray(
      states.filter((state) => {
        return state.shortCode != "NJ";
      })
    ),
    addressCountry: "US",
    addressZipCode: randomInt(5).toString(),
    businessLocationType: "US",
    addressMunicipality: undefined,
    addressProvince: undefined,
    ...overrides,
  };
};

export const generateFormationForeignAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-address-city-${randomInt()}`,
    businessLocationType: "INTL",
    addressState: undefined,
    addressMunicipality: undefined,
    addressCountry: randomElementFromArray(
      countries.filter((item) => {
        return item.shortCode != "US";
      })
    ).shortCode,
    addressProvince: `some-address-province-${randomInt()}`,
    addressZipCode: randomInt(11).toString(),
    ...overrides,
  };
};

export const generateFormationNJAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
    addressCity: undefined,
    addressProvince: undefined,
    addressCountry: "US",
    businessLocationType: "NJ",
    addressState: { shortCode: "NJ", name: "New Jersey" },
    addressZipCode: `0${randomIntFromInterval("07001", "08999").toString()}`,
    ...overrides,
  };
};

export const generateFormationMember = (overrides: Partial<FormationMember>): FormationMember => {
  return {
    name: `some-members-name-${randomInt()}`,
    ...generateFormationUSAddress({}),
    ...overrides,
  };
};

export const randomFormationLegalType = (): FormationLegalType => {
  return randomElementFromArray(allFormationLegalTypes as unknown as string[]) as FormationLegalType;
};

export const generateFormationSigner = (
  overrides: Partial<FormationSigner>,
  legalStructureId?: FormationLegalType
): FormationSigner => {
  return {
    name: `some-signer-name-${randomInt()}`,
    signature: false,
    title: getSignerType(legalStructureId),
    ...overrides,
  };
};

const getSignerType = (legalStructureId?: FormationLegalType) => {
  return randomElementFromArray(
    legalStructureId
      ? BusinessSignerTypeMap[legalStructureId]
      : BusinessSignerTypeMap[randomFormationLegalType()]
  );
};

export const randomHomeBasedIndustry = (): Industry => {
  return randomElementFromArray(homeBasedIndustries.filter((x) => x.isEnabled) as Industry[]);
};

export const randomNonHomeBasedIndustry = (): Industry => {
  return randomElementFromArray(
    industriesNotHomeBasedOrLiquorLicense.filter((x) => x.isEnabled) as Industry[]
  );
};

export const randomPublicFilingLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.requiresPublicFiling)).id;
};

export const randomTradeNameLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.hasTradeName)).id;
};

export const clickDeferredSaveButton = () => {
  return cy.get(`button[data-testid="deferred-question-save"]`).click();
};

export const waitForUserDataMountUpdate = () => {
  cy.intercept({
    method: "POST",
    url: "/local/api/users",
  }).as("updateOnMount");

  cy.intercept({
    method: "GET",
    url: "/local/api/users/**",
  }).as("getAfterUpdateOnMount");

  cy.wait("@updateOnMount");
  cy.wait("@getAfterUpdateOnMount");
  cy.wait(100);
};

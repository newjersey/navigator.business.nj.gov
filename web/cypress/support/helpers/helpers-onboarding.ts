import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import {
  ExistingOnboardingData,
  ForeignOnboardingData,
  Registration,
  StartingOnboardingData,
} from "@businessnjgovnavigator/cypress/support/types";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/lib/shared/src/industry";
import { randomInt } from "@businessnjgovnavigator/shared/lib/shared/src/intHelpers";
import { carServiceOptions } from "@businessnjgovnavigator/shared/lib/shared/src/profileData";
import { arrayOfSectors, LookupSectorTypeById } from "@businessnjgovnavigator/shared/lib/shared/src/sector";

export const completeNewBusinessOnboarding = ({
  industry = undefined,
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
}: Partial<StartingOnboardingData> & Partial<Registration>): void => {
  if (industry === undefined) {
    industry = randomElementFromArray(getIndustries()) as Industry;
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

  if (!industry.industryOnboardingQuestions.isCpaRequiredApplicable && requiresCpa) {
    throw new Error("Cypress configuration error - CPA set for non-cpa industry");
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
  cy.url().should("include", `dashboard`);
};
export const completeExistingBusinessOnboarding = ({
  sectorId = randomElementFromArray(arrayOfSectors).id,
}: Partial<ExistingOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("OWNING");
  onOnboardingPage.getBusinessPersona("OWNING").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");

  onOnboardingPage.selectIndustrySector(sectorId);
  onOnboardingPage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId).name);
    });
  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
export const completeForeignBusinessOnboarding = ({
  foreignBusinessTypeIds,
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
  cy.url().should("include", `dashboard`);
};
export const completeForeignNexusBusinessOnboarding = ({
  industry = undefined,
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

  if (locationInNewJersey === true) {
    onOnboardingPage.checkForeignBusinessType("officeInNJ");
  }

  onOnboardingPage.checkForeignBusinessType("employeeOrContractorInNJ");
  onOnboardingPage.clickNext();
  cy.url().should("include", `onboarding?page=3`);

  if (industry === undefined) {
    industry = randomElementFromArray(getIndustries()) as Industry;
  }

  onOnboardingPage.selectIndustry((industry as Industry).id);
  onOnboardingPage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  onOnboardingPage.clickNext();

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};

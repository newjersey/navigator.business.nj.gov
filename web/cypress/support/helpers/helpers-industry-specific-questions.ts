import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import { OnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import { StartingOnboardingData } from "@businessnjgovnavigator/cypress/support/types";
import { Industry } from "@businessnjgovnavigator/shared/lib/shared/src/industry";
import { randomInt } from "@businessnjgovnavigator/shared/lib/shared/src/intHelpers";
import {
  cannabisLicenseOptions,
  carServiceOptions,
  constructionOptions,
  employmentPersonnelServiceOptions,
  employmentPlacementOptions,
  propertyLeaseTypeOptions,
  residentialConstructionOptions,
} from "@businessnjgovnavigator/shared/lib/shared/src/profileData";

// The industry-specific "essential question" fields, shared by onboarding and the profile page.
// homeBasedQuestion is a non-essential question handled separately by each caller.
export type IndustrySpecificAnswers = Omit<
  StartingOnboardingData,
  "industry" | "homeBasedQuestion"
>;

/**
 * Resolves a full set of industry-specific essential-question answers for the given industry.
 * Any field left undefined in `overrides` is derived: a random valid value if the field is
 * applicable to the industry, otherwise undefined (meaning the question should not render).
 */
export const deriveIndustrySpecificAnswers = (
  industry: Industry,
  overrides: Partial<IndustrySpecificAnswers> = {},
): IndustrySpecificAnswers => {
  let {
    liquorLicenseQuestion,
    requiresCpa,
    providesStaffingService,
    certifiedInteriorDesigner,
    realEstateAppraisalManagement,
    interstateLogistics,
    interstateMoving,
    carService,
    isChildcareForSixOrMore,
    willSellPetCareItems,
    petCareHousing,
    whatIsPropertyLeaseType,
    hasThreeOrMoreRentalUnits,
    cannabisLicenseType,
    constructionType,
    residentialConstructionType,
    publicWorksContractor,
    employmentPersonnelServiceType,
    employmentPlacementType,
  } = overrides;

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
    providesStaffingService = industry.industryOnboardingQuestions
      .isProvidesStaffingServicesApplicable
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (certifiedInteriorDesigner === undefined) {
    certifiedInteriorDesigner = industry.industryOnboardingQuestions
      .isCertifiedInteriorDesignerApplicable
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

  if (whatIsPropertyLeaseType === undefined) {
    whatIsPropertyLeaseType = industry.industryOnboardingQuestions.whatIsPropertyLeaseType
      ? randomElementFromArray([...propertyLeaseTypeOptions])
      : undefined;
  }

  if (hasThreeOrMoreRentalUnits === undefined) {
    hasThreeOrMoreRentalUnits = industry.industryOnboardingQuestions.canHaveThreeOrMoreRentalUnits
      ? Boolean(randomInt() % 2)
      : undefined;
  }

  if (cannabisLicenseType === undefined) {
    cannabisLicenseType = industry.industryOnboardingQuestions.isCannabisLicenseTypeApplicable
      ? randomElementFromArray([...cannabisLicenseOptions])
      : undefined;
  }

  if (constructionType === undefined) {
    constructionType = industry.industryOnboardingQuestions.isConstructionTypeApplicable
      ? randomElementFromArray([...constructionOptions])
      : undefined;
  }

  if (residentialConstructionType === undefined) {
    residentialConstructionType =
      industry.industryOnboardingQuestions.isConstructionTypeApplicable &&
      (constructionType === "RESIDENTIAL" || constructionType === "BOTH")
        ? randomElementFromArray([...residentialConstructionOptions])
        : undefined;
  }

  if (publicWorksContractor === undefined) {
    publicWorksContractor =
      industry.industryOnboardingQuestions.isConstructionTypeApplicable &&
      (constructionType === "COMMERCIAL_OR_INDUSTRIAL" || constructionType === "BOTH")
        ? Boolean(randomInt() % 2)
        : undefined;
  }

  if (employmentPersonnelServiceType === undefined) {
    employmentPersonnelServiceType = industry.industryOnboardingQuestions
      .isEmploymentAndPersonnelTypeApplicable
      ? randomElementFromArray([...employmentPersonnelServiceOptions])
      : undefined;
  }

  if (employmentPlacementType === undefined) {
    employmentPlacementType =
      industry.industryOnboardingQuestions.isEmploymentAndPersonnelTypeApplicable &&
      employmentPersonnelServiceType === "EMPLOYERS"
        ? randomElementFromArray([...employmentPlacementOptions])
        : undefined;
  }

  if (!industry.industryOnboardingQuestions.isCpaRequiredApplicable && requiresCpa) {
    throw new Error("Cypress configuration error - CPA set for non-cpa industry");
  }

  return {
    liquorLicenseQuestion,
    requiresCpa,
    providesStaffingService,
    certifiedInteriorDesigner,
    realEstateAppraisalManagement,
    interstateLogistics,
    interstateMoving,
    carService,
    isChildcareForSixOrMore,
    willSellPetCareItems,
    petCareHousing,
    whatIsPropertyLeaseType,
    hasThreeOrMoreRentalUnits,
    cannabisLicenseType,
    constructionType,
    residentialConstructionType,
    publicWorksContractor,
    employmentPersonnelServiceType,
    employmentPlacementType,
  };
};

/**
 * Applies and asserts every industry-specific essential-question answer against the given page
 * object. Works on both the onboarding page and the profile page, since both render these
 * questions through the same underlying fields.
 */
export const answerIndustrySpecificQuestions = ({
  page,
  liquorLicenseQuestion,
  requiresCpa,
  providesStaffingService,
  certifiedInteriorDesigner,
  realEstateAppraisalManagement,
  interstateLogistics,
  interstateMoving,
  carService,
  isChildcareForSixOrMore,
  willSellPetCareItems,
  petCareHousing,
  cannabisLicenseType,
  constructionType,
  residentialConstructionType,
  publicWorksContractor,
  employmentPersonnelServiceType,
  employmentPlacementType,
  whatIsPropertyLeaseType,
  hasThreeOrMoreRentalUnits,
}: { page: OnboardingPage } & IndustrySpecificAnswers): void => {
  if (liquorLicenseQuestion === undefined) {
    page.getLiquorLicense().should("not.exist");
  } else {
    page.selectLiquorLicense(liquorLicenseQuestion);
    page.getLiquorLicense(liquorLicenseQuestion).should("be.checked");
    page.getLiquorLicense(!liquorLicenseQuestion).should("not.be.checked");
  }

  if (requiresCpa === undefined) {
    page.getCpa().should("not.exist");
  } else {
    page.selectCpa(requiresCpa);
    page.getCpa(requiresCpa).should("be.checked");
    page.getCpa(!requiresCpa).should("not.be.checked");
  }

  if (providesStaffingService === undefined) {
    page.getStaffingService().should("not.exist");
  } else {
    page.selectStaffingService(providesStaffingService);
    page.getStaffingService(providesStaffingService).should("be.checked");
    page.getStaffingService(!providesStaffingService).should("not.be.checked");
  }

  if (certifiedInteriorDesigner === undefined) {
    page.getInteriorDesigner().should("not.exist");
  } else {
    page.selectInteriorDesigner(certifiedInteriorDesigner);
    page.getInteriorDesigner(certifiedInteriorDesigner).should("be.checked");
    page.getInteriorDesigner(!certifiedInteriorDesigner).should("not.be.checked");
  }

  if (realEstateAppraisalManagement === undefined) {
    page.getRealEstateAppraisal().should("not.exist");
  } else {
    page.selectRealEstateAppraisal(realEstateAppraisalManagement);
    page.getRealEstateAppraisal(realEstateAppraisalManagement).should("be.checked");
    page.getRealEstateAppraisal(!realEstateAppraisalManagement).should("not.be.checked");
  }

  if (interstateLogistics === undefined) {
    page.getInterstateLogistics().should("not.exist");
  } else {
    page.selectInterstateLogistics(!!interstateLogistics);
    page.getInterstateLogistics(interstateLogistics).should("be.checked");
    page.getInterstateLogistics(!interstateLogistics).should("not.be.checked");
  }

  if (interstateMoving === undefined) {
    page.getInterstateMoving().should("not.exist");
  } else {
    page.selectInterstateMoving(!!interstateMoving);
    page.getInterstateMoving(interstateMoving).should("be.checked");
    page.getInterstateMoving(!interstateMoving).should("not.be.checked");
  }

  if (carService === undefined) {
    page.getCarService().should("not.exist");
  } else {
    page.selectCarService(carService);
    page.getCarService(carService).should("be.checked");

    const otherValues = carServiceOptions.filter((value) => value !== carService);
    otherValues.forEach((value) => {
      page.getCarService(value).should("not.be.checked");
    });
  }

  if (isChildcareForSixOrMore === undefined) {
    page.getChildcare().should("not.exist");
  } else {
    page.selectChildcare(isChildcareForSixOrMore);
    page.getChildcare(isChildcareForSixOrMore).should("be.checked");
    page.getChildcare(!isChildcareForSixOrMore).should("not.be.checked");
  }

  if (willSellPetCareItems === undefined) {
    page.getWillSellPetcareItems().should("not.exist");
  } else {
    page.selectWillSellPetcareItems(willSellPetCareItems);
    page.getWillSellPetcareItems(willSellPetCareItems).should("be.checked");
    page.getWillSellPetcareItems(!willSellPetCareItems).should("not.be.checked");
  }

  if (petCareHousing === undefined) {
    page.getPetCareHousing().should("not.exist");
  } else {
    page.selectPetCareHousing(petCareHousing);
    page.getPetCareHousing(petCareHousing).should("be.checked");
    page.getPetCareHousing(!petCareHousing).should("not.be.checked");
  }

  if (cannabisLicenseType === undefined) {
    page.getCannabisLicenseType().should("not.exist");
  } else {
    page.selectCannabisLicenseType(cannabisLicenseType);
    page.getCannabisLicenseType(cannabisLicenseType).should("be.checked");
  }

  if (constructionType === undefined) {
    page.getConstructionType().should("not.exist");
  } else {
    page.selectConstructionType(constructionType);
    page.getConstructionType(constructionType).should("be.checked");
    if (
      residentialConstructionType !== undefined &&
      (constructionType === "RESIDENTIAL" || constructionType === "BOTH")
    ) {
      page.selectResidentialConstructionType(residentialConstructionType);
      page.getResidentialConstructionType(residentialConstructionType).should("be.checked");
    }
    if (
      publicWorksContractor !== undefined &&
      (constructionType === "COMMERCIAL_OR_INDUSTRIAL" || constructionType === "BOTH")
    ) {
      page.selectPublicWorksContractor(publicWorksContractor);
      page.getPublicWorksContractor(publicWorksContractor).should("be.checked");
    }
  }

  if (employmentPersonnelServiceType === undefined) {
    page.getEmploymentPersonnelServiceType().should("not.exist");
  } else {
    page.selectEmploymentPersonnelServiceType(employmentPersonnelServiceType);
    page.getEmploymentPersonnelServiceType(employmentPersonnelServiceType).should("be.checked");
    if (employmentPlacementType !== undefined && employmentPersonnelServiceType === "EMPLOYERS") {
      page.selectEmploymentPlacementType(employmentPlacementType);
      page.getEmploymentPlacementType(employmentPlacementType).should("be.checked");
    }
  }

  if (whatIsPropertyLeaseType === undefined) {
    page.getPropertyLeaseType().should("not.exist");
  } else {
    page.selectPropertyLeaseType(whatIsPropertyLeaseType);
    page.getPropertyLeaseType(whatIsPropertyLeaseType).should("be.checked");
    if (
      hasThreeOrMoreRentalUnits !== undefined &&
      (whatIsPropertyLeaseType === "LONG_TERM_RENTAL" || whatIsPropertyLeaseType === "BOTH")
    ) {
      page.selectHasThreeOrMoreRentalUnits(hasThreeOrMoreRentalUnits);
      page.getHasThreeOrMoreRentalUnits(hasThreeOrMoreRentalUnits).should("be.checked");
    }
  }
};

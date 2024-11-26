import { getIsApplicableToFunctionByFieldName } from "@/lib/domain-logic/essentialQuestions";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { getNonEssentialQuestionAddOn } from "@/lib/domain-logic/getNonEssentialQuestionAddOn";
import { isInterstateLogisticsApplicable } from "@/lib/domain-logic/isInterstateLogisticsApplicable";
import { isInterstateMovingApplicable } from "@/lib/domain-logic/isInterstateMovingApplicable";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  determineForeignBusinessType,
  fetchMunicipalityById,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";

export const buildUserRoadmap = async (profileData: ProfileData): Promise<Roadmap> => {
  let industryId = profileData.industryId;
  if (profileData.providesStaffingService) {
    industryId = "employment-agency";
  }

  if (industryId === "interior-designer" && !profileData.certifiedInteriorDesigner) {
    industryId = "generic";
  }

  let addOns: string[] = [
    ...getForeignAddOns(profileData),
    ...getIndustryBasedAddOns(profileData, industryId),
    ...getLegalStructureAddOns(profileData),
  ];

  const isDomesticEmployer = profileData.businessPersona === "STARTING" && industryId === "domestic-employer";
  if (isDomesticEmployer) {
    addOns = [];
  }

  let roadmap = await buildRoadmap({ industryId: industryId, addOns });

  roadmap = profileData.municipality
    ? await addMunicipalitySpecificData(roadmap, profileData.municipality.id)
    : cleanupMunicipalitySpecificData(roadmap);

  roadmap = addNaicsCodeData(roadmap, profileData.naicsCode);

  if (
    profileData.businessPersona === "FOREIGN" &&
    determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "NEXUS"
  ) {
    roadmap = removeTask(roadmap, "business-plan");
    roadmap = removeTask(roadmap, "register-for-ein");
  }

  if (getIsApplicableToFunctionByFieldName("carService")(industryId) && profileData.carService === "BOTH") {
    roadmap = removeTask(roadmap, "taxi-insurance");
  }

  return roadmap;
};

const getForeignAddOns = (profileData: ProfileData): string[] => {
  const addOns = [];

  if (determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "REMOTE_WORKER") {
    addOns.push("foreign-remote-worker");
  }

  if (determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "REMOTE_SELLER") {
    addOns.push("foreign-remote-seller");
  }

  if (determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "NEXUS") {
    addOns.push("foreign-nexus");
  }

  return addOns;
};

const getIndustryBasedAddOns = (profileData: ProfileData, industryId: string | undefined): string[] => {
  const industry = LookupIndustryById(industryId);
  if (industry.id === "") {
    return [];
  }
  const addOns = [];

  if (
    industry.canHavePermanentLocation &&
    profileData.homeBasedBusiness === false &&
    nexusLocationInNewJersey(profileData) !== false
  ) {
    addOns.push("permanent-location-business");
  }

  if (profileData.liquorLicense) {
    addOns.push("liquor-license");
  }

  if (profileData.requiresCpa) {
    addOns.push("cpa");
  }

  if (profileData.petCareHousing) {
    addOns.push("petcare-license");
  }

  if (profileData.homeBasedBusiness && industry.industryOnboardingQuestions.isTransportation) {
    addOns.push("home-based-transportation");
  }

  if (!profileData.homeBasedBusiness && profileData.plannedRenovationQuestion === true) {
    addOns.push("planned-renovation");
  }

  if (profileData.cannabisLicenseType === "ANNUAL") {
    addOns.push("cannabis-annual");
  }

  if (profileData.cannabisLicenseType === "CONDITIONAL") {
    addOns.push("cannabis-conditional");
  }

  if (getIsApplicableToFunctionByFieldName("realEstateAppraisalManagement")(industryId)) {
    if (profileData.realEstateAppraisalManagement) {
      addOns.push("real-estate-appraisal-management");
    } else {
      addOns.push("real-estate-appraiser");
    }
  }

  if (getIsApplicableToFunctionByFieldName("carService")(industryId)) {
    switch (profileData.carService) {
      case "STANDARD": {
        addOns.push("car-service-standard");
        break;
      }
      case "HIGH_CAPACITY": {
        addOns.push("car-service-high-capacity");
        break;
      }
      case "BOTH": {
        addOns.push("car-service-standard");
        addOns.push("car-service-high-capacity");
        break;
      }
    }
  }

  if (getIsApplicableToFunctionByFieldName("residentialConstructionType")(industryId)) {
    switch (profileData.residentialConstructionType) {
      case "HOME_RENOVATIONS": {
        addOns.push("construction-home-renovation");
        break;
      }
      case "NEW_HOME_CONSTRUCTION": {
        addOns.push("construction-new-home-construction");
        break;
      }
      case "BOTH": {
        addOns.push("construction-new-home-construction");
        addOns.push("construction-home-renovation");
        break;
      }
    }
  }

  if (industryId === "employment-agency") {
    if (profileData.employmentPersonnelServiceType === "JOB_SEEKERS") {
      addOns.push("employment-agency-job-seekers");
    }

    if (profileData.employmentPersonnelServiceType === "EMPLOYERS") {
      switch (profileData.employmentPlacementType) {
        case "TEMPORARY": {
          addOns.push("employment-agency-employers-temporary");
          break;
        }
        case "PERMANENT": {
          addOns.push("employment-agency-employers-permanent");
          break;
        }
        case "BOTH": {
          addOns.push("employment-agency-employers-both");
          break;
        }
      }
    }
  }

  if (isInterstateLogisticsApplicable(industryId) && profileData.interstateLogistics) {
    addOns.push("interstate-logistics");
  }

  if (isInterstateMovingApplicable(industryId) && profileData.interstateMoving) {
    addOns.push("interstate-moving");
  }

  if (industryId === "logistics") {
    addOns.push("logistics-modification");
  }

  if (industryId === "residential-landlord") {
    addOns.push("permanent-location-business-landlord");
  }

  if (profileData.elevatorOwningBusiness) {
    addOns.push("elevator-owning-business");
  }

  if (getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")(industryId)) {
    if (profileData.isChildcareForSixOrMore) {
      addOns.push("daycare");
    } else {
      addOns.push("family-daycare");
    }
  }

  if (profileData.willSellPetCareItems) {
    addOns.push("will-sell-pet-care-items");
  }

  if (industry.industryOnboardingQuestions.canBeReseller) {
    addOns.push("reseller");
  }

  if (profileData.propertyLeaseType === "LONG_TERM_RENTAL" || profileData.propertyLeaseType === "BOTH") {
    if (profileData.hasThreeOrMoreRentalUnits) {
      addOns.push("residential-landlord-long-term-many-units");
    } else {
      addOns.push("residential-landlord-long-term-few-units");
    }
  }

  if (profileData.propertyLeaseType === "SHORT_TERM_RENTAL" || profileData.propertyLeaseType === "BOTH") {
    addOns.push("short-term-rental-registration");
  }

  if (industryId === "generic") {
    addOns.push("waste-permitting");
  }

  if (industry.nonEssentialQuestionsIds) {
    for (const questionId in profileData.nonEssentialRadioAnswers) {
      const addOnToAdd = getNonEssentialQuestionAddOn(questionId);
      if (
        addOnToAdd &&
        profileData.nonEssentialRadioAnswers[questionId] &&
        industry.nonEssentialQuestionsIds.includes(questionId)
      ) {
        addOns.push(addOnToAdd);
      }
    }
  }

  return addOns;
};

const getLegalStructureAddOns = (profileData: ProfileData): string[] => {
  if (!profileData.legalStructureId) {
    return [];
  }
  const addOns = [];
  if (profileData.businessPersona === "FOREIGN") {
    if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing-foreign");
    } else if (LookupLegalStructureById(profileData.legalStructureId).hasTradeName) {
      addOns.push("trade-name");
    }
    if (
      profileData.legalStructureId === "s-corporation" ||
      profileData.legalStructureId === "c-corporation"
    ) {
      addOns.push("scorp-ccorp-foreign");
    }
  } else {
    if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing");
    } else if (LookupLegalStructureById(profileData.legalStructureId).hasTradeName) {
      addOns.push("trade-name");
    }
  }

  if (profileData.legalStructureId === "s-corporation") {
    addOns.push("scorp");
  }

  if (profileData.legalStructureId === "nonprofit") {
    addOns.push("nonprofit");
    if (profileData.raffleBingoGames) {
      addOns.push("raffle-bingo-games");
    }
  }
  return addOns;
};

const addMunicipalitySpecificData = async (roadmap: Roadmap, municipalityId: string): Promise<Roadmap> => {
  const municipality = await fetchMunicipalityById(municipalityId);
  if (!municipality) {
    return roadmap;
  }

  return applyTemplateEvalForAllTasks(roadmap, {
    municipalityWebsite: municipality.townWebsite,
    municipalityName: municipality.townName,
    county: municipality.countyName,
    countyClerkPhone: municipality.countyClerkPhone,
    countyClerkWebsite: municipality.countyClerkWebsite,
  });
};

const addNaicsCodeData = (roadmap: Roadmap, naicsCode: string): Roadmap => {
  const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
  return applyTemplateEvalForAllTasks(roadmap, { naicsCode: naicsTemplateValue });
};

const cleanupMunicipalitySpecificData = (roadmap: Roadmap): Roadmap => {
  return applyTemplateEvalForAllTasks(roadmap, {
    municipalityWebsite: "",
    municipalityName: "",
    county: "",
    countyClerkPhone: "",
    countyClerkWebsite: "",
  });
};

const removeTask = (roadmap: Roadmap, taskId: string): Roadmap => {
  return {
    ...roadmap,
    tasks: roadmap.tasks.filter((task) => {
      return task.id !== taskId;
    }),
  };
};

const applyTemplateEvalForAllTasks = (roadmap: Roadmap, evalValues: Record<string, string>): Roadmap => {
  for (const task of roadmap.tasks) {
    if (task.callToActionLink) {
      task.callToActionLink = templateEval(task.callToActionLink, evalValues);
    }
    if (task.callToActionText) {
      task.callToActionText = templateEval(task.callToActionText, evalValues);
    }
    task.contentMd = templateEval(task.contentMd, evalValues);
  }

  return roadmap;
};

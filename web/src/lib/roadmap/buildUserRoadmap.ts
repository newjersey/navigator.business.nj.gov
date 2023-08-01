import { getIsApplicableToFunctionByFieldName } from "@/lib/domain-logic/essentialQuestions";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { getNonEssentialQuestionAddOn } from "@/lib/domain-logic/getNonEssentialQuestionAddOn";
import { isInterstateLogisticsApplicable } from "@/lib/domain-logic/isInterstateLogisticsApplicable";
import { isInterstateMovingApplicable } from "@/lib/domain-logic/isInterstateMovingApplicable";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  fetchMunicipalityById,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";

export const buildUserRoadmap = async (profileData: ProfileData): Promise<Roadmap> => {
  let industryId = profileData.industryId;
  if (profileData.providesStaffingService) {
    industryId = "employment-agency";
  }

  if (profileData.industryId === "interior-designer" && !profileData.certifiedInteriorDesigner) {
    industryId = "generic";
  }

  const addOns: string[] = [
    ...getForeignAddOns(profileData),
    ...getIndustryBasedAddOns(profileData, industryId),
    ...getLegalStructureAddOns(profileData),
  ];

  let roadmap = await buildRoadmap({ industryId: industryId, addOns });

  roadmap = profileData.municipality
    ? await addMunicipalitySpecificData(roadmap, profileData.municipality.id)
    : cleanupMunicipalitySpecificData(roadmap);

  roadmap = addNaicsCodeData(roadmap, profileData.naicsCode);

  if (profileData.businessPersona === "FOREIGN" && profileData.foreignBusinessType === "NEXUS") {
    roadmap = removeTask(roadmap, "business-plan");
    roadmap = removeTask(roadmap, "register-for-ein");
  }

  if (
    getIsApplicableToFunctionByFieldName("carService")(profileData.industryId) &&
    profileData.carService === "BOTH"
  ) {
    roadmap = removeTask(roadmap, "taxi-insurance");
  }

  return roadmap;
};

const getForeignAddOns = (profileData: ProfileData): string[] => {
  const addOns = [];

  if (profileData.foreignBusinessType === "REMOTE_WORKER") {
    addOns.push("foreign-remote-worker");
  }

  if (profileData.foreignBusinessType === "REMOTE_SELLER") {
    addOns.push("foreign-remote-seller");
  }

  if (profileData.foreignBusinessType === "NEXUS") {
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
    profileData.nexusLocationInNewJersey !== false
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

  if (isInterstateLogisticsApplicable(industryId) && profileData.interstateLogistics) {
    addOns.push("interstate-logistics");
  }

  if (isInterstateMovingApplicable(industryId) && profileData.interstateMoving) {
    addOns.push("interstate-moving");
  }

  if (profileData.industryId === "logistics") {
    addOns.push("logistics-modification");
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

  if (industry.nonEssentialQuestionsIds && profileData.nonEssentialRadioAnswers) {
    for (const questionId in profileData.nonEssentialRadioAnswers) {
      const addOnToAdd = getNonEssentialQuestionAddOn(questionId);
      if (addOnToAdd && profileData.nonEssentialRadioAnswers[questionId]) {
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
    municipality: municipality.townName,
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
    municipality: "",
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

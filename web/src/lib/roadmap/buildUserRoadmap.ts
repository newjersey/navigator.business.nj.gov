import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  FormationLegalType,
  FormationLegalTypes,
  LookupIndustryById,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared/";

const enableFormation = (legalStructureId: string): boolean => {
  switch (legalStructureId) {
    case "limited-liability-partnership": {
      return process.env.FEATURE_BUSINESS_LLP === "true";
    }
    case "limited-partnership": {
      return process.env.FEATURE_BUSINESS_LP === "true";
    }
    case "c-corporation": {
      return process.env.FEATURE_BUSINESS_CCORP === "true";
    }
    case "s-corporation": {
      return process.env.FEATURE_BUSINESS_SCORP === "true";
    }
    default:
      return true;
  }
};

export const buildUserRoadmap = async (profileData: ProfileData): Promise<Roadmap> => {
  let industryId = profileData.industryId;
  if (profileData.industryId === "it-consultant" && profileData.providesStaffingService) {
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
    roadmap = removeTask(roadmap, "register-for-ein");
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
    if (profileData.nexusDbaName !== undefined) {
      addOns.push("foreign-nexus-dba-name");
    }
  }

  return addOns;
};

const getIndustryBasedAddOns = (profileData: ProfileData, industryId: string | undefined): string[] => {
  const industry = LookupIndustryById(industryId);
  if (industry.id === "") return [];
  const addOns = [];

  if (
    industry.canHavePermanentLocation &&
    !profileData.homeBasedBusiness &&
    profileData.nexusLocationInNewJersey !== false
  ) {
    addOns.push("permanent-location-business");
  }

  if (profileData.legalStructureId === "s-corporation") {
    addOns.push("scorp");
  }

  if (profileData.liquorLicense) {
    addOns.push("liquor-license");
  }

  if (profileData.requiresCpa) {
    addOns.push("cpa");
  }

  if (profileData.cannabisLicenseType === "ANNUAL") {
    addOns.push("cannabis-annual");
  }

  if (profileData.cannabisLicenseType === "CONDITIONAL") {
    addOns.push("cannabis-conditional");
  }

  if (industry.canBeReseller) {
    addOns.push("reseller");
  }

  return addOns;
};

const getLegalStructureAddOns = (profileData: ProfileData): string[] => {
  if (!profileData.legalStructureId) return [];

  const addOns = [];
  if (profileData.businessPersona !== "FOREIGN") {
    if (
      FormationLegalTypes.includes(profileData.legalStructureId as FormationLegalType) &&
      enableFormation(profileData.legalStructureId)
    ) {
      addOns.push("formation");
    } else if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing");
    } else if (LookupLegalStructureById(profileData.legalStructureId).hasTradeName) {
      addOns.push("trade-name");
    }
  } else {
    if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing-foreign");
    }
    if (
      profileData.legalStructureId === "s-corporation" ||
      profileData.legalStructureId === "c-corporation"
    ) {
      addOns.push("scorp-ccorp-foreign");
    }
  }

  return addOns;
};

const addMunicipalitySpecificData = async (roadmap: Roadmap, municipalityId: string): Promise<Roadmap> => {
  const municipality = await fetchMunicipalityById(municipalityId);
  if (!municipality) return roadmap;

  return applyTemplateEvalForAllTasks(roadmap, {
    municipalityWebsite: municipality.townWebsite,
    municipality: municipality.townName,
    county: municipality.countyName,
    countyClerkPhone: municipality.countyClerkPhone,
    countyClerkWebsite: municipality.countyClerkWebsite,
  });
};

const addNaicsCodeData = (roadmap: Roadmap, naicsCode: string): Roadmap => {
  let naicsTemplateValue = Config.determineNaicsCode.registerForTaxesMissingNAICSCodePlaceholder;
  if (naicsCode) {
    naicsTemplateValue = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
      naicsCode,
    });
  }

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
    steps: roadmap.steps.map((step) => ({
      ...step,
      tasks: step.tasks.filter((task) => task.id !== taskId),
    })),
  };
};

const applyTemplateEvalForAllTasks = (roadmap: Roadmap, evalValues: Record<string, string>): Roadmap => {
  for (const step of roadmap.steps) {
    for (const task of step.tasks) {
      if (task.callToActionLink) {
        task.callToActionLink = templateEval(task.callToActionLink, evalValues);
      }
      if (task.callToActionText) {
        task.callToActionText = templateEval(task.callToActionText, evalValues);
      }
      task.contentMd = templateEval(task.contentMd, evalValues);
    }
  }

  return roadmap;
};

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
  const addOns: string[] =
    profileData.businessPersona === "FOREIGN"
      ? getForeignAddOns(profileData)
      : getIndustryBasedAddOns(profileData);

  let roadmap = await buildRoadmap({ industryId: profileData.industryId, addOns });

  roadmap = profileData.municipality
    ? await addMunicipalitySpecificData(roadmap, profileData.municipality.id)
    : cleanupMunicipalitySpecificData(roadmap);

  roadmap = addNaicsCodeData(roadmap, profileData.naicsCode);

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

  return addOns;
};

const getIndustryBasedAddOns = (profileData: ProfileData): string[] => {
  const addOns = [];
  const industry = LookupIndustryById(profileData.industryId);

  if (industry.canHavePermanentLocation && !profileData.homeBasedBusiness) {
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

  if (profileData.legalStructureId) {
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

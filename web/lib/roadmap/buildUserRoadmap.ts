import { OnboardingData, Roadmap } from "@/lib/types/types";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { templateEval } from "@/lib/utils/helpers";
import { LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";

export const buildUserRoadmap = async (onboardingData: OnboardingData): Promise<Roadmap> => {
  const addOns = [];
  const modifications = [];
  const industry = LookupIndustryById(onboardingData.industryId);

  if (!onboardingData.homeBasedBusiness && !industry.isMobileLocation) {
    addOns.push("physical-location");
  }

  if (onboardingData.liquorLicense) {
    addOns.push("liquor-license");
    modifications.push("liquor-license");
  }

  if (industry.canBeReseller) {
    addOns.push("reseller");
  }

  if (onboardingData.legalStructureId) {
    if (LookupLegalStructureById(onboardingData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing");
    } else if (LookupLegalStructureById(onboardingData.legalStructureId).hasTradeName) {
      addOns.push("trade-name");
    }
  }

  if (!onboardingData.industryId || onboardingData.industryId === "generic") {
    addOns.push("another-industry");
  } else {
    addOns.push(onboardingData.industryId);
    modifications.push(onboardingData.industryId);
  }

  let roadmap = await buildRoadmap({ addOns, modifications });

  if (onboardingData.municipality) {
    roadmap = await addMunicipalitySpecificData(roadmap, onboardingData.municipality.id);
  } else {
    roadmap = cleanupMunicipalitySpecificData(roadmap);
  }

  return roadmap;
};

const addMunicipalitySpecificData = async (roadmap: Roadmap, municipalityId: string): Promise<Roadmap> => {
  const municipality = await fetchMunicipalityById(municipalityId);
  if (!municipality) return roadmap;

  return applyMunicipalityEval(roadmap, {
    municipalityWebsite: municipality.townWebsite,
    municipality: municipality.townName,
    county: municipality.countyName,
    countyClerkPhone: municipality.countyClerkPhone,
    countyClerkWebsite: municipality.countyClerkWebsite,
  });
};

const cleanupMunicipalitySpecificData = (roadmap: Roadmap): Roadmap => {
  return applyMunicipalityEval(roadmap, {
    municipalityWebsite: "",
    municipality: "",
    county: "",
    countyClerkPhone: "",
    countyClerkWebsite: "",
  });
};

const applyMunicipalityEval = (roadmap: Roadmap, evalValues: Record<string, string>): Roadmap => {
  roadmap.steps.forEach((step) => {
    step.tasks.forEach((task) => {
      if (task.callToActionLink) {
        task.callToActionLink = templateEval(task.callToActionLink, evalValues);
      }
      if (task.callToActionText) {
        task.callToActionText = templateEval(task.callToActionText, evalValues);
      }
      task.contentMd = templateEval(task.contentMd, evalValues);
    });
  });

  return roadmap;
};

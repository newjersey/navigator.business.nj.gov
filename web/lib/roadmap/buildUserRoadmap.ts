import { OnboardingData, PublicRecordFilingGroup, Roadmap, TradeNameGroup } from "@/lib/types/types";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { templateEval } from "@/lib/utils/helpers";
import { LookupIndustryById } from "@/shared/industry";

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

  if (onboardingData.legalStructure) {
    if (PublicRecordFilingGroup.includes(onboardingData.legalStructure)) {
      addOns.push("public-record-filing");
    } else if (TradeNameGroup.includes(onboardingData.legalStructure)) {
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
      task.callToActionLink = templateEval(task.callToActionLink, evalValues);
      task.callToActionText = templateEval(task.callToActionText, evalValues);
      task.contentMd = templateEval(task.contentMd, evalValues);
    });
  });

  return roadmap;
};

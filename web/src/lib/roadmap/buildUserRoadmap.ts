import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { LookupIndustryById, LookupLegalStructureById, ProfileData } from "@businessnjgovnavigator/shared";

export const buildUserRoadmap = async (profileData: ProfileData): Promise<Roadmap> => {
  const addOns = [];
  const industry = LookupIndustryById(profileData.industryId);

  if (!profileData.homeBasedBusiness && !industry.isMobileLocation) {
    addOns.push("physical-location");
  }

  if (profileData.legalStructureId === "s-corporation") {
    addOns.push("scorp");
  }

  if (profileData.liquorLicense) {
    addOns.push("liquor-license");
  }

  if (industry.canBeReseller) {
    addOns.push("reseller");
  }

  if (profileData.legalStructureId) {
    if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
      addOns.push("public-record-filing");
    } else if (LookupLegalStructureById(profileData.legalStructureId).hasTradeName) {
      addOns.push("trade-name");
    }
  }

  const industryId = profileData.industryId ?? "generic";

  let roadmap = await buildRoadmap({ industryId, addOns });

  if (profileData.municipality) {
    roadmap = await addMunicipalitySpecificData(roadmap, profileData.municipality.id);
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

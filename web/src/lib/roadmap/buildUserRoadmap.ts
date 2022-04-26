import { fetchMunicipalityById } from "@/lib/async-content-fetchers/fetchMunicipalityById";
import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap, Step, Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { LookupIndustryById, LookupLegalStructureById, ProfileData } from "@businessnjgovnavigator/shared/";

export const buildUserRoadmap = async (profileData: ProfileData): Promise<Roadmap> => {
  const addOns = [];
  const industry = LookupIndustryById(profileData.industryId);

  if (!profileData.homeBasedBusiness && !industry.isMobileLocation) {
    addOns.push("non-home-based-business");
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
    if (profileData.legalStructureId === "limited-liability-company") {
      addOns.push("llc");
    } else if (LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling) {
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
  // eslint-disable-next-line functional/prefer-readonly-type
  const compiledSteps: Step[] = [];
  roadmap.steps.forEach((step) => {
    // eslint-disable-next-line functional/prefer-readonly-type
    const compiledTasks: Task[] = [];
    step.tasks.forEach((task) => {
      let callToActionLink = "";
      let callToActionText = "";
      if (task.callToActionLink) {
        callToActionLink = templateEval(task.callToActionLink, evalValues);
      }
      if (task.callToActionText) {
        callToActionText = templateEval(task.callToActionText, evalValues);
      }
      const contentMd = templateEval(task.contentMd, evalValues);

      const newTask = {
        ...task,
        callToActionLink,
        callToActionText,
        contentMd,
      };
      compiledTasks.push(newTask);
    });
    const newStep = {
      ...step,
      tasks: compiledTasks,
    };
    compiledSteps.push(newStep);
  });

  return {
    steps: compiledSteps,
  };
};

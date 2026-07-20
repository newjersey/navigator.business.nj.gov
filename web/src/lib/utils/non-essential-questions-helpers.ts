import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { LookupSectorTypeById } from "@businessnjgovnavigator/shared/sector";

export const hasNonEssentialQuestions = (profileData: ProfileData): boolean => {
  if (
    doesIndustryHaveNonEssentialQuestions(profileData) ||
    doesSectorHaveNonEssentialQuestions(profileData) ||
    getPersonaBasedNonEssentialQuestionsIds(profileData).length > 0
  ) {
    return true;
  }
  return false;
};

export const doesIndustryHaveNonEssentialQuestions = (profileData: ProfileData): boolean => {
  if (profileData.businessPersona !== "OWNING") {
    return LookupIndustryById(profileData.industryId).nonEssentialQuestionsIds.length > 0;
  }
  return false;
};

export const doesSectorHaveNonEssentialQuestions = (profileData: ProfileData): boolean => {
  if (profileData.sectorId) {
    return LookupSectorTypeById(profileData.sectorId).nonEssentialQuestionsIds.length > 0;
  }
  return false;
};

export const getPersonaBasedNonEssentialQuestionsIds = (profileData: ProfileData): string[] => {
  const nonEssentialQuestionIds: string[] = [];

  if (profileData.businessPersona === "STARTING") {
    nonEssentialQuestionIds.push("vacantPropertyOwner");
  }
  if (profileData.businessPersona === "OWNING") {
    if (profileData.sectorId === "arts-entertainment-and-recreation") {
      nonEssentialQuestionIds.push("carnivalRideOwningBusiness");
      nonEssentialQuestionIds.push("travelingCircusOrCarnivalOwningBusiness");
    }
    if (
      profileData.industryId === "real-estate-investor" ||
      profileData.sectorId === "real-estate"
    ) {
      nonEssentialQuestionIds.push("vacantPropertyOwner");
    }
  }

  return nonEssentialQuestionIds;
};

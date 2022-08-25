import { formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { UserData } from "@shared/userData";
import { UpdateOperatingPhase } from "../types";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const currentPhase = userData.profileData.operatingPhase;
  let updatedPhase: OperatingPhaseId = userData.profileData.operatingPhase;
  let updatedIsHideableRoadmapOpen: boolean = userData.preferences.isHideableRoadmapOpen;

  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  const hasCompletedFormation = userData.taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = userData.taskProgress[taxTaskId] === "COMPLETED";

  if (userData.profileData.businessPersona === "OWNING") {
    if (currentPhase !== "UP_AND_RUNNING_OWNING") {
      updatedPhase = "UP_AND_RUNNING_OWNING";
    }
  } else {
    if (currentPhase === "GUEST_MODE") {
      updatedPhase = isPublicFiling ? "NEEDS_TO_FORM" : "NEEDS_TO_REGISTER_FOR_TAXES";
    }

    if (currentPhase === "NEEDS_TO_FORM" && isPublicFiling && hasCompletedFormation) {
      updatedPhase = !hasCompletedTaxes ? "NEEDS_TO_REGISTER_FOR_TAXES" : "FORMED_AND_REGISTERED";
    } else if (currentPhase === "NEEDS_TO_REGISTER_FOR_TAXES" && isPublicFiling && !hasCompletedFormation) {
      updatedPhase = "NEEDS_TO_FORM";
    } else if (currentPhase === "NEEDS_TO_FORM" && !isPublicFiling) {
      updatedPhase = !hasCompletedTaxes ? "NEEDS_TO_REGISTER_FOR_TAXES" : "FORMED_AND_REGISTERED";
    }

    if (currentPhase === "NEEDS_TO_REGISTER_FOR_TAXES" && hasCompletedTaxes) {
      updatedPhase = "FORMED_AND_REGISTERED";
    } else if (currentPhase === "FORMED_AND_REGISTERED") {
      if (!hasCompletedTaxes && ((isPublicFiling && hasCompletedFormation) || !isPublicFiling)) {
        updatedPhase = "NEEDS_TO_REGISTER_FOR_TAXES";
      } else if (isPublicFiling && !hasCompletedFormation) {
        updatedPhase = "NEEDS_TO_FORM";
      }
    }
  }

  if (currentPhase === "UP_AND_RUNNING" && isPublicFiling && !hasCompletedFormation) {
    updatedPhase = "NEEDS_TO_FORM";
    updatedIsHideableRoadmapOpen = false;
  } else if (currentPhase === "UP_AND_RUNNING" && !hasCompletedTaxes) {
    updatedPhase = "NEEDS_TO_REGISTER_FOR_TAXES";
    updatedIsHideableRoadmapOpen = false;
  }

  return {
    ...userData,
    profileData: {
      ...userData.profileData,
      operatingPhase: updatedPhase,
    },
    preferences: {
      ...userData.preferences,
      isHideableRoadmapOpen: updatedIsHideableRoadmapOpen,
    },
  };
};

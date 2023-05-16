import { formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { BusinessPersona } from "@shared/profileData";
import { TaskProgress, UserData } from "@shared/userData";
import { UpdateOperatingPhase } from "../types";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const originalPhase = userData.profileData.operatingPhase;
  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  let updatedIsHideableRoadmapOpen: boolean = userData.preferences.isHideableRoadmapOpen;

  const newPhase = getNewPhase({
    businessPersona: userData.profileData.businessPersona,
    taskProgress: userData.taskProgress,
    isPublicFiling: isPublicFiling,
    currentPhase: originalPhase,
  });

  const phaseHasChanged = newPhase !== originalPhase;
  if (originalPhase === "UP_AND_RUNNING" && phaseHasChanged) {
    updatedIsHideableRoadmapOpen = false;
  }

  return {
    ...userData,
    profileData: {
      ...userData.profileData,
      operatingPhase: newPhase,
    },
    preferences: {
      ...userData.preferences,
      isHideableRoadmapOpen: updatedIsHideableRoadmapOpen,
      phaseNewlyChanged: phaseHasChanged || userData.preferences.phaseNewlyChanged,
    },
  };
};

const getNewPhase = ({
  businessPersona,
  currentPhase,
  isPublicFiling,
  taskProgress,
}: {
  businessPersona: BusinessPersona;
  currentPhase: OperatingPhaseId;
  isPublicFiling: boolean;
  taskProgress: Record<string, TaskProgress>;
}): OperatingPhaseId => {
  const hasCompletedFormation = taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = taskProgress[taxTaskId] === "COMPLETED";

  if (businessPersona === "OWNING" && currentPhase !== "UP_AND_RUNNING_OWNING") {
    return "UP_AND_RUNNING_OWNING";
  }

  if (currentPhase === "GUEST_MODE") {
    return isPublicFiling ? "NEEDS_TO_FORM" : "NEEDS_TO_REGISTER_FOR_TAXES";
  }

  if (isPublicFiling && !hasCompletedFormation) return "NEEDS_TO_FORM";

  if (!hasCompletedTaxes) return "NEEDS_TO_REGISTER_FOR_TAXES";

  if (hasCompletedTaxes && currentPhase !== "UP_AND_RUNNING") return "FORMED_AND_REGISTERED";

  return currentPhase;
};

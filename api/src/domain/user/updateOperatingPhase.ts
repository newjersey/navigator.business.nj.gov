import { businessStructureTaskId, formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { BusinessPersona, ForeignBusinessType } from "@shared/profileData";
import { TaskProgress, UserData } from "@shared/userData";
import { UpdateOperatingPhase } from "../types";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const originalPhase = userData.profileData.operatingPhase;
  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  let updatedIsHideableRoadmapOpen: boolean = userData.preferences.isHideableRoadmapOpen;

  const newPhase = getNewPhase({
    businessPersona: userData.profileData.businessPersona,
    foreignBusinessType: userData.profileData.foreignBusinessType,
    taskProgress: userData.taskProgress,
    isPublicFiling: isPublicFiling,
    currentPhase: originalPhase,
    legalStructureId: userData.profileData.legalStructureId,
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
  foreignBusinessType,
  currentPhase,
  isPublicFiling,
  taskProgress,
  legalStructureId,
}: {
  businessPersona: BusinessPersona;
  foreignBusinessType: ForeignBusinessType;
  currentPhase: OperatingPhaseId;
  isPublicFiling: boolean;
  taskProgress: Record<string, TaskProgress>;
  legalStructureId: string | undefined;
}): OperatingPhaseId => {
  const hasCompletedBusinessStructure =
    taskProgress[businessStructureTaskId] === "COMPLETED" || !!legalStructureId;
  const hasCompletedFormation = taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = taskProgress[taxTaskId] === "COMPLETED";

  if (businessPersona === "OWNING") {
    return "UP_AND_RUNNING_OWNING";
  }

  if (
    businessPersona === "FOREIGN" &&
    (foreignBusinessType === "REMOTE_WORKER" || foreignBusinessType === "REMOTE_SELLER")
  ) {
    return "NEEDS_TO_FORM";
  }

  if (currentPhase === "GUEST_MODE") {
    return "NEEDS_BUSINESS_STRUCTURE";
  }

  if (hasCompletedBusinessStructure) {
    if (isPublicFiling && !hasCompletedFormation) return "NEEDS_TO_FORM";

    if (!hasCompletedTaxes) return "NEEDS_TO_REGISTER_FOR_TAXES";

    if (hasCompletedTaxes && currentPhase !== "UP_AND_RUNNING") return "FORMED_AND_REGISTERED";

    return currentPhase;
  } else {
    return "NEEDS_BUSINESS_STRUCTURE";
  }
};

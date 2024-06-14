import { UpdateOperatingPhase } from "@domain/types";
import { isRemoteWorkerOrSellerBusiness } from "@shared/domain-logic/businessPersonaHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { businessStructureTaskId, formationTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { BusinessPersona } from "@shared/profileData";
import { modifyCurrentBusiness } from "@shared/test";
import { TaskProgress, UserData } from "@shared/userData";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const currentBusiness = getCurrentBusiness(userData);
  const originalPhase = currentBusiness.profileData.operatingPhase;
  const isPublicFiling = LookupLegalStructureById(
    currentBusiness.profileData.legalStructureId
  ).requiresPublicFiling;
  const isRemoteSellerOrWorker = isRemoteWorkerOrSellerBusiness(currentBusiness);
  let updatedIsHideableRoadmapOpen: boolean = currentBusiness.preferences.isHideableRoadmapOpen;

  const newPhase = getNewPhase({
    businessPersona: currentBusiness.profileData.businessPersona,
    isRemoteSellerOrWorker: isRemoteSellerOrWorker,
    taskProgress: currentBusiness.taskProgress,
    isPublicFiling: isPublicFiling,
    currentPhase: originalPhase,
    legalStructureId: currentBusiness.profileData.legalStructureId,
  });

  const phaseHasChanged = newPhase !== originalPhase;
  if (originalPhase === OperatingPhaseId.UP_AND_RUNNING && phaseHasChanged) {
    updatedIsHideableRoadmapOpen = false;
  }

  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    profileData: {
      ...business.profileData,
      operatingPhase: newPhase,
    },
    preferences: {
      ...business.preferences,
      isHideableRoadmapOpen: updatedIsHideableRoadmapOpen,
      phaseNewlyChanged: phaseHasChanged || currentBusiness.preferences.phaseNewlyChanged,
    },
  }));
};

const getNewPhase = ({
  businessPersona,
  currentPhase,
  isPublicFiling,
  taskProgress,
  legalStructureId,
  isRemoteSellerOrWorker,
}: {
  businessPersona: BusinessPersona;
  currentPhase: OperatingPhaseId;
  isPublicFiling: boolean;
  taskProgress: Record<string, TaskProgress>;
  legalStructureId: string | undefined;
  isRemoteSellerOrWorker: boolean;
}): OperatingPhaseId => {
  const hasCompletedBusinessStructure =
    taskProgress[businessStructureTaskId] === "COMPLETED" || !!legalStructureId;
  const hasCompletedFormation = taskProgress[formationTaskId] === "COMPLETED";

  if (businessPersona === "OWNING") {
    return OperatingPhaseId.UP_AND_RUNNING_OWNING;
  }

  if (businessPersona === "FOREIGN" && isRemoteSellerOrWorker) {
    return OperatingPhaseId.REMOTE_SELLER_WORKER;
  }

  if (currentPhase === OperatingPhaseId.GUEST_MODE) {
    return OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE;
  }

  if (hasCompletedBusinessStructure) {
    if (isPublicFiling && !hasCompletedFormation) return OperatingPhaseId.NEEDS_TO_FORM;

    if (currentPhase !== OperatingPhaseId.UP_AND_RUNNING) return OperatingPhaseId.FORMED;

    return OperatingPhaseId.UP_AND_RUNNING;
  } else {
    return OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE;
  }
};

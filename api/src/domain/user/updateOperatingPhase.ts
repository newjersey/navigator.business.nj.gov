import { UpdateOperatingPhase } from "@domain/types";
import { determineForeignBusinessType } from "@shared/domain-logic/determineForeignBusinessType";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { businessStructureTaskId, formationTaskId, taxTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { BusinessPersona, ForeignBusinessTypeId } from "@shared/profileData";
import { modifyCurrentBusiness } from "@shared/test";
import { TaskProgress, UserData } from "@shared/userData";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const currentBusiness = getCurrentBusiness(userData);
  const originalPhase = currentBusiness.profileData.operatingPhase;
  const isPublicFiling = LookupLegalStructureById(
    currentBusiness.profileData.legalStructureId
  ).requiresPublicFiling;
  let updatedIsHideableRoadmapOpen: boolean = currentBusiness.preferences.isHideableRoadmapOpen;

  const newPhase = getNewPhase({
    businessPersona: currentBusiness.profileData.businessPersona,
    foreignBusinessTypeIds: currentBusiness.profileData.foreignBusinessTypeIds,
    taskProgress: currentBusiness.taskProgress,
    isPublicFiling: isPublicFiling,
    currentPhase: originalPhase,
    legalStructureId: currentBusiness.profileData.legalStructureId,
  });

  const phaseHasChanged = newPhase !== originalPhase;
  if (originalPhase === "UP_AND_RUNNING" && phaseHasChanged) {
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
  foreignBusinessTypeIds,
}: {
  businessPersona: BusinessPersona;
  currentPhase: OperatingPhaseId;
  isPublicFiling: boolean;
  taskProgress: Record<string, TaskProgress>;
  legalStructureId: string | undefined;
  foreignBusinessTypeIds: ForeignBusinessTypeId[];
}): OperatingPhaseId => {
  const hasCompletedBusinessStructure =
    taskProgress[businessStructureTaskId] === "COMPLETED" || !!legalStructureId;
  const hasCompletedFormation = taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = taskProgress[taxTaskId] === "COMPLETED";
  const isRemoteSellerOrWorker =
    determineForeignBusinessType(foreignBusinessTypeIds) === "REMOTE_SELLER" ||
    determineForeignBusinessType(foreignBusinessTypeIds) === "REMOTE_WORKER";

  if (businessPersona === "OWNING") {
    return "UP_AND_RUNNING_OWNING";
  }

  if (businessPersona === "FOREIGN" && isRemoteSellerOrWorker) {
    return "REMOTE_SELLER_WORKER";
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

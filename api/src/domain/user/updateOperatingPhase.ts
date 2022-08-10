import { formationTaskId } from "@shared/domain-logic/taskIds";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { UserData } from "@shared/userData";
import { UpdateOperatingPhase } from "../types";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const currentPhase = userData.profileData.operatingPhase;
  let updatedPhase: OperatingPhaseId = userData.profileData.operatingPhase;

  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  const hasCompletedFormation = userData.taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = userData.taskProgress["register-for-taxes"] === "COMPLETED";

  if (userData.profileData.businessPersona === "OWNING") {
    if (currentPhase !== "UP_AND_RUNNING") {
      updatedPhase = "UP_AND_RUNNING";
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

  return {
    ...userData,
    profileData: {
      ...userData.profileData,
      operatingPhase: updatedPhase,
    },
  };
};

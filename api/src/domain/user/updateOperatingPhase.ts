import { formationTaskId } from "@shared/gradualGraduationStages";
import { LookupLegalStructureById } from "@shared/legalStructure";
import { OperatingPhase } from "@shared/profileData";
import { UserData } from "@shared/userData";
import { UpdateOperatingPhase } from "../types";

export const updateOperatingPhase: UpdateOperatingPhase = (userData: UserData): UserData => {
  const currentPhase = userData.profileData.operatingPhase;
  let updatedPhase: OperatingPhase = userData.profileData.operatingPhase;

  const isPublicFiling = LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  const hasCompletedFormation = userData.taskProgress[formationTaskId] === "COMPLETED";
  const hasCompletedTaxes = userData.taskProgress["register-for-taxes"] === "COMPLETED";

  if (currentPhase === "GUEST_MODE") {
    updatedPhase = isPublicFiling ? "NEEDS_TO_FORM" : "NEEDS_TO_REGISTER_FOR_TAXES";
  }

  if (currentPhase === "NEEDS_TO_FORM" && isPublicFiling && hasCompletedFormation) {
    updatedPhase = "NEEDS_TO_REGISTER_FOR_TAXES";
  } else if (currentPhase === "NEEDS_TO_REGISTER_FOR_TAXES" && isPublicFiling && !hasCompletedFormation) {
    updatedPhase = "NEEDS_TO_FORM";
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

  return {
    ...userData,
    profileData: {
      ...userData.profileData,
      operatingPhase: updatedPhase,
    },
  };
};

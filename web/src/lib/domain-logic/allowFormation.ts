import {
  BusinessPersona,
  castPublicFilingLegalTypeToFormationType,
  FormationLegalType,
  PublicFilingLegalType,
  publicFilingLegalTypes,
} from "@businessnjgovnavigator/shared";

export const allowFormation = (
  legalStructureId: string | undefined,
  persona: BusinessPersona | undefined
): boolean => {
  const featureFlagMap: Partial<Record<FormationLegalType, boolean>> = {
    "foreign-limited-partnership": process.env.FEATURE_BUSINESS_FLP === "true",
  };

  if (publicFilingLegalTypes.includes(legalStructureId as PublicFilingLegalType)) {
    return (
      featureFlagMap[
        castPublicFilingLegalTypeToFormationType(legalStructureId as PublicFilingLegalType, persona)
      ] ?? true
    );
  }

  return false;
};

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
    "foreign-limited-liability-company": process.env.FEATURE_BUSINESS_FLC == "true",
    "foreign-limited-liability-partnership": process.env.FEATURE_BUSINESS_FLLP == "true",
    "foreign-limited-partnership": process.env.FEATURE_BUSINESS_FLP == "true",
    "foreign-s-corporation": process.env.FEATURE_BUSINESS_FCORP == "true",
    "foreign-c-corporation": process.env.FEATURE_BUSINESS_FCORP == "true",
  };

  if (publicFilingLegalTypes.includes(legalStructureId as PublicFilingLegalType)) {
    if (persona != "FOREIGN") {
      return true;
    } else {
      return (
        featureFlagMap[
          castPublicFilingLegalTypeToFormationType(legalStructureId as PublicFilingLegalType, persona)
        ] ?? true
      );
    }
  } else {
    return false;
  }
};

import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";

export const isInterstateMovingApplicable = (industryId: string | undefined): boolean => {
  return (
    !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateTransportApplicable &&
    industryId === "moving-company"
  );
};

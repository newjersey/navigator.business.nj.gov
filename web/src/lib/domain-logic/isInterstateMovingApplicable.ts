import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isInterstateMovingApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateMovingApplicable;
};

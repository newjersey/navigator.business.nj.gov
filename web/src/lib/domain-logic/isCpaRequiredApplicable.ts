import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isCpaRequiredApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId)?.industryOnboardingQuestions.isCpaRequiredApplicable;
};

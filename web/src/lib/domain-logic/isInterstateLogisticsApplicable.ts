import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isInterstateLogisticsApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateLogisticsApplicable;
};

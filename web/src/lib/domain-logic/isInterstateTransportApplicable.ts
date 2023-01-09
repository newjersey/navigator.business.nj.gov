import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isInterstateTransportApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateTransportApplicable;
};

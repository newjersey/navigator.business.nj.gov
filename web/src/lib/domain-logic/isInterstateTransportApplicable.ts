import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";

export const isInterstateTransportApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateTransportApplicable;
};

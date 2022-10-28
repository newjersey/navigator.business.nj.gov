import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isCarServiceApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId)?.industryOnboardingQuestions.isCarServiceApplicable;
};

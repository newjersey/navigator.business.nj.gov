import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isRetailPierceEarsApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.retailWillPierceEars;
};

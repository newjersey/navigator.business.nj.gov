import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isRetailSellMilkApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).industryOnboardingQuestions.retailWillSellMilk;
};

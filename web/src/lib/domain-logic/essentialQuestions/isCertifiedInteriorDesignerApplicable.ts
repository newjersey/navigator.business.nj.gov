import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isCertifiedInteriorDesignerApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId)?.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable;
};

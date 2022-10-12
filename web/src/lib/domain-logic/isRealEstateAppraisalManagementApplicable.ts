import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isRealEstateAppraisalManagementApplicable = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId)?.industryOnboardingQuestions
    .isRealEstateAppraisalManagementApplicable;
};

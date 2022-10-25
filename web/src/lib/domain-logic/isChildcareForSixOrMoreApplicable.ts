import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";

export const isChildcareForSixOrMoreApplicable = (industryId: string | undefined): boolean => {
  return (
    !!LookupIndustryById(industryId).industryOnboardingQuestions.isChildcareForSixOrMore &&
    industryId === "daycare"
  );
};

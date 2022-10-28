import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";

export const isInterstateLogisticsApplicable = (industryId: string | undefined): boolean => {
  return (
    !!LookupIndustryById(industryId).industryOnboardingQuestions.isInterstateTransportApplicable &&
    industryId === "logistics"
  );
};

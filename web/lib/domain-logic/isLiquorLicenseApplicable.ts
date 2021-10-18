import { LookupIndustryById } from "@/shared/industry";

export const isLiquorLicenseApplicable = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.isLiquorLicenseApplicable ?? false;
};

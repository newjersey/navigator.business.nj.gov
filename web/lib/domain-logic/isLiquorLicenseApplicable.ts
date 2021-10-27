import { LookupIndustryById } from "@businessnjgovnavigator/shared";

export const isLiquorLicenseApplicable = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.isLiquorLicenseApplicable ?? false;
};

import { LookupIndustryById } from "@shared/industry";

export const convertIndustryToLicenseType = (industryId: string | undefined): string => {
  const industry = LookupIndustryById(industryId);
  if (industry?.licenseType) {
    return industry.licenseType;
  }

  throw `${industry} does not have a license type`;
};

export const industryHasALicenseType = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.licenseType !== undefined ?? false;
};

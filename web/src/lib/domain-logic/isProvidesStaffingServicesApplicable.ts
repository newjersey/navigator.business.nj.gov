import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isProvidesStaffingServicesApplicable = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.isProvidesStaffingServicesApplicable;
};

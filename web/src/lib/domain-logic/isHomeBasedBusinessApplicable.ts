import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

export const isHomeBasedBusinessApplicable = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.canBeHomeBased ?? false;
};
